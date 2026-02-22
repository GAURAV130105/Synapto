import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { YoutubeTranscript } from 'youtube-transcript'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Format seconds into MM:SS or HH:MM:SS
function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Clean HTML entities and minor artifacts from transcript text
// Preserves important markers like [Music] for context
function cleanText(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '') // Remove any HTML tags
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Capitalize first letter of a sentence
function capitalizeSentence(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

interface TranscriptSegment {
  startTime: number
  duration: number
  text: string
  formattedTime: string
}

interface RawCaptionItem {
  startTime: number
  duration: number
  text: string
}

/**
 * Group raw caption items into natural sentence-like segments.
 * Instead of grouping by arbitrary char count, we:
 * 1. Combine items until we hit a sentence boundary (period, question mark, exclamation)
 * 2. Or until we've accumulated ~15 seconds of content
 * 3. Or until the gap between items exceeds 2 seconds (indicates a natural pause)
 * This produces segments that match the natural speech patterns of the video.
 */
function groupIntoSegments(rawItems: RawCaptionItem[]): TranscriptSegment[] {
  if (rawItems.length === 0) return []

  const segments: TranscriptSegment[] = []
  let currentText = ''
  let currentStart = rawItems[0].startTime
  let lastEnd = rawItems[0].startTime

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i]
    const itemEnd = item.startTime + item.duration
    const gap = item.startTime - lastEnd

    // Check if we should start a new segment
    const shouldBreak = (
      // Large gap between items (natural pause in speech)
      gap > 2.0 ||
      // Accumulated enough time (~12 seconds max per segment)
      (item.startTime - currentStart > 12 && currentText.length > 30) ||
      // Previous text ended with sentence-ending punctuation and we have enough text
      (currentText.length > 40 && /[.!?]$/.test(currentText.trim()))
    )

    if (shouldBreak && currentText.trim()) {
      segments.push({
        startTime: currentStart,
        duration: lastEnd - currentStart,
        text: capitalizeSentence(currentText.trim()),
        formattedTime: formatTimestamp(currentStart),
      })
      currentText = ''
      currentStart = item.startTime
    }

    // Add space between items
    if (currentText && !currentText.endsWith(' ')) {
      currentText += ' '
    }
    currentText += item.text

    lastEnd = itemEnd
  }

  // Push final segment
  if (currentText.trim()) {
    segments.push({
      startTime: currentStart,
      duration: lastEnd - currentStart,
      text: capitalizeSentence(currentText.trim()),
      formattedTime: formatTimestamp(currentStart),
    })
  }

  return segments
}

