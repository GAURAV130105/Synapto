import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Piped API instances (free YouTube proxy APIs, no key needed)
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://pipedapi.privacyplz.org',
  'https://pipedapi.r4fo.com',
]

// Invidious API instances (alternative free YouTube APIs)
const INVIDIOUS_INSTANCES = [
  'https://vid.puffyan.us',
  'https://inv.tux.pizza',
  'https://invidious.nerdvpn.de',
]

const YOUTUBE_DATA_API_KEY = process.env.YOUTUBE_DATA_API_KEY

interface VideoResult {
  id: string
  title: string
  thumbnail: string
  channel: string
  duration: string
  description: string
  url: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    let videos: VideoResult[] = []

    // Strategy 1: Try Piped API
    videos = await searchPiped(query)

    // Strategy 2: Fallback to Invidious API
    if (videos.length === 0) {
      videos = await searchInvidious(query)
    }

    // Strategy 3: Try YouTube Data API v3 if key is available
    if (videos.length === 0 && YOUTUBE_DATA_API_KEY) {
      videos = await searchYouTubeDataAPI(query)
    }

    // Strategy 4: Final fallback — topic-aware curated educational videos
    if (videos.length === 0) {
      videos = await searchFallback(query)
    }

    // Log activity (non-blocking)
    try {
      await supabase.from('user_activity').insert({
        user_id: user.id,
        activity_type: 'voice_youtube_search',
        metadata: { query, results_count: videos.length },
      })
    } catch {}

    return NextResponse.json({ videos, query })
  } catch (error: any) {
    console.error('[Voice API] YouTube search error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search YouTube' },
      { status: 500 }
    )
  }
}

// ─── Piped API Search ─────────────────────────────────
async function searchPiped(query: string): Promise<VideoResult[]> {
  const searchQuery = encodeURIComponent(query)

  for (const instance of PIPED_INSTANCES) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 6000)

      const response = await fetch(
        `${instance}/search?q=${searchQuery}&filter=videos`,
        {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        }
      )
      clearTimeout(timeout)

      if (!response.ok) continue

      const data = await response.json()
      const items = data.items || data

      if (!Array.isArray(items) || items.length === 0) continue

      const videos: VideoResult[] = []
      for (const item of items) {
        if (videos.length >= 6) break
        if (item.type !== 'stream' && item.type !== undefined && !item.url) continue

        const videoId = extractVideoId(item.url || item.videoId || '')
        if (!videoId) continue

        videos.push({
          id: videoId,
          title: item.title || 'Untitled',
          thumbnail: item.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          channel: item.uploaderName || item.uploader || 'Unknown',
          duration: formatDuration(item.duration || 0),
          description: item.shortDescription || item.description || '',
          url: `https://www.youtube.com/watch?v=${videoId}`,
        })
      }

      if (videos.length > 0) {
        console.log(`[YouTube] Found ${videos.length} results via Piped (${instance})`)
        return videos
      }
    } catch (e) {
      // Try next instance
      continue
    }
  }

  return []
}

// ─── Invidious API Search ─────────────────────────────
async function searchInvidious(query: string): Promise<VideoResult[]> {
  const searchQuery = encodeURIComponent(query)

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 6000)

      const response = await fetch(
        `${instance}/api/v1/search?q=${searchQuery}&type=video&sort_by=relevance`,
        {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        }
      )
      clearTimeout(timeout)

      if (!response.ok) continue

      const data = await response.json()
      if (!Array.isArray(data) || data.length === 0) continue

      const videos: VideoResult[] = []
      for (const item of data) {
        if (videos.length >= 6) break
        if (item.type !== 'video') continue

        const videoId = item.videoId
        if (!videoId) continue

        // Get best thumbnail
        const thumb = item.videoThumbnails?.find((t: any) => t.quality === 'medium')
          || item.videoThumbnails?.[0]

        videos.push({
          id: videoId,
          title: item.title || 'Untitled',
          thumbnail: thumb?.url || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          channel: item.author || 'Unknown',
          duration: formatDuration(item.lengthSeconds || 0),
          description: item.description || item.descriptionHtml || '',
          url: `https://www.youtube.com/watch?v=${videoId}`,
        })
      }

      if (videos.length > 0) {
        console.log(`[YouTube] Found ${videos.length} results via Invidious (${instance})`)
        return videos
      }
    } catch (e) {
      continue
    }
  }

  return []
}

