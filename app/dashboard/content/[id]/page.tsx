'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Volume2, Eye, BookOpen, Hand, Clock, Search, Download, Box, Layers } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SignLanguageAvatar } from '@/components/features/sign-language-avatar'
import { AudioNarrative } from '@/components/features/audio-narrative'
import { LanguageLeveler } from '@/components/features/language-leveler'
import { FocusMode } from '@/components/features/focus-mode'
import { extractKeyPoints } from '@/lib/utils/text-processing'

// Dynamic import for 3D Sign Language (heavy Three.js bundle)
const SignLanguage3D = dynamic(
  () => import('@/components/features/sign-3d/sign-language-3d'),
  {
    ssr: false,
    loading: () => (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
        <p className="font-medium">Loading 3D Sign Language Engine...</p>
        <p className="text-xs text-muted-foreground mt-1">Initializing Three.js renderer</p>
      </Card>
    ),
  }
)

interface TranscriptSegment {
  startTime: number
  duration: number
  text: string
  formattedTime: string
}

interface ContentData {
  id: string
  title: string
  description: string | null
  youtube_url: string | null
  thumbnail_url: string | null
  transcript: string | null
  transcript_status: string
  duration_seconds: number | null
}

export default function ContentViewerPage() {
  const params = useParams()
  const contentId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [content, setContent] = useState<ContentData | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [transcriptStatus, setTranscriptStatus] = useState<string>('pending')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [simplifiedText, setSimplifiedText] = useState('')
  const [error, setError] = useState('')
  const [focusModeEnabled, setFocusModeEnabled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSegment, setActiveSegment] = useState<number>(-1)
  const [showTimestamps, setShowTimestamps] = useState(true)
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([])

  // Fetch content from Supabase
  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/content/${contentId}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to load content')
        }
        const data = await res.json()
        setContent(data.content)
        
        if (data.content.transcript) {
          setTranscript(data.content.transcript)
          setTranscriptStatus(data.content.transcript_status || 'completed')
          // Try to parse stored segments
          if (data.content.transcript_segments) {
            try {
              const storedSegments = JSON.parse(data.content.transcript_segments)
              if (Array.isArray(storedSegments) && storedSegments.length > 0) {
                setSegments(storedSegments)
              }
            } catch {}
          }
        } else {
          setTranscriptStatus(data.content.transcript_status || 'pending')
          const status = data.content.transcript_status || 'pending'
          if (data.content.youtube_url && (status === 'pending' || status === 'unavailable')) {
            fetchTranscript(data.content)
          }
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchContent()
  }, [contentId])

  // Fetch transcript from YouTube
  const fetchTranscript = async (contentData: ContentData) => {
    if (!contentData.youtube_url) return
    
    const videoId = extractVideoId(contentData.youtube_url)
    if (!videoId) return

    setIsTranscribing(true)
    setTranscriptStatus('processing')

    try {
      const res = await fetch('/api/content/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentData.id,
          video_id: videoId,
          title: contentData.title,
          description: contentData.description,
        }),
      })

      const data = await res.json()
      if (data.transcript) {
        setTranscript(data.transcript)
        setTranscriptStatus(data.status || 'completed')
        if (data.segments && Array.isArray(data.segments)) {
          setSegments(data.segments)
        }
      }
    } catch (err: any) {
      console.error('Transcript fetch error:', err)
      setTranscriptStatus('failed')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleSimplify = async (text: string, level: string) => {
    try {
      const res = await fetch('/api/ai/simplify-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, level }),
      })

      if (!res.ok) {
        throw new Error('Simplification failed')
      }

      const data = await res.json()
      const simplified = data.simplified || text
      setSimplifiedText(simplified)
      return simplified
    } catch {
      let simplified = text
      if (level === 'basic') {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim())
        simplified = sentences.slice(0, Math.min(3, sentences.length)).map(s => s.trim()).join('. ') + '.'
      } else if (level === 'intermediate') {
        simplified = text.substring(0, Math.min(text.length, 500))
        const lastPeriod = simplified.lastIndexOf('.')
        if (lastPeriod > 100) simplified = simplified.substring(0, lastPeriod + 1)
      }
      setSimplifiedText(simplified)
      return simplified
    }
  }

  // Extract YouTube video ID
  const extractVideoId = (url: string | null) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const getYoutubeEmbedUrl = (url: string | null) => {
    const id = extractVideoId(url)
    return id ? `https://www.youtube.com/embed/${id}` : null
  }

  // Handle clicking a timestamp to seek video
  const handleTimestampClick = (segment: TranscriptSegment, index: number) => {
    setActiveSegment(index)
    // Try to seek the YouTube iframe
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    if (iframe && content?.youtube_url) {
      const videoId = extractVideoId(content.youtube_url)
      if (videoId) {
        iframe.src = `https://www.youtube.com/embed/${videoId}?start=${Math.floor(segment.startTime)}&autoplay=1`
      }
    }
  }

  // Filter segments by search
  const filteredSegments = searchQuery
    ? segments.filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : segments

  // Download transcript
  const handleDownloadTranscript = () => {
    if (!transcript) return
    let content_text = ''
    if (segments.length > 0) {
      content_text = segments.map(s => `[${s.formattedTime}] ${s.text}`).join('\n\n')
    } else {
      content_text = transcript
    }
    const blob = new Blob([content_text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${contentId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!content) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || 'Content not found'}</AlertDescription>
      </Alert>
    )
  }

  const embedUrl = getYoutubeEmbedUrl(content.youtube_url)
  const displayTranscript = transcript || ''

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Video Player */}
      <Card className="overflow-hidden">
        <div className="aspect-video bg-black relative">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={content.title}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center text-white">
              <div>
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Video not available</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Title and Description */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">{content.title}</h1>
        {content.description && (
          <p className="text-muted-foreground text-lg">{content.description}</p>
        )}
        {content.duration_seconds && (
          <p className="text-sm text-muted-foreground">
            Duration: {Math.floor(content.duration_seconds / 60)} min {content.duration_seconds % 60} sec
          </p>
        )}
      </div>

      {/* Accessibility Features Tabs */}
      <Tabs defaultValue="transcript" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transcript">
            <BookOpen className="w-4 h-4 mr-2" />
            Transcript
          </TabsTrigger>
          <TabsTrigger value="simplified">
            <Eye className="w-4 h-4 mr-2" />
            Leveler
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Volume2 className="w-4 h-4 mr-2" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="avatar">
            <Hand className="w-4 h-4 mr-2" />
            Sign Language
          </TabsTrigger>
        </TabsList>

        {/* Video Transcript with Timestamps */}
        <TabsContent value="transcript" className="space-y-4">
          {isTranscribing ? (
            <Card className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Fetching transcript from YouTube...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a few seconds</p>
            </Card>
          ) : displayTranscript && transcriptStatus !== 'unavailable' ? (
            <div className="space-y-3">
              {/* Transcript Header & Controls */}
              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      Video Transcript
                    </h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {displayTranscript.split(/\s+/).length} words
                    </span>
                    {segments.length > 0 && (
                      <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {segments.length} segments
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {segments.length > 0 && (
                      <button
                        onClick={() => setShowTimestamps(!showTimestamps)}
                        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                          showTimestamps 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <Clock className="w-3 h-3 inline mr-1" />
                        Timestamps
                      </button>
                    )}
                    <button
                      onClick={handleDownloadTranscript}
                      className="text-xs px-3 py-1.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 font-medium transition-colors"
                      title="Download transcript"
                    >
                      <Download className="w-3 h-3 inline mr-1" />
                      Download
                    </button>
                  </div>
                </div>

                {/* Search bar */}
                {segments.length > 0 && (
                  <div className="mt-3 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search in transcript..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {searchQuery && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {filteredSegments.length} match{filteredSegments.length !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                )}
              </Card>

              {/* Timestamped Segments View */}
              {segments.length > 0 && showTimestamps ? (
                <Card className="divide-y divide-border overflow-hidden">
                  <div className="max-h-[500px] overflow-y-auto scroll-smooth" id="transcript-segments">
                    {filteredSegments.map((segment, idx) => {
                      const originalIdx = segments.indexOf(segment)
                      const isActive = activeSegment === originalIdx
                      
                      return (
                        <div
                          key={originalIdx}
                          ref={(el) => { segmentRefs.current[originalIdx] = el }}
                          onClick={() => handleTimestampClick(segment, originalIdx)}
                          className={`flex gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-primary/5 group ${
                            isActive 
                              ? 'bg-primary/10 border-l-4 border-l-primary' 
                              : 'border-l-4 border-l-transparent'
                          }`}
                        >
                          {/* Timestamp badge */}
                          <button
                            className={`flex-shrink-0 font-mono text-xs px-2 py-1 rounded-md transition-colors mt-0.5 ${
                              isActive
                                ? 'bg-primary text-primary-foreground font-bold'
                                : 'bg-muted text-primary group-hover:bg-primary/20 font-medium'
                            }`}
                            title={`Jump to ${segment.formattedTime}`}
                          >
                            {segment.formattedTime}
                          </button>
                          {/* Segment text */}
                          <p className={`text-sm leading-relaxed flex-1 ${
                            isActive ? 'text-foreground font-medium' : 'text-foreground/80'
                          }`}>
                            {searchQuery ? (
                              highlightSearchTerms(segment.text, searchQuery)
                            ) : (
                              segment.text
                            )}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              ) : (
                /* Plain text fallback */
                <Card className="p-6">
                  <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">
                    {displayTranscript}
                  </p>
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-8 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <div>
                <p className="text-muted-foreground">
                  {transcriptStatus === 'unavailable'
                    ? 'Auto-captions are not available for this video.'
                    : transcriptStatus === 'failed'
                    ? 'Failed to fetch transcript.'
                    : 'Transcript not yet available.'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Not all YouTube videos have captions enabled.
                </p>
              </div>
              {content.youtube_url && transcriptStatus !== 'processing' && (
                <Button
                  onClick={() => fetchTranscript(content)}
                  variant="outline"
                  size="sm"
                >
                  Retry Fetching Transcript
                </Button>
              )}
            </Card>
          )}
        </TabsContent>

        {/* Language Leveler */}
        <TabsContent value="simplified" className="space-y-4">
          {displayTranscript ? (
            <LanguageLeveler 
              originalText={displayTranscript} 
              onSimplify={handleSimplify}
            />
          ) : (
            <Card className="p-8 text-center">
              <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Transcript needed for text simplification</p>
              <p className="text-xs text-muted-foreground mt-2">Fetch the transcript first from the Transcript tab</p>
            </Card>
          )}
        </TabsContent>

        {/* Audio Narratives */}
        <TabsContent value="audio" className="space-y-4">
          {displayTranscript ? (
            <AudioNarrative
              title={content.title}
              description={content.description || 'Listen to an audio summary of the content'}
              keyPoints={extractKeyPoints(displayTranscript, 5)}
            />
          ) : (
            <Card className="p-8 text-center">
              <Volume2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Transcript needed for audio narrative</p>
              <p className="text-xs text-muted-foreground mt-2">Fetch the transcript first from the Transcript tab</p>
            </Card>
          )}
        </TabsContent>

        {/* Sign Language Avatar — 2D + 3D Modes */}
        <TabsContent value="avatar" className="space-y-4">
          <SignLanguage3D
            text={simplifiedText || displayTranscript || content.title}
            isPlaying={false}
            onPlayPause={(playing) => {
              console.log('[Synapto] 3D Avatar playing:', playing)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Focus Mode Widget */}
      <FocusMode
        enabled={focusModeEnabled}
        onToggle={setFocusModeEnabled}
      />
    </div>
  )
}

// Highlight search terms in transcript text
function highlightSearchTerms(text: string, query: string): React.ReactNode {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300/50 dark:bg-yellow-500/30 text-foreground rounded px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}