/**
 * POST /api/content/transcript
 * Fetches YouTube captions/transcript with accurate timestamps and saves to DB.
 * Returns both segments (with timestamps) and full plain text.
 * 
 * Uses multiple methods with fallbacks:
 * 1. youtube-transcript npm package (most reliable)
 * 2. Piped API (privacy-friendly proxy)
 * 3. Direct YouTube timedtext API (scraping fallback)
 * 4. Groq AI generation (last resort - generates educational content)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content_id, video_id, title, description, force } = await request.json()

    if (!content_id || !video_id) {
      return NextResponse.json({ error: 'content_id and video_id required' }, { status: 400 })
    }

    // ── Cache check: return existing transcript if already fetched ──
    if (!force) {
      const { data: existing } = await supabase
        .from('content')
        .select('transcript, transcript_status')
        .eq('id', content_id)
        .single()

      if (existing?.transcript && ['completed', 'unavailable'].includes(existing.transcript_status)) {
        console.log(`[Transcript] Cache hit for ${video_id} (status: ${existing.transcript_status})`)
        return NextResponse.json({
          transcript: existing.transcript,
          segments: [],
          status: existing.transcript_status,
          method: 'cached',
        })
      }
    }

    // Update status to processing
    await supabase
      .from('content')
      .update({ transcript_status: 'processing' })
      .eq('id', content_id)

    let segments: TranscriptSegment[] = []
    let transcript = ''
    let method = ''

    // ── Method 1: youtube-transcript package (returns timestamped items) ──
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(video_id, { lang: 'en' })
      if (transcriptItems && transcriptItems.length > 0) {
        // Build raw caption items preserving original timestamps
        const rawItems: RawCaptionItem[] = transcriptItems
          .map(item => ({
            startTime: item.offset / 1000, // Convert ms to seconds
            duration: item.duration / 1000,
            text: cleanText(item.text),
          }))
          .filter(item => item.text.length > 0)

        // Group into natural sentence-like segments
        segments = groupIntoSegments(rawItems)
        transcript = segments.map(s => s.text).join(' ')
        method = 'youtube_captions'
      }
    } catch (err) {
      console.warn(`[Transcript] Primary method failed for ${video_id}: ${(err as Error).message} — trying fallbacks...`)
    }

    // ── Method 2: Piped API (privacy-friendly YouTube proxy) ──
    if (!transcript) {
      try {
        const pipedInstances = [
          'https://pipedapi.kavin.rocks',
          'https://pipedapi.adminforge.de',
          'https://api-piped.mha.fi',
        ]

        for (const instance of pipedInstances) {
          try {
            const res = await fetch(`${instance}/streams/${video_id}`, {
              signal: AbortSignal.timeout(8000),
            })
            if (!res.ok) continue
            const data = await res.json()

            // Get subtitle tracks
            const subtitles = data.subtitles || []
            const englishSub = subtitles.find((s: any) =>
              s.code === 'en' || s.name?.toLowerCase().includes('english')
            ) || subtitles[0]

            if (englishSub?.url) {
              const subRes = await fetch(englishSub.url)
              const subText = await subRes.text()

              // Parse VTT or XML format
              const rawItems: RawCaptionItem[] = []

              if (subText.includes('WEBVTT')) {
                // Parse WebVTT
                const cueRegex = /(\d{2}:\d{2}[:.]\d{3})\s*-->\s*(\d{2}:\d{2}[:.]\d{3})\s*\n([\s\S]*?)(?=\n\n|\n\d{2}:|$)/g
                let match
                while ((match = cueRegex.exec(subText)) !== null) {
                  const startParts = match[1].replace('.', ':').split(':').map(Number)
                  const endParts = match[2].replace('.', ':').split(':').map(Number)
                  const start = startParts[0] * 60 + startParts[1] + (startParts[2] || 0) / 1000
                  const end = endParts[0] * 60 + endParts[1] + (endParts[2] || 0) / 1000
                  const text = cleanText(match[3])
                  if (text) {
                    rawItems.push({ startTime: start, duration: end - start, text })
                  }
                }
              } else {
                // Parse XML timed text
                const textRegex = /<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([^<]*)<\/text>/g
                let match
                while ((match = textRegex.exec(subText)) !== null) {
                  const text = cleanText(match[3])
                  if (text) {
                    rawItems.push({
                      startTime: parseFloat(match[1]),
                      duration: parseFloat(match[2]),
                      text,
                    })
                  }
                }
              }

              if (rawItems.length > 0) {
                segments = groupIntoSegments(rawItems)
                transcript = segments.map(s => s.text).join(' ')
                method = 'piped_api'
                break
              }
            }
          } catch {
            continue
          }
        }
      } catch (err) {
        console.warn(`[Transcript] Piped API failed for ${video_id}: ${(err as Error).message}`)
      }
    }

    // ── Method 3: Direct YouTube timedtext API ──
    if (!transcript) {
      try {
        const captionUrl = `https://www.youtube.com/watch?v=${video_id}`
        const pageRes = await fetch(captionUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          }
        })
        const html = await pageRes.text()

        const captionMatch = html.match(/"captionTracks":\s*\[(.*?)\]/)
        if (captionMatch) {
          const trackData = captionMatch[1]
          // Prefer English captions
          const urlMatches = [...trackData.matchAll(/"baseUrl":\s*"(.*?)"/g)]
          const langMatches = [...trackData.matchAll(/"languageCode":\s*"(.*?)"/g)]

          let captionApiUrl = ''
          for (let i = 0; i < urlMatches.length; i++) {
            const lang = langMatches[i]?.[1] || ''
            if (lang === 'en' || lang.startsWith('en-')) {
              captionApiUrl = urlMatches[i][1].replace(/\\u0026/g, '&')
              break
            }
          }
          // Fallback to first available
          if (!captionApiUrl && urlMatches.length > 0) {
            captionApiUrl = urlMatches[0][1].replace(/\\u0026/g, '&')
          }

          if (captionApiUrl) {
            const captionRes = await fetch(captionApiUrl)
            const captionXml = await captionRes.text()

            // Parse timed text XML
            const textRegex = /<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([^<]*)<\/text>/g
            const rawItems: RawCaptionItem[] = []
            let m
            while ((m = textRegex.exec(captionXml)) !== null) {
              const text = cleanText(m[3])
              if (text) {
                rawItems.push({
                  startTime: parseFloat(m[1]),
                  duration: parseFloat(m[2]),
                  text,
                })
              }
            }

            if (rawItems.length > 0) {
              segments = groupIntoSegments(rawItems)
              transcript = segments.map(s => s.text).join(' ')
              method = 'youtube_timedtext'
            }
          }
        }
      } catch (err) {
        console.warn(`[Transcript] Direct timedtext failed for ${video_id}: ${(err as Error).message}`)
      }
    }

    // ── Method 4: Use Groq AI to generate educational content ──
    if (!transcript && GROQ_API_KEY) {
      try {
        const videoTitle = title || 'Educational Video'
        const videoDesc = description || ''

        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are an educational content creator. Generate a detailed, structured educational transcript for a video based on its title and description. 
The transcript should:
- Be written as if someone is explaining the topic in a lecture
- Cover key concepts related to the title
- Be educational and accessible
- Be 300-500 words long
- Include an introduction, main points, and conclusion
- Format it with clear paragraph breaks
- DO NOT mention that you are an AI or that this is generated content
- Write as if this is the actual spoken content of the video`,
              },
              {
                role: 'user',
                content: `Generate an educational transcript for a video titled: "${videoTitle}"${videoDesc ? `\n\nVideo description: ${videoDesc}` : ''}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const aiTranscript = data.choices[0]?.message?.content || ''
          if (aiTranscript) {
            transcript = aiTranscript
            // Create artificial segments from paragraphs for AI-generated content
            const paragraphs = aiTranscript.split(/\n\n+/).filter((p: string) => p.trim())
            let timeOffset = 0
            segments = paragraphs.map((p: string) => {
              const wordCount = p.split(/\s+/).length
              const segDuration = Math.max(10, wordCount * 0.5) // ~2 words/sec
              const seg: TranscriptSegment = {
                startTime: timeOffset,
                duration: segDuration,
                text: p.trim(),
                formattedTime: formatTimestamp(timeOffset),
              }
              timeOffset += segDuration + 1
              return seg
            })
            method = 'ai_generated'
          }
        }
      } catch (err) {
        console.warn(`[Transcript] Groq AI fallback failed for ${video_id}: ${(err as Error).message}`)
      }
    }

    // ── Save result ──
    if (transcript) {
      const prefix = method === 'ai_generated'
        ? '[AI-Generated Educational Content]\n\n'
        : ''

      const finalTranscript = prefix + transcript

      // Store segments as JSON in transcript_data field
      const updateData: Record<string, unknown> = {
        transcript: finalTranscript,
        transcript_status: 'completed',
      }

      // Try to store segments in transcript_segments field if it exists
      try {
        await supabase
          .from('content')
          .update({
            ...updateData,
            transcript_segments: JSON.stringify(segments),
          })
          .eq('id', content_id)
      } catch {
        // If transcript_segments column doesn't exist, just save transcript
        await supabase
          .from('content')
          .update(updateData)
          .eq('id', content_id)
      }

      return NextResponse.json({
        transcript: finalTranscript,
        segments,
        status: 'completed',
        method,
        segmentCount: segments.length,
      })
    }

    // ── All methods failed ──
    const fallbackMessage = `This video's transcript could not be automatically retrieved. The video may not have captions enabled, or the captions may be restricted.\n\nYou can still use the Language Leveler and Audio features by manually providing text.`

    await supabase
      .from('content')
      .update({
        transcript: fallbackMessage,
        transcript_status: 'unavailable',
      })
      .eq('id', content_id)

    return NextResponse.json({
      transcript: fallbackMessage,
      segments: [],
      status: 'unavailable',
      message: 'All transcript methods failed',
    })
  } catch (error: any) {
    console.error('[API] Transcript error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}