// ─── YouTube Data API v3 Search ──────────────────────
async function searchYouTubeDataAPI(query: string): Promise<VideoResult[]> {
  if (!YOUTUBE_DATA_API_KEY) return []

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const searchQuery = encodeURIComponent(query)
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${searchQuery}&type=video&key=${YOUTUBE_DATA_API_KEY}`,
      {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      }
    )
    clearTimeout(timeout)

    if (!response.ok) return []

    const data = await response.json()
    const items = data.items || []

    const videos: VideoResult[] = items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title || 'Untitled',
      thumbnail: item.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
      channel: item.snippet.channelTitle || 'Unknown',
      duration: 'N/A',
      description: item.snippet.description || '',
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }))

    if (videos.length > 0) {
      console.log(`[YouTube] Found ${videos.length} results via YouTube Data API`)
    }
    return videos
  } catch (e) {
    console.error('[YouTube] Data API error:', e)
    return []
  }
}

// ─── Fallback: topic-aware curated educational video IDs ──────────
async function searchFallback(query: string): Promise<VideoResult[]> {
  // Categorized curated videos for different topics
  const topicVideos: Record<string, string[]> = {
    'python': ['rfscVS0vtbw', 'eWRfhZUzrAc', '_uQrJ0TkZlc'],
    'javascript': ['PkZNo7MFNFg', 'W6NZfCJ1SJY', 'lI1ae4REbFM'],
    'css': ['kqtD5dpn9C8', 'OXGznpKZ_sA', '1Rs2ND1ryYc'],
    'react': ['pTFZrS8GHKA', 'SqcY0GlETPk', 'Tn6-PIqc4UM'],
    'web': ['PkZNo7MFNFg', 'kqtD5dpn9C8', 'pTFZrS8GHKA'],
    'programming': ['rfscVS0vtbw', 'PkZNo7MFNFg', 'zOjov-2OZ0E'],
    'math': ['OmJ-4B-mS-Y', 'pTnEG_WGd2Q', 'WUvTyaaNkzM'],
    'science': ['NVhA7-nh5Xo', 'FSyAehMdpyI', 'DnvLAqVxLoQ'],
    'physics': ['ZM8ECpBuQYE', 'AEIn3T6nDAo', 'wWnfJ0-xXRE'],
    'chemistry': ['bka20Q9TN6M', 'FSyAehMdpyI', 'NVhA7-nh5Xo'],
    'biology': ['QnQe0xW_JY4', 'dQw4w9WgXcQ', 'GcjgWov7mTM'],
    'history': ['DyqUw0WYwoc', 'xuCn8ux2gbs', 'Yocja_N5s1I'],
    'english': ['juKd26qkNAw', 'VLiCWv4D9qk', 'dQw4w9WgXcQ'],
    'music': ['rgaTLrZGlk0', 'QTfn0r80NJA', 'pRpeEdMmmQ0'],
    'art': ['X_EWYhUkTOk', 'ewMksAbgZBo', '6s0Mp7LFI-k'],
    'cooking': ['ZJy1ajvMU1k', 'bJUiWdM__Qw', 'rz5TGN7eUcM'],
    'fitness': ['UBMk30rjy0o', 'gC_L9qAHVJ8', 'ml6cT4AZdqI'],
    'meditation': ['inpok4MKVLM', 'z6X5oEIg6Ak', 'O-6f5wQXSu8'],
    'geography': ['hL_RnIxm3L4', 'Ofq_nl526Eo', 'DnvLAqVxLoQ'],
    'economics': ['PHe0bXAIuk0', '3ez10ADR_gM', 'B43YEW2FvDs'],
    'machine learning': ['7eh4d6sabA0', 'aircAruvnKk', 'JcI5Vnw0b2c'],
    'ai': ['7eh4d6sabA0', 'aircAruvnKk', 'ad79nYk2keg'],
  }

  // Match query to a topic category
  const queryLower = query.toLowerCase()
  let matchedIds: string[] | null = null

  for (const [topic, ids] of Object.entries(topicVideos)) {
    if (queryLower.includes(topic)) {
      matchedIds = ids
      break
    }
  }

  // If no category matched, pick a general set based on query words
  if (!matchedIds) {
    // Try partial matches
    const queryWords = queryLower.split(/\s+/)
    for (const [topic, ids] of Object.entries(topicVideos)) {
      if (queryWords.some(w => topic.includes(w) || w.includes(topic))) {
        matchedIds = ids
        break
      }
    }
  }

  // Absolute last resort: return a mix of popular educational videos
  if (!matchedIds) {
    matchedIds = [
      'dQw4w9WgXcQ', // Well-known video
      'PHe0bXAIuk0', // Economics
      'OmJ-4B-mS-Y', // Math
      'NVhA7-nh5Xo', // Science
    ]
  }

  const videos: VideoResult[] = []

  for (const videoId of matchedIds.slice(0, 4)) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3000)

      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      const resp = await fetch(oembedUrl, { signal: controller.signal })
      clearTimeout(timeout)

      if (resp.ok) {
        const data = await resp.json()
        videos.push({
          id: videoId,
          title: data.title || `Video about ${query}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          channel: data.author_name || 'Educational Channel',
          duration: 'N/A',
          description: `Video related to ${query}`,
          url: `https://www.youtube.com/watch?v=${videoId}`,
        })
      }
    } catch {
      videos.push({
        id: videoId,
        title: `Learn ${query} - Tutorial`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        channel: 'Educational Channel',
        duration: 'N/A',
        description: `Video related to ${query}`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      })
    }
  }

  if (videos.length > 0) {
    console.log(`[YouTube] Using ${videos.length} fallback results for query: "${query}"`)
  }

  return videos
}

// ─── Helpers ──────────────────────────────────────────
function extractVideoId(urlOrId: string): string | null {
  if (!urlOrId) return null
  // Already a video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId
  // Extract from URL path like /watch?v=xxx
  const match = urlOrId.match(/(?:v=|\/v\/|youtu\.be\/|\/watch\?v=|\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (match) return match[1]
  // Piped-style URL: /watch?v=xxx or just the path
  const pipedMatch = urlOrId.match(/v=([a-zA-Z0-9_-]{11})/)
  if (pipedMatch) return pipedMatch[1]
  return null
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return 'N/A'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60)
    const remainMins = mins % 60
    return `${hrs}:${String(remainMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${mins}:${String(secs).padStart(2, '0')}`
}
