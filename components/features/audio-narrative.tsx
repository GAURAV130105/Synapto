'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react'

interface AudioNarrativeProps {
  title: string
  description: string
  keyPoints: string[]
  audioUrl?: string
  onGenerateAudio?: () => Promise<string>
}

export function AudioNarrative({
  title,
  description,
  keyPoints,
  audioUrl,
  onGenerateAudio,
}: AudioNarrativeProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentAudioUrl, setCurrentAudioUrl] = useState(audioUrl)
  const [progress, setProgress] = useState(0)
  const [voiceReady, setVoiceReady] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speed, setSpeed] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const textToSpeak = useRef('')

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices()
      if (available.length > 0) {
        setVoices(available)
        // Prefer English voices
        const english = available.filter(v => v.lang.startsWith('en'))
        const preferred = english.find(v => v.name.includes('Google') || v.name.includes('Microsoft'))
          || english.find(v => v.name.includes('Female') || v.name.includes('Samantha'))
          || english[0]
          || available[0]
        setSelectedVoice(preferred)
        setVoiceReady(true)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const speakText = (text: string) => {
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    if (selectedVoice) utterance.voice = selectedVoice
    utterance.rate = speed
    utterance.pitch = 1
    utterance.volume = 1

    // Track progress via boundary events
    const words = text.split(/\s+/)
    let wordIndex = 0
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        wordIndex++
        setProgress(Math.round((wordIndex / words.length) * 100))
      }
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setProgress(100)
      setTimeout(() => setProgress(0), 1000)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setProgress(0)
    }

    utteranceRef.current = utterance
    textToSpeak.current = text
    window.speechSynthesis.speak(utterance)
    setIsPlaying(true)
    setIsPaused(false)
  }

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPlaying(true)
      setIsPaused(false)
      return
    }

    // Build the narrative text
    let narrative = `${title}. ${description}. `
    if (keyPoints.length > 0) {
      narrative += 'Here are the key points: '
      keyPoints.forEach((point, i) => {
        narrative += `Point ${i + 1}: ${point}. `
      })
    }
    speakText(narrative)
  }

  const handlePause = () => {
    window.speechSynthesis.pause()
    setIsPlaying(false)
    setIsPaused(true)
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setProgress(0)
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
            
            {keyPoints.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-primary">Key Points:</p>
                <ul className="text-xs space-y-1">
                  {keyPoints.map((point, idx) => (
                    <li key={idx} className="text-muted-foreground flex gap-2">
                      <span className="font-bold text-primary">{idx + 1}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        {/* Status */}
        <div className="flex items-center gap-3">
          {isPlaying ? (
            <Volume2 className="w-5 h-5 text-accent animate-pulse" />
          ) : (
            <VolumeX className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">Audio Narrative</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {!voiceReady ? 'Loading voices...' : isPlaying ? 'Playing...' : isPaused ? 'Paused' : 'Ready'}
          </span>
        </div>

        {/* Progress bar */}
        {(isPlaying || isPaused || progress > 0) && (
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Speed control */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Speed:</span>
          {[0.75, 1, 1.25, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                speed === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* If there's a URL-based audio */}
        {currentAudioUrl && (
          <audio
            ref={audioRef}
            src={currentAudioUrl}
            onEnded={handleAudioEnded}
            crossOrigin="anonymous"
            className="w-full"
          />
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {isPlaying ? (
            <>
              <button
                onClick={handlePause}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
              <button
                onClick={handleStop}
                className="bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handlePlay}
              disabled={!voiceReady}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isPaused ? 'Resume' : '▶ Play Audio Narrative'}
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Uses browser text-to-speech • {voices.length} voices available
        </p>
      </div>
    </div>
  )
}

export default AudioNarrative
