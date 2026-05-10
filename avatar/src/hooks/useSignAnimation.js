/**
 * useSignAnimation Hook
 * Connects the text-to-sign pipeline with the 3D avatar animation player.
 */

import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { SignAnimationPlayer } from '../engine/animationPlayer'
import { textToGloss, textToGlossLLM } from '../engine/glossParser'
import { glossToAnimations } from '../engine/animationMapper'
import useAppStore from '../store/useAppStore'

export function useSignAnimation(boneMap) {
  const playerRef = useRef(null)
  
  const setGlossSequence = useAppStore((s) => s.setGlossSequence)
  const setCurrentGlossIndex = useAppStore((s) => s.setCurrentGlossIndex)
  const setIsPlaying = useAppStore((s) => s.setIsPlaying)
  const setStatus = useAppStore((s) => s.setStatus)
  const setStatusMessage = useAppStore((s) => s.setStatusMessage)
  const setAnimationQueue = useAppStore((s) => s.setAnimationQueue)
  const addToHistory = useAppStore((s) => s.addToHistory)
  const playbackSpeed = useAppStore((s) => s.playbackSpeed)

  // Initialize player
  if (!playerRef.current && boneMap && Object.keys(boneMap).length > 0) {
    playerRef.current = new SignAnimationPlayer(
      boneMap,
      // onGlossChange
      (index, item) => {
        setCurrentGlossIndex(index)
        setStatusMessage(item?.description || item?.gloss || '')
      },
      // onComplete
      () => {
        setIsPlaying(false)
        setStatus('done')
        setStatusMessage('Signing complete')
      }
    )
  }

  // Update speed when it changes
  if (playerRef.current) {
    playerRef.current.setSpeed(playbackSpeed)
  }

  const signText = useCallback(async (text, mode = 'rule', apiKey = '') => {
    if (!playerRef.current) return
    
    setStatus('translating')
    setStatusMessage('Converting text to sign language...')
    
    let glosses
    if (mode === 'llm' && apiKey) {
      glosses = await textToGlossLLM(text, apiKey)
    } else {
      glosses = textToGloss(text)
    }
    
    if (glosses.length === 0) {
      setStatus('idle')
      setStatusMessage('No signs to display')
      return
    }

    setGlossSequence(glosses)
    
    const animations = glossToAnimations(glosses)
    setAnimationQueue(animations)
    
    setStatus('signing')
    setIsPlaying(true)
    playerRef.current.enqueue(animations)

    addToHistory({
      text,
      glosses,
      timestamp: Date.now(),
    })
  }, [setGlossSequence, setIsPlaying, setStatus, setStatusMessage, setAnimationQueue, addToHistory])

  const pause = useCallback(() => {
    playerRef.current?.pause()
    setIsPlaying(false)
  }, [setIsPlaying])

  const resume = useCallback(() => {
    playerRef.current?.resume()
    setIsPlaying(true)
  }, [setIsPlaying])

  const stop = useCallback(() => {
    playerRef.current?.stop()
    setIsPlaying(false)
    setStatus('idle')
    setStatusMessage('')
    setCurrentGlossIndex(-1)
  }, [setIsPlaying, setStatus, setStatusMessage, setCurrentGlossIndex])

  // Animation loop
  useFrame((state, delta) => {
    playerRef.current?.update(delta)
  })

  return { signText, pause, resume, stop }
}
