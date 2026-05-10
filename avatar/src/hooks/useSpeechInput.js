/**
 * useSpeechInput Hook
 * Uses the Web Speech API to convert voice to text.
 */

import { useCallback, useRef } from 'react'
import useAppStore from '../store/useAppStore'

export function useSpeechInput(onResult) {
  const recognitionRef = useRef(null)
  const setIsListening = useAppStore((s) => s.setIsListening)

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.')
      return
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      if (onResult) onResult(text)
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [onResult, setIsListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [setIsListening])

  return { startListening, stopListening }
}
