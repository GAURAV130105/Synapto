'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Mic,
  MicOff,
  X,
  Loader2,
  Volume2,
  VolumeX,
  PlayCircle,
  Sparkles,
  Plus,
  Minimize2,
  Maximize2,
} from 'lucide-react'

interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  channel: string
  duration: string
  description: string
  url: string
}

type AssistantState = 'idle' | 'listening' | 'processing' | 'speaking'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
  videos?: YouTubeVideo[]
  playingVideoId?: string
}

export default function VoiceAssistant() {
  const router = useRouter()
  const pathname = usePathname()

  // Core state
  const [state, setState] = useState<AssistantState>('idle')
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [playingVideo, setPlayingVideo] = useState<YouTubeVideo | null>(null)
  const [hasGreeted, setHasGreeted] = useState(false)

  // Refs
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const autoListenRef = useRef(true) // Controls auto-listen after speaking
  const isActiveRef = useRef(false) // Is the assistant currently in a conversation
  const lastVideosRef = useRef<YouTubeVideo[]>([]) // Remember last search results
  const videoPlayingRef = useRef(false) // Track if a video is currently active

  // Initialize speech synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis
    // Preload voices
    synthRef.current.getVoices()
    window.speechSynthesis.onvoiceschanged = () => {
      synthRef.current?.getVoices()
    }
  }, [])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup
  useEffect(() => {
    return () => {
      stopEverything()
    }
  }, [])

  const stopEverything = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch {}
    }
    if (synthRef.current) {
      synthRef.current.cancel()
    }
  }

  // ──────────────────────────────────────────
  // SPEECH SYNTHESIS - Speak and auto-listen
  // ──────────────────────────────────────────
  const speak = useCallback(
    (text: string, thenListen = true) => {
      if (!synthRef.current) return

      // Stop any current speech
      synthRef.current.cancel()

      // Don't auto-listen if a video is playing (prevents voice/video overlap)
      const shouldAutoListen = thenListen && !videoPlayingRef.current

      if (isMuted) {
        setState('idle')
        if (shouldAutoListen && autoListenRef.current && isActiveRef.current) {
          setTimeout(() => startListening(), 400)
        }
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 0.9

      // Pick best voice
      const voices = synthRef.current.getVoices()
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Microsoft Zira') ||
            v.name.includes('Samantha') ||
            v.name.includes('Microsoft David'))
      ) || voices.find((v) => v.lang.startsWith('en'))
      if (preferred) utterance.voice = preferred

      utterance.onstart = () => setState('speaking')
      utterance.onend = () => {
        setState('idle')
        // AUTO-LISTEN after speaking (but NOT if video is playing)
        if (shouldAutoListen && autoListenRef.current && isActiveRef.current) {
          setTimeout(() => startListening(), 500)
        }
      }
      utterance.onerror = () => {
        setState('idle')
        if (shouldAutoListen && autoListenRef.current && isActiveRef.current) {
          setTimeout(() => startListening(), 500)
        }
      }

      synthRef.current.speak(utterance)
    },
    [isMuted]
  )

  // ──────────────────────────────────────────
  // PROCESS COMMAND - Handle what user said
  // ──────────────────────────────────────────
  const processCommand = useCallback(
    async (spokenText: string) => {
      setState('processing')

      // Add user message
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: spokenText, timestamp: new Date() },
      ])

      try {
        const response = await fetch('/api/voice/process-command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: spokenText,
            context: pathname,
          }),
        })

        const result = await response.json()
        let videos: YouTubeVideo[] | undefined
        let playVideoId: string | undefined
        let shouldAutoListen = true

        switch (result.action) {
          case 'navigate':
            router.push(result.params.path)
            break

          case 'search_youtube':
            if (result.youtubeQuery) {
              try {
                const ytResponse = await fetch('/api/voice/youtube-search', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ query: result.youtubeQuery }),
                })

                const ytData = await ytResponse.json()
                videos = ytData.videos

                if (videos && videos.length > 0) {
                  lastVideosRef.current = videos
                  const titles = videos.slice(0, 3).map((v, i) => `${i + 1}: ${v.title}`).join('. ')
                  result.response = `I found ${videos.length} videos. ${titles}. Say "play first" or "play second" to watch one.`
                } else {
                  result.response = `Sorry, I couldn't find videos for "${result.youtubeQuery}". Try a different search term.`
                }
              } catch (e) {
                console.error('YouTube search error:', e)
                result.response = `I had trouble searching YouTube. Let me try again — just repeat your search.`
              }
            }
            break

          case 'play_video':
            // Play a video from search results
            const videoIndex = getVideoIndex(spokenText)
            if (lastVideosRef.current.length > 0 && videoIndex >= 0 && videoIndex < lastVideosRef.current.length) {
              const video = lastVideosRef.current[videoIndex]
              setPlayingVideo(video)
              videoPlayingRef.current = true
              setIsMinimized(false)
              result.response = `Now playing: ${video.title}. Tap the mic if you need me.`
              playVideoId = video.id
              shouldAutoListen = false // Don't auto-listen while video plays
            } else if (lastVideosRef.current.length > 0) {
              // Default to first video
              const video = lastVideosRef.current[0]
              setPlayingVideo(video)
              videoPlayingRef.current = true
              setIsMinimized(false)
              result.response = `Playing: ${video.title}. Tap the mic if you need me.`
              playVideoId = video.id
              shouldAutoListen = false // Don't auto-listen while video plays
            } else {
              result.response = 'No videos to play. Try saying "search" followed by a topic first.'
            }
            break

          case 'next_video': {
            if (playingVideo && lastVideosRef.current.length > 0) {
              const currentIdx = lastVideosRef.current.findIndex(v => v.id === playingVideo.id)
              const nextIdx = (currentIdx + 1) % lastVideosRef.current.length
              const nextVideo = lastVideosRef.current[nextIdx]
              setPlayingVideo(nextVideo)
              videoPlayingRef.current = true
              result.response = `Now playing: ${nextVideo.title}. Tap the mic if you need me.`
              shouldAutoListen = false
            } else {
              result.response = 'No videos in queue. Search for something first.'
            }
            break
          }

          case 'previous_video': {
            if (playingVideo && lastVideosRef.current.length > 0) {
              const currentIdx = lastVideosRef.current.findIndex(v => v.id === playingVideo.id)
              const prevIdx = currentIdx <= 0 ? lastVideosRef.current.length - 1 : currentIdx - 1
              const prevVideo = lastVideosRef.current[prevIdx]
              setPlayingVideo(prevVideo)
              videoPlayingRef.current = true
              result.response = `Now playing: ${prevVideo.title}. Tap the mic if you need me.`
              shouldAutoListen = false
            } else {
              result.response = 'No videos in queue.'
            }
            break
          }

          case 'stop_video':
            setPlayingVideo(null)
            videoPlayingRef.current = false
            result.response = "Video stopped. What would you like to do next?"
            break

          case 'add_to_library':
            const addIdx = getVideoIndex(spokenText)
            const videoToAdd = addIdx >= 0 && addIdx < lastVideosRef.current.length
              ? lastVideosRef.current[addIdx]
              : playingVideo || (lastVideosRef.current.length > 0 ? lastVideosRef.current[0] : null)

            if (videoToAdd) {
              try {
                const addResp = await fetch('/api/content/add', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    youtube_url: videoToAdd.url,
                    title: videoToAdd.title,
                    description: videoToAdd.description,
                    video_id: videoToAdd.id,
                  }),
                })
                if (addResp.ok) {
                  result.response = `Added "${videoToAdd.title}" to your library!`
                } else {
                  result.response = 'Failed to add the video. It might already be in your library.'
                }
              } catch {
                result.response = 'Something went wrong while adding the video.'
              }
            } else {
              result.response = 'No video to add. Search for videos first.'
            }
            break

          case 'logout':
            shouldAutoListen = false
            autoListenRef.current = false
            isActiveRef.current = false
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/')
            router.refresh()
            break

          case 'toggle_theme':
            document.documentElement.classList.toggle('dark')
            break

          case 'read_aloud':
            const mainContent = document.querySelector('main')?.textContent || ''
            const truncated = mainContent.slice(0, 1000)
            shouldAutoListen = false
            // Will speak the content, then auto-listen after
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', text: '📖 Reading page content...', timestamp: new Date() },
            ])
            speak(truncated, true)
            return // Early return, we handle speaking ourselves

          case 'stop_listening':
            isActiveRef.current = false
            autoListenRef.current = false
            result.response = "Going to sleep. Tap my icon whenever you need me!"
            shouldAutoListen = false
            break
        }

        // Add assistant message
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: result.response,
            timestamp: new Date(),
            videos,
            playingVideoId: playVideoId,
          },
        ])

        speak(result.response, shouldAutoListen)
      } catch (error) {
        console.error('Voice command error:', error)
        const errorMsg = "Sorry, something went wrong. Could you say that again?"
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: errorMsg, timestamp: new Date() },
        ])
        speak(errorMsg, true)
      }
    },
    [pathname, router, speak, playingVideo]
  )

  // ──────────────────────────────────────────
  // SPEECH RECOGNITION - Listen to user
  // ──────────────────────────────────────────
  // Pause the video iframe (send postMessage to YouTube player)
  const pauseVideo = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
        '*'
      )
    }
  }, [])

  // Resume the video iframe
  const resumeVideo = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      )
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isActiveRef.current) return

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    // Cleanup previous
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch {}
    }

    // Stop any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel()
    }

    // Pause the video so mic doesn't pick up video audio
    pauseVideo()

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setState('listening')
      setTranscript('')
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += t
        } else {
          interimTranscript += t
        }
      }

      setTranscript(finalTranscript || interimTranscript)

      if (finalTranscript) {
        processCommand(finalTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      // 'aborted' fires intentionally when we call .abort() — ignore it
      if (event.error === 'aborted') return

      // 'no-speech' means silence — just retry
      if (event.error === 'no-speech') {
        setState('idle')
        if (isActiveRef.current) {
          setTimeout(() => startListening(), 800)
        }
        return
      }

      // 'not-allowed' means mic permission denied
      if (event.error === 'not-allowed') {
        console.warn('Microphone access denied')
        setState('idle')
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: '🎤 I need microphone access to hear you. Please click the lock icon in your address bar and allow microphone access, then tap my icon again.',
            timestamp: new Date(),
          },
        ])
        isActiveRef.current = false
        return
      }

      // 'network' errors can happen intermittently — just retry
      if (event.error === 'network') {
        setState('idle')
        if (isActiveRef.current) {
          setTimeout(() => startListening(), 1500)
        }
        return
      }

      // Any other error
      console.warn('Speech recognition error:', event.error)
      setState('idle')
      if (isActiveRef.current) {
        setTimeout(() => startListening(), 1000)
      }
    }

    recognition.onend = () => {
      // Only restart if we're still supposed to be idle and active
      if (state === 'listening' && isActiveRef.current) {
        setState('idle')
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (e) {
      console.error('Failed to start recognition:', e)
      setState('idle')
    }
  }, [processCommand, state])

  // ──────────────────────────────────────────
  // ACTIVATE / DEACTIVATE ASSISTANT
  // ──────────────────────────────────────────
  const activate = useCallback(() => {
    setIsOpen(true)
    setIsMinimized(false)
    isActiveRef.current = true
    autoListenRef.current = true

    if (!hasGreeted) {
      setHasGreeted(true)
      const welcome = "Hi! I'm your Synapto assistant. What would you like to do? You can search for videos, navigate pages, play content, or just ask me anything!"
      setMessages([
        { role: 'assistant', text: welcome, timestamp: new Date() },
      ])
      speak(welcome, true)
    } else {
      const msg = "I'm listening! What do you need?"
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: msg, timestamp: new Date() },
      ])
      speak(msg, true)
    }
  }, [hasGreeted, speak])

  const deactivate = useCallback(() => {
    isActiveRef.current = false
    autoListenRef.current = false
    videoPlayingRef.current = false
    stopEverything()
    setState('idle')
    setPlayingVideo(null)
  }, [])

  // ──────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────
  function getVideoIndex(text: string): number {
    const lower = text.toLowerCase()
    if (lower.includes('first') || lower.includes('one') || lower.includes('1')) return 0
    if (lower.includes('second') || lower.includes('two') || lower.includes('2')) return 1
    if (lower.includes('third') || lower.includes('three') || lower.includes('3')) return 2
    if (lower.includes('fourth') || lower.includes('four') || lower.includes('4')) return 3
    if (lower.includes('fifth') || lower.includes('five') || lower.includes('5')) return 4
    if (lower.includes('sixth') || lower.includes('six') || lower.includes('6')) return 5
    return -1
  }

  // State-based styling
  const stateStyles = {
    idle: { bg: 'from-violet-500 to-indigo-600', glow: 'shadow-violet-500/40' },
    listening: { bg: 'from-emerald-400 to-cyan-500', glow: 'shadow-emerald-500/50' },
    processing: { bg: 'from-amber-400 to-orange-500', glow: 'shadow-amber-500/40' },
    speaking: { bg: 'from-blue-400 to-indigo-500', glow: 'shadow-blue-500/40' },
  }

  const style = stateStyles[state]

  return (
    <>
      {/* ════════════════════════════════════════
          FLOATING ACTIVATION BUTTON
          ════════════════════════════════════════ */}
      {!isOpen && (
        <button
          id="voice-assistant-trigger"
          onClick={activate}
          className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br ${style.bg} ${style.glow} shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95`}
          aria-label="Activate Voice Assistant"
        >
          <Mic className="w-7 h-7 text-white" />
          <span className="absolute inset-0 rounded-full bg-white/10 animate-ping pointer-events-none" />
          <span className="absolute -inset-1 rounded-full border-2 border-violet-400/20 animate-pulse pointer-events-none" />
        </button>
      )}

      {/* ════════════════════════════════════════
          MAIN ASSISTANT PANEL
          ════════════════════════════════════════ */}
      {isOpen && !isMinimized && (
        <div
          id="voice-assistant-panel"
          className="fixed bottom-6 right-6 z-50 w-[400px] rounded-2xl overflow-hidden flex flex-col"
          style={{
            maxHeight: playingVideo ? '85vh' : '520px',
            background: 'linear-gradient(160deg, rgba(10,10,25,0.97), rgba(20,15,45,0.97))',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 30px 80px -12px rgba(139,92,246,0.35), 0 0 50px rgba(99,102,241,0.12)',
          }}
        >
          {/* ── Header ── */}
          <div
            className="px-5 py-3 flex items-center justify-between flex-shrink-0"
            style={{
              borderBottom: '1px solid rgba(139,92,246,0.15)',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))',
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${style.bg} flex items-center justify-center shadow-lg`}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Synapto</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    state === 'listening' ? 'bg-emerald-400 animate-pulse' :
                    state === 'speaking' ? 'bg-blue-400 animate-pulse' :
                    state === 'processing' ? 'bg-amber-400 animate-spin' :
                    'bg-violet-400'
                  }`} />
                  <p className="text-[10px] text-violet-300/70 font-medium">
                    {state === 'listening' ? 'Listening...' :
                     state === 'speaking' ? 'Speaking...' :
                     state === 'processing' ? 'Thinking...' :
                     isActiveRef.current ? 'Ready' : 'Paused'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-violet-300/60" /> : <Volume2 className="w-4 h-4 text-violet-300/60" />}
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4 text-violet-300/60" />
              </button>
              <button
                onClick={() => { deactivate(); setIsOpen(false) }}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-violet-300/60" />
              </button>
            </div>
          </div>

          {/* ── Video Player ── */}
          {playingVideo && (
            <div className="flex-shrink-0" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  ref={iframeRef}
                  src={`https://www.youtube.com/embed/${playingVideo.id}?autoplay=1&rel=0&enablejsapi=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={playingVideo.title}
/>
              </div>
              <div className="px-4 py-2 flex items-center justify-between">
                <p className="text-[11px] text-violet-200 font-medium truncate flex-1 mr-2">
                  {playingVideo.title}
                </p>
                <button
                  onClick={() => { setPlayingVideo(null); videoPlayingRef.current = false }}
                  className="text-[9px] text-red-300 hover:text-red-200 font-medium px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors flex-shrink-0"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ── Chat Messages ── */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5"
            style={{ minHeight: '140px', maxHeight: playingVideo ? '160px' : '300px' }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-violet-500/25 to-indigo-600/25 text-violet-100 rounded-br-sm'
                      : 'bg-white/[0.04] text-violet-100/90 rounded-bl-sm'
                  }`}
                  style={{
                    border: msg.role === 'user'
                      ? '1px solid rgba(139,92,246,0.18)'
                      : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <p className="text-[11px] leading-relaxed">{msg.text}</p>

                  {/* Video Results */}
                  {msg.videos && msg.videos.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      {msg.videos.map((video, idx) => (
                        <div
                          key={video.id}
                          className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-white/5 transition-colors cursor-pointer group"
                          style={{ border: '1px solid rgba(139,92,246,0.1)' }}
                          onClick={() => {
                            setPlayingVideo(video)
                            videoPlayingRef.current = true
                            // Stop speech & don't auto-listen while video plays
                            if (synthRef.current) synthRef.current.cancel()
                            speak(`Playing: ${video.title}`, false)
                          }}
                        >
                          <div className="relative flex-shrink-0 w-16 h-10 rounded-md overflow-hidden">
                            <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlayCircle className="w-4 h-4 text-white" />
                            </div>
                            <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[7px] px-1 rounded font-mono">
                              {video.duration}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-violet-100 truncate">
                              <span className="text-violet-400/60 mr-1">{idx + 1}.</span>
                              {video.title}
                            </p>
                            <p className="text-[8px] text-violet-300/40 truncate">{video.channel}</p>
                          </div>
                        </div>
                      ))}
                      <p className="text-[9px] text-violet-400/40 text-center pt-1">
                        Say "play first" or "play second" to watch
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Live Transcript ── */}
          {state === 'listening' && (
            <div
              className="px-4 py-2 flex-shrink-0"
              style={{
                borderTop: '1px solid rgba(16,185,129,0.15)',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(6,182,212,0.04))',
              }}
            >
              <p className="text-xs text-emerald-300/80 italic min-h-[16px]">
                {transcript || (
                  <span className="flex items-center gap-2 text-emerald-400/50">
                    <span className="flex gap-0.5">
                      <span className="w-1 h-3 bg-emerald-400/40 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-4 bg-emerald-400/50 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-2 bg-emerald-400/30 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                      <span className="w-1 h-5 bg-emerald-400/60 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
                      <span className="w-1 h-3 bg-emerald-400/40 rounded-full animate-pulse" style={{ animationDelay: '250ms' }} />
                    </span>
                    Speak now...
                  </span>
                )}
              </p>
            </div>
          )}

          {/* ── Bottom Controls ── */}
          <div
            className="px-4 py-3 flex items-center justify-center gap-3 flex-shrink-0"
            style={{
              borderTop: '1px solid rgba(139,92,246,0.12)',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(99,102,241,0.025))',
            }}
          >
            {/* Main mic button */}
            <button
              id="voice-assistant-mic"
              onClick={() => {
                if (state === 'listening') {
                  // Interrupt listening — resume video if it was playing
                  if (recognitionRef.current) {
                    try { recognitionRef.current.abort() } catch {}
                  }
                  setState('idle')
                  if (playingVideo) resumeVideo()
                } else if (state === 'speaking') {
                  // Interrupt speaking, start listening
                  if (synthRef.current) synthRef.current.cancel()
                  setState('idle')
                  setTimeout(() => startListening(), 300)
                } else {
                  // Start listening — pause video first
                  isActiveRef.current = true
                  autoListenRef.current = !playingVideo // Don't auto-listen if video is playing
                  startListening()
                }
              }}
              className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${style.bg} ${style.glow} shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95`}
              aria-label={state === 'listening' ? 'Stop' : 'Speak'}
            >
              {state === 'processing' ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : state === 'listening' ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}

              {state === 'listening' && (
                <>
                  <span className="absolute inset-0 rounded-full bg-emerald-400/15 animate-ping" />
                  <span className="absolute -inset-1.5 rounded-full border-2 border-emerald-400/20 animate-pulse" />
                </>
              )}
              {state === 'speaking' && (
                <span className="absolute inset-0 rounded-full bg-blue-400/15 animate-pulse" />
              )}
            </button>

            {/* Status text */}
            <p className="text-[10px] text-violet-300/40 w-24">
              {state === 'listening' ? 'Tap to interrupt' :
               state === 'speaking' ? 'Tap to skip' :
               state === 'processing' ? 'Processing...' :
               'Tap to speak'}
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          MINIMIZED BAR
          ════════════════════════════════════════ */}
      {isOpen && isMinimized && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-full flex items-center gap-2 px-2 py-1.5 cursor-pointer"
          onClick={() => setIsMinimized(false)}
          style={{
            background: 'linear-gradient(135deg, rgba(10,10,25,0.95), rgba(20,15,45,0.95))',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 15px 40px -8px rgba(139,92,246,0.3)',
          }}
        >
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${style.bg} flex items-center justify-center shadow-lg`}>
            {state === 'listening' ? (
              <Mic className="w-5 h-5 text-white animate-pulse" />
            ) : state === 'processing' ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : state === 'speaking' ? (
              <Volume2 className="w-5 h-5 text-white animate-pulse" />
            ) : (
              <Sparkles className="w-5 h-5 text-white" />
            )}
          </div>
          <span className="text-[10px] text-violet-300/60 font-medium pr-2">
            {state === 'listening' ? 'Listening...' :
             state === 'speaking' ? 'Speaking...' :
             state === 'processing' ? 'Thinking...' :
             'Tap to expand'}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); deactivate(); setIsOpen(false) }}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10"
          >
            <X className="w-3 h-3 text-violet-300/50" />
          </button>
        </div>
      )}
    </>
  )
}
