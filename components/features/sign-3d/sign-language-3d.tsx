'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AvatarModel, type AvatarSkinTone } from './avatar-model'
import {
  textToSignGloss, getLetterPoses, REST_POSE,
  type HandPose, type SignGlossItem,
} from './sign-poses'
import { analyzeEmotion, getExpression, NEUTRAL_EXPRESSION, type FacialExpression } from './emotion-engine'
import { VISEMES } from './lip-sync-engine'

// ─── Constants ───────────────────────────────────────────────────────────────
const SKIN_TONES: { id: AvatarSkinTone; label: string; color: string }[] = [
  { id: 'light',  label: 'Light',  color: '#F5D0B0' },
  { id: 'medium', label: 'Medium', color: '#C68642' },
  { id: 'dark',   label: 'Dark',   color: '#6B4423' },
  { id: 'robot',  label: 'Robot',  color: '#8BA4B8' },
]

// ─── Loading fallback ────────────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <Html center>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#94a3b8' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Zap style={{ width: 32, height: 32, color: '#14b8a6' }} />
        </motion.div>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Loading Avatar…</span>
      </div>
    </Html>
  )
}

// ─── 3D Scene ────────────────────────────────────────────────────────────────
function AvatarScene({
  currentPose, skinTone, expression, headTilt,
}: {
  currentPose: HandPose
  skinTone: AvatarSkinTone
  expression: FacialExpression
  headTilt: { x: number; y: number; z: number }
}) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 6, 3]} intensity={1.4} castShadow color="#FFF8F0" />
      <directionalLight position={[-3, 4, -2]} intensity={0.5} color="#D0E8FF" />
      <pointLight position={[0, 3, 4]} intensity={0.6} color="#FFFDF0" />
      <Environment preset="apartment" />
      <group position={[0, -1.05, 0]}>
        <AvatarModel
          handPose={currentPose}
          skinTone={skinTone}
          expression={expression}
          viseme={VISEMES.rest}
          headTilt={headTilt}
          bodySwayEnabled
        />
      </group>
      <ContactShadows position={[0, -1.08, 0]} opacity={0.35} scale={5} blur={2.5} far={4} />
      <OrbitControls
        enablePan={false}
        minDistance={1.4}
        maxDistance={4.5}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 1.6}
        target={[0, 0.15, 0]}
      />
    </>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface SignLanguage3DProps {
  text: string
  isPlaying?: boolean
  onPlayPause?: (playing: boolean) => void
  /** Compact layout for picture-in-picture over a video */
  variant?: 'default' | 'pip'
}

export function SignLanguage3D({
  text,
  isPlaying: externalPlaying = false,
  onPlayPause,
  variant = 'default',
}: SignLanguage3DProps) {
  const isPip = variant === 'pip'
  // ── Derived data (no state — computed on every render, stable) ─────────────
  const glossItems  = textToSignGloss(text, 'asl')

  // ── UI state ────────────────────────────────────────────────────────────────
  const [playing, setPlaying]           = useState(false)
  const [itemIndex, setItemIndex]       = useState(0)
  const [keyframe, setKeyframe]         = useState(0)
  const [letterIndex, setLetterIndex]   = useState(0)
  const [currentPose, setCurrentPose]   = useState<HandPose>(REST_POSE)
  const [skinTone, setSkinTone]         = useState<AvatarSkinTone>('medium')
  const [speed, setSpeed]               = useState(1)
  const [expression, setExpression]     = useState<FacialExpression>(NEUTRAL_EXPRESSION)
  const [headTilt, setHeadTilt]         = useState({ x: 0, y: 0, z: 0 })

  // ── Refs (mutations that must not re-render) ────────────────────────────────
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playingRef      = useRef(false)   // mirror of `playing` for use inside closures
  const autoStartedRef  = useRef(false)
  const lastAutoTextRef = useRef(text)

  // ── Sync emotion from text — stable dep ────────────────────────────────────
  useEffect(() => {
    const { emotion, intensity } = analyzeEmotion(text)
    setExpression(getExpression(emotion, intensity))
  }, [text])

  // ── Update pose when index/keyframe changes ────────────────────────────────
  useEffect(() => {
    const item = glossItems[itemIndex]
    if (!item) return

    if (item.type === 'word' && item.animation) {
      const pose = item.animation.poses[keyframe] ?? item.animation.poses[0]
      setCurrentPose(pose)
      setHeadTilt({
        x: item.animation.type === 'motion' ? Math.sin(keyframe) * 0.04 : 0,
        y: 0, z: 0,
      })
    } else if (item.type === 'fingerspell' && item.letterPoses) {
      const idx = Math.min(letterIndex, item.letterPoses.length - 1)
      setCurrentPose(item.letterPoses[idx] ?? REST_POSE)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemIndex, keyframe, letterIndex])

  // ── Playback engine ────────────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }, [])

  const stop = useCallback(() => {
    setPlaying(false)
    playingRef.current = false
    clearTimer()
    onPlayPause?.(false)
  }, [clearTimer, onPlayPause])

  // Advance uses refs/closures to avoid stale deps causing re-renders
  const advance = useCallback(() => {
    if (!playingRef.current) return

    setItemIndex(prevItem => {
      setKeyframe(prevKf => {
        setLetterIndex(prevLetter => {
          const item = glossItems[prevItem]
          if (!item) { stop(); return prevLetter }

          if (item.type === 'word' && item.animation) {
            const maxKf = item.animation.poses.length - 1
            if (prevKf < maxKf) {
              // next keyframe in same sign
              const delay = (item.animation.durations?.[prevKf + 1] ?? 500) / speed
              timerRef.current = setTimeout(advance, delay)
              return prevLetter // letterIndex unchanged
            } else if (item.animation.loop) {
              timerRef.current = setTimeout(advance, 400 / speed)
              // reset keyframe via effect
              setTimeout(() => setKeyframe(0), 0)
              return prevLetter
            } else if (prevItem < glossItems.length - 1) {
              setTimeout(() => { setKeyframe(0); setLetterIndex(0) }, 0)
              timerRef.current = setTimeout(advance, 600 / speed)
              return 0
            } else {
              stop(); return prevLetter
            }
          } else if (item.type === 'fingerspell' && item.letterPoses) {
            if (prevLetter < item.letterPoses.length - 1) {
              timerRef.current = setTimeout(advance, 700 / speed)
              return prevLetter + 1
            } else if (prevItem < glossItems.length - 1) {
              setTimeout(() => { setKeyframe(0); setLetterIndex(0) }, 0)
              timerRef.current = setTimeout(advance, 800 / speed)
              return 0
            } else {
              stop(); return prevLetter
            }
          }
          stop(); return prevLetter
        })

        // Advance keyframe for word signs
        const item = glossItems[prevItem]
        if (item?.type === 'word' && item.animation) {
          const maxKf = item.animation.poses.length - 1
          if (prevKf < maxKf) return prevKf + 1
          if (item.animation.loop) return 0
          return 0
        }
        return prevKf
      })

      // Advance item index for non-looping finished signs
      const item = glossItems[prevItem]
      if (item?.type === 'word' && item.animation) {
        const maxKf = item.animation.poses.length - 1
        if (keyframe >= maxKf && !item.animation.loop && prevItem < glossItems.length - 1) {
          return prevItem + 1
        }
      } else if (item?.type === 'fingerspell' && item.letterPoses) {
        if (letterIndex >= item.letterPoses.length - 1 && prevItem < glossItems.length - 1) {
          return prevItem + 1
        }
      }
      return prevItem
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glossItems, speed, stop])

  // ── Simpler advance (replaces the nested setState nightmare above) ──────────
  // Use a separate ref-based approach
  const stateRef = useRef({ itemIndex: 0, keyframe: 0, letterIndex: 0, speed: 1 })
  stateRef.current.speed = speed

  const advanceStep = useCallback(() => {
    if (!playingRef.current) return
    const { itemIndex: ii, keyframe: kf, letterIndex: li } = stateRef.current
    const item = glossItems[ii]
    if (!item) { stop(); return }

    if (item.type === 'word' && item.animation) {
      const maxKf = item.animation.poses.length - 1
      if (kf < maxKf) {
        const next = kf + 1
        stateRef.current.keyframe = next
        setKeyframe(next)
        timerRef.current = setTimeout(advanceStep, (item.animation.durations?.[next] ?? 500) / stateRef.current.speed)
      } else if (item.animation.loop) {
        stateRef.current.keyframe = 0
        setKeyframe(0)
        timerRef.current = setTimeout(advanceStep, 400 / stateRef.current.speed)
      } else if (ii < glossItems.length - 1) {
        const nextItem = ii + 1
        stateRef.current.itemIndex = nextItem
        stateRef.current.keyframe = 0
        stateRef.current.letterIndex = 0
        setItemIndex(nextItem)
        setKeyframe(0)
        setLetterIndex(0)
        timerRef.current = setTimeout(advanceStep, 600 / stateRef.current.speed)
      } else {
        stop()
      }
    } else if (item.type === 'fingerspell' && item.letterPoses) {
      if (li < item.letterPoses.length - 1) {
        const next = li + 1
        stateRef.current.letterIndex = next
        setLetterIndex(next)
        timerRef.current = setTimeout(advanceStep, 700 / stateRef.current.speed)
      } else if (ii < glossItems.length - 1) {
        const nextItem = ii + 1
        stateRef.current.itemIndex = nextItem
        stateRef.current.keyframe = 0
        stateRef.current.letterIndex = 0
        setItemIndex(nextItem)
        setKeyframe(0)
        setLetterIndex(0)
        timerRef.current = setTimeout(advanceStep, 800 / stateRef.current.speed)
      } else {
        stop()
      }
    } else {
      stop()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glossItems, stop])

  const startPlaying = useCallback(() => {
    setPlaying(true)
    playingRef.current = true
    onPlayPause?.(true)
    const item = glossItems[stateRef.current.itemIndex]
    const delay = (item?.type === 'word' && item.animation?.durations?.[0]) ? item.animation.durations[0] / stateRef.current.speed : 600
    timerRef.current = setTimeout(advanceStep, delay)
  }, [advanceStep, glossItems, onPlayPause])

  const reset = useCallback(() => {
    stop()
    stateRef.current = { itemIndex: 0, keyframe: 0, letterIndex: 0, speed: stateRef.current.speed }
    setItemIndex(0); setKeyframe(0); setLetterIndex(0)
    setCurrentPose(REST_POSE); setHeadTilt({ x: 0, y: 0, z: 0 })
  }, [stop])

  // Keep stateRef in sync
  useEffect(() => { stateRef.current.itemIndex = itemIndex }, [itemIndex])
  useEffect(() => { stateRef.current.keyframe = keyframe }, [keyframe])
  useEffect(() => { stateRef.current.letterIndex = letterIndex }, [letterIndex])
  useEffect(() => { stateRef.current.speed = speed }, [speed])

  // When signing source text changes (e.g. transcript finished loading), allow auto-start again
  useEffect(() => {
    if (text !== lastAutoTextRef.current) {
      lastAutoTextRef.current = text
      autoStartedRef.current = false
      stateRef.current = { itemIndex: 0, keyframe: 0, letterIndex: 0, speed: stateRef.current.speed }
      setItemIndex(0)
      setKeyframe(0)
      setLetterIndex(0)
      setCurrentPose(REST_POSE)
      if (externalPlaying) {
        stop()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  // Auto-start wiring (must call startPlaying — timers live there; do not only set `playing`)
  useEffect(() => {
    if (!externalPlaying) {
      if (autoStartedRef.current) {
        autoStartedRef.current = false
        stop()
      }
      return
    }
    if (glossItems.length === 0 || autoStartedRef.current) return
    autoStartedRef.current = true
    const t = setTimeout(() => startPlaying(), 600)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPlaying, glossItems.length, startPlaying, stop])

  useEffect(() => () => clearTimer(), [clearTimer])

  const stepForward = () => {
    if (itemIndex < glossItems.length - 1) {
      const next = itemIndex + 1
      stateRef.current.itemIndex = next
      stateRef.current.keyframe = 0
      stateRef.current.letterIndex = 0
      setItemIndex(next); setKeyframe(0); setLetterIndex(0)
    }
  }
  const stepBackward = () => {
    if (itemIndex > 0) {
      const prev = itemIndex - 1
      stateRef.current.itemIndex = prev
      stateRef.current.keyframe = 0
      stateRef.current.letterIndex = 0
      setItemIndex(prev); setKeyframe(0); setLetterIndex(0)
    }
  }

  const currentItem = glossItems[itemIndex] ?? null
  const progress = glossItems.length > 1 ? Math.round((itemIndex / (glossItems.length - 1)) * 100) : 0

  return (
    <motion.div
      className={cn('w-full', isPip ? 'space-y-1.5' : 'space-y-3')}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >

      {/* ── 3D Canvas ── */}
      <div
        className={cn(
          'relative bg-gradient-to-b from-[#0a1628] via-[#0d1f35] to-[#0a1628] border border-slate-700/50 overflow-hidden shadow-2xl',
          isPip ? 'rounded-xl border-teal-500/40 shadow-black/60' : 'rounded-2xl'
        )}
      >

        <div className={cn('relative', isPip ? 'h-[220px]' : 'h-[480px]')}>
          <Canvas camera={{ position: [0, 0.25, 2.5], fov: 50 }} shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
            <Suspense fallback={<LoadingFallback />}>
              <AvatarScene currentPose={currentPose} skinTone={skinTone} expression={expression} headTilt={headTilt} />
            </Suspense>
          </Canvas>

          {/* Current sign badge */}
          <AnimatePresence mode="wait">
            {currentItem && (
              <motion.div
                key={currentItem.value}
                className={cn(
                  'absolute left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md border border-teal-500/30 text-center pointer-events-none',
                  isPip ? 'bottom-2 px-3 py-1 rounded-lg max-w-[95%]' : 'bottom-4 px-5 py-2 rounded-xl'
                )}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                <p className={cn('uppercase tracking-widest text-teal-400/70 font-bold', isPip ? 'text-[8px]' : 'text-[10px]')}>
                  {currentItem.type === 'word' ? (currentItem.animation?.category ?? 'Signing') : 'Spelling'}
                </p>
                <p className={cn('font-black text-white tracking-wide', isPip ? 'text-sm mt-0' : 'text-xl mt-0.5')}>
                  {currentItem.value}
                </p>
                {!isPip && currentItem.type === 'word' && currentItem.animation && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{currentItem.animation.description}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!isPip && (
            <p className="absolute top-3 left-3 text-[10px] text-slate-500">
              Drag to rotate • Scroll to zoom
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800/80 h-1">
          <motion.div
            className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full"
            animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}
          />
        </div>

        {/* Controls */}
        <div className={cn('flex items-center gap-2 bg-slate-900/60', isPip ? 'px-2 py-2' : 'px-4 py-3')}>
          <button onClick={stepBackward} disabled={itemIndex === 0}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-30 border border-slate-700">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {playing ? (
            <button onClick={stop}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-slate-600 transition">
              <Pause className="w-4 h-4" /> Pause
            </button>
          ) : (
            <button onClick={startPlaying} disabled={glossItems.length === 0}
              className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition disabled:opacity-50">
              <Play className="w-4 h-4" />
              {itemIndex > 0 ? 'Resume' : 'Start Signing'}
            </button>
          )}

          <button onClick={stepForward} disabled={itemIndex >= glossItems.length - 1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-30 border border-slate-700">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={reset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Options ── */}
      <div className={cn('flex flex-wrap items-center', isPip ? 'gap-2' : 'gap-3')}>
        {/* Skin tone dots */}
        {!isPip && (
        <div className="flex items-center gap-1.5 bg-slate-800/60 rounded-xl p-1 border border-slate-700/50">
          {SKIN_TONES.map(t => (
            <button key={t.id} onClick={() => setSkinTone(t.id)} title={t.label}
              className={`w-7 h-7 rounded-lg transition-all border-2 ${skinTone === t.id ? 'border-teal-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
              style={{ background: t.color }} />
          ))}
        </div>
        )}

        {/* Speed */}
        <div className={cn('flex items-center gap-1 bg-slate-800/60 rounded-xl border border-slate-700/50', isPip ? 'p-0.5' : 'p-1')}>
          {([0.5, 1, 1.5, 2] as const).map(v => (
            <button key={v} onClick={() => { setSpeed(v); stateRef.current.speed = v }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${speed === v ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}>
              {v}×
            </button>
          ))}
        </div>
      </div>

      {/* ── Sign word chips ── */}
      {!isPip && glossItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {glossItems.map((item, idx) => (
            <button key={idx}
              onClick={() => {
                stateRef.current = { ...stateRef.current, itemIndex: idx, keyframe: 0, letterIndex: 0 }
                setItemIndex(idx); setKeyframe(0); setLetterIndex(0)
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                idx === itemIndex
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/25'
                  : idx < itemIndex
                  ? 'bg-teal-500/15 text-teal-400'
                  : 'bg-slate-800 text-slate-500 hover:bg-slate-700 border border-slate-700'
              }`}>
              {item.type === 'word' ? `🤟 ${item.value}` : `🔤 ${item.value}`}
            </button>
          ))}
        </div>
      )}

      <p className={cn('text-slate-500 text-center', isPip ? 'text-[9px] leading-tight' : 'text-[10px]')}>
        {isPip ? `${glossItems.length} signs` : `3D Sign Language Interpreter · ${glossItems.length} signs detected`}
      </p>
    </motion.div>
  )
}

export default SignLanguage3D
