'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight,
  Hand, Sparkles, Camera, Globe, User, Smile,
  Zap, Volume2, Eye,
} from 'lucide-react'
import { Hand3DModel, type SkinTone } from './hand-3d-model'
import { AvatarModel, type AvatarSkinTone } from './avatar-model'
import {
  textToSignGloss, getLetterPoses, REST_POSE,
  type HandPose, type SignGlossItem, type SignLanguageMode,
} from './sign-poses'
import {
  analyzeEmotion, getExpression, NEUTRAL_EXPRESSION,
  type FacialExpression, type EmotionType,
} from './emotion-engine'
import {
  generateLipSync, getVisemeAtTime, VISEMES,
  type Viseme, type LipSyncFrame,
} from './lip-sync-engine'

/**
 * 3D Sign Language Digital Interpreter
 * Warm, humanized UI — teal/emerald/amber palette
 */

type ViewMode = 'avatar' | 'hand'
type SignMode = 'signs' | 'spell'

const SKIN_TONES: { id: SkinTone; label: string; color: string }[] = [
  { id: 'light', label: 'Light', color: '#F5D0B0' },
  { id: 'medium', label: 'Medium', color: '#C68642' },
  { id: 'dark', label: 'Dark', color: '#6B4423' },
  { id: 'robot', label: 'Robot', color: '#8BA4B8' },
]

const LANGUAGE_MODES: { id: SignLanguageMode; label: string; flag: string }[] = [
  { id: 'asl', label: 'ASL', flag: '🇺🇸' },
  { id: 'isl', label: 'ISL', flag: '🇮🇳' },
]

const EMOTION_ICONS: Record<EmotionType, string> = {
  neutral: '😐', happy: '😊', sad: '😢', surprised: '😲',
  angry: '😠', thinking: '🤔', excited: '🤩', confused: '😕',
}

// ─── Framer Motion Variants ───
const fadeSlide = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: 'easeOut' },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.2, ease: 'easeOut' },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
}

const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
}

// ─── Full Avatar 3D Scene ───
function AvatarScene({
  currentPose, skinTone, expression, viseme, headTilt,
}: {
  currentPose: HandPose; skinTone: AvatarSkinTone; expression: FacialExpression; viseme: Viseme; headTilt: { x: number; y: number; z: number }
}) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 2]} intensity={1.1} castShadow color="#FFF5E0" />
      <directionalLight position={[-2, 3, -1]} intensity={0.4} color="#E0F0FF" />
      <pointLight position={[0, 2, 3]} intensity={0.5} color="#FFFFF0" />
      <pointLight position={[-1, -1, 2]} intensity={0.25} color="#FFE8D0" />
      <Environment preset="apartment" />
      <group position={[0, 0.6, 0]}>
        <AvatarModel handPose={currentPose} skinTone={skinTone} expression={expression} viseme={viseme} headTilt={headTilt} bodySwayEnabled />
      </group>
      <ContactShadows position={[0, -1.0, 0]} opacity={0.3} scale={5} blur={2.5} far={4} />
      <OrbitControls enablePan={false} minDistance={1.5} maxDistance={5} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 1.6} target={[0, 0.3, 0]} />
    </>
  )
}

// ─── Hand Close-up Scene ───
function HandScene({ currentPose, skinTone, mirror }: { currentPose: HandPose; skinTone: SkinTone; mirror: boolean }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 2]} intensity={1.1} castShadow color="#FFF5E0" />
      <directionalLight position={[-2, 3, -1]} intensity={0.4} color="#E0F0FF" />
      <pointLight position={[0, 2, 3]} intensity={0.5} />
      <pointLight position={[-1, -1, 2]} intensity={0.25} color="#FFE8D0" />
      <Environment preset="apartment" />
      <group position={[0, 0.3, 0]} rotation={[0.2, mirror ? -0.3 : 0.3, 0]}>
        <Hand3DModel targetPose={currentPose} skinTone={skinTone} transitionSpeed={6} mirror={mirror} scale={2.5} />
      </group>
      <ContactShadows position={[0, -1.2, 0]} opacity={0.35} scale={4} blur={2} far={3} />
      <OrbitControls enablePan={false} minDistance={2} maxDistance={6} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 1.8} target={[0, 0.5, 0]} />
    </>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Zap className="w-8 h-8" />
        </motion.div>
        <span className="text-xs font-medium">Loading 3D Avatar...</span>
      </div>
    </Html>
  )
}

// ─── Main Component ───
interface SignLanguage3DProps {
  text: string
  isPlaying?: boolean
  onPlayPause?: (playing: boolean) => void
}

export function SignLanguage3D({ text, isPlaying: externalPlaying = false, onPlayPause }: SignLanguage3DProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('avatar')
  const [signMode, setSignMode] = useState<SignMode>('signs')
  const [languageMode, setLanguageMode] = useState<SignLanguageMode>('asl')
  const [playing, setPlaying] = useState(externalPlaying)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [currentKeyframe, setCurrentKeyframe] = useState(0)
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [currentPose, setCurrentPose] = useState<HandPose>(REST_POSE)
  const [skinTone, setSkinTone] = useState<SkinTone>('medium')
  const [mirror, setMirror] = useState(false)
  const [speed, setSpeed] = useState<number>(1)
  const [expression, setExpression] = useState<FacialExpression>(NEUTRAL_EXPRESSION)
  const [currentViseme, setCurrentViseme] = useState<Viseme>(VISEMES.rest)
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0, z: 0 })
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionType>('neutral')
  const [lipSyncFrames, setLipSyncFrames] = useState<LipSyncFrame[]>([])
  const [lipSyncStartTime, setLipSyncStartTime] = useState<number>(0)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lipSyncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const glossItems = textToSignGloss(text, languageMode)
  const letterPoses = getLetterPoses(languageMode)
  const spellChars = text.replace(/[^a-zA-Z\s]/g, '').toLowerCase().split('').filter(Boolean)
  const currentItem = signMode === 'signs' ? glossItems[currentItemIndex] : null
  const currentChar = signMode === 'spell' ? spellChars[currentLetterIndex] : ''

  useEffect(() => {
    const { emotion, intensity } = analyzeEmotion(text)
    setDetectedEmotion(emotion)
    setExpression(getExpression(emotion, intensity))
  }, [text])

  useEffect(() => {
    if (currentItem?.type === 'word' && currentItem.animation) {
      setLipSyncFrames(generateLipSync(currentItem.value, 120 * speed))
    } else if (signMode === 'spell' && currentChar) {
      setLipSyncFrames(generateLipSync(currentChar, 60))
    }
  }, [currentItem, currentChar, signMode, speed])

  useEffect(() => {
    if (signMode === 'signs' && currentItem) {
      if (currentItem.type === 'word' && currentItem.animation) {
        const pose = currentItem.animation.poses[currentKeyframe] || currentItem.animation.poses[0]
        setCurrentPose(pose)
        setHeadTilt({ x: currentItem.animation.type === 'motion' ? Math.sin(currentKeyframe) * 0.05 : 0, y: 0, z: 0 })
      } else if (currentItem.type === 'fingerspell' && currentItem.letterPoses) {
        const idx = Math.min(currentLetterIndex, currentItem.letterPoses.length - 1)
        setCurrentPose(currentItem.letterPoses[idx] || REST_POSE)
      }
    } else if (signMode === 'spell' && currentChar) {
      setCurrentPose(letterPoses[currentChar] || REST_POSE)
    }
  }, [signMode, currentItemIndex, currentKeyframe, currentLetterIndex, currentChar, letterPoses])

  const startLipSync = useCallback(() => {
    if (lipSyncIntervalRef.current) clearInterval(lipSyncIntervalRef.current)
    setLipSyncStartTime(Date.now())
    lipSyncIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lipSyncStartTime
      setCurrentViseme(getVisemeAtTime(lipSyncFrames, elapsed))
    }, 50)
  }, [lipSyncFrames, lipSyncStartTime])

  const stopLipSync = useCallback(() => {
    if (lipSyncIntervalRef.current) { clearInterval(lipSyncIntervalRef.current); lipSyncIntervalRef.current = null }
    setCurrentViseme(VISEMES.rest)
  }, [])

  const clearTimer = useCallback(() => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null } }, [])

  const stopPlaying = useCallback(() => { setPlaying(false); clearTimer(); stopLipSync(); onPlayPause?.(false) }, [clearTimer, stopLipSync, onPlayPause])

  const advancePlayback = useCallback(() => {
    if (signMode === 'signs') {
      const item = glossItems[currentItemIndex]
      if (!item) { stopPlaying(); return }
      if (item.type === 'word' && item.animation) {
        const maxKf = item.animation.poses.length - 1
        if (currentKeyframe < maxKf) {
          setCurrentKeyframe(prev => prev + 1)
          timerRef.current = setTimeout(advancePlayback, (item.animation.durations?.[currentKeyframe + 1] || 500) / speed)
        } else if (item.animation.loop) {
          setCurrentKeyframe(0)
          timerRef.current = setTimeout(advancePlayback, 400 / speed)
        } else if (currentItemIndex < glossItems.length - 1) {
          setCurrentItemIndex(prev => prev + 1); setCurrentKeyframe(0); setCurrentLetterIndex(0)
          setLipSyncStartTime(Date.now())
          timerRef.current = setTimeout(advancePlayback, 600 / speed)
        } else { stopPlaying() }
      } else if (item.type === 'fingerspell' && item.letterPoses) {
        if (currentLetterIndex < item.letterPoses.length - 1) {
          setCurrentLetterIndex(prev => prev + 1)
          timerRef.current = setTimeout(advancePlayback, 700 / speed)
        } else if (currentItemIndex < glossItems.length - 1) {
          setCurrentItemIndex(prev => prev + 1); setCurrentKeyframe(0); setCurrentLetterIndex(0)
          timerRef.current = setTimeout(advancePlayback, 800 / speed)
        } else { stopPlaying() }
      }
    } else {
      if (currentLetterIndex < spellChars.length - 1) {
        setCurrentLetterIndex(prev => prev + 1)
        timerRef.current = setTimeout(advancePlayback, 700 / speed)
      } else { stopPlaying() }
    }
  }, [signMode, currentItemIndex, currentKeyframe, currentLetterIndex, glossItems, spellChars, speed, stopPlaying])

  const startPlaying = useCallback(() => {
    setPlaying(true); onPlayPause?.(true); startLipSync()
    const item = glossItems[currentItemIndex]
    timerRef.current = setTimeout(advancePlayback, ((item?.type === 'word' && item.animation?.durations?.[0]) || 600) / speed)
  }, [advancePlayback, currentItemIndex, glossItems, onPlayPause, speed, startLipSync])

  useEffect(() => () => { clearTimer(); stopLipSync() }, [clearTimer, stopLipSync])

  const reset = useCallback(() => {
    stopPlaying(); setCurrentItemIndex(0); setCurrentKeyframe(0); setCurrentLetterIndex(0)
    setCurrentPose(REST_POSE); setCurrentViseme(VISEMES.rest); setHeadTilt({ x: 0, y: 0, z: 0 })
  }, [stopPlaying])

  const stepForward = useCallback(() => {
    if (signMode === 'signs') { if (currentItemIndex < glossItems.length - 1) { setCurrentItemIndex(prev => prev + 1); setCurrentKeyframe(0); setCurrentLetterIndex(0) } }
    else { if (currentLetterIndex < spellChars.length - 1) setCurrentLetterIndex(prev => prev + 1) }
  }, [signMode, currentItemIndex, currentLetterIndex, glossItems.length, spellChars.length])

  const stepBackward = useCallback(() => {
    if (signMode === 'signs') { if (currentItemIndex > 0) { setCurrentItemIndex(prev => prev - 1); setCurrentKeyframe(0); setCurrentLetterIndex(0) } }
    else { if (currentLetterIndex > 0) setCurrentLetterIndex(prev => prev - 1) }
  }, [signMode, currentItemIndex, currentLetterIndex])

  const totalItems = signMode === 'signs' ? glossItems.length : spellChars.length
  const currentIdx = signMode === 'signs' ? currentItemIndex : currentLetterIndex
  const progress = totalItems > 1 ? Math.round((currentIdx / (totalItems - 1)) * 100) : 0
  const wordCount = signMode === 'signs' ? glossItems.filter(g => g.type === 'word').length : 0

  return (
    <motion.div className="w-full space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

      {/* ─── Top Controls ─── */}
      <motion.div className="flex flex-wrap items-center gap-2 justify-center" variants={staggerContainer} initial="initial" animate="animate">
        {/* View Mode */}
        <motion.div variants={staggerItem} className="flex items-center gap-1 bg-slate-800/70 rounded-xl p-1 border border-slate-700/50">
          <button onClick={() => setViewMode('avatar')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'avatar' ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
            }`}>
            <User className="w-3.5 h-3.5" /> Full Avatar
          </button>
          <button onClick={() => setViewMode('hand')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'hand' ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
            }`}>
            <Hand className="w-3.5 h-3.5" /> Hand Close-up
          </button>
        </motion.div>

        {/* Language Toggle */}
        <motion.div variants={staggerItem} className="flex items-center gap-1 bg-slate-800/70 rounded-xl p-1 border border-slate-700/50">
          {LANGUAGE_MODES.map(lang => (
            <button key={lang.id} onClick={() => { setLanguageMode(lang.id); reset() }}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                languageMode === lang.id ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
              }`}>
              <span className="text-sm">{lang.flag}</span> {lang.label}
            </button>
          ))}
        </motion.div>

        {/* Sign Mode */}
        <motion.div variants={staggerItem} className="flex items-center gap-1 bg-slate-800/70 rounded-xl p-1 border border-slate-700/50">
          <button onClick={() => { setSignMode('signs'); reset() }}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              signMode === 'signs' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
            }`}>
            <Sparkles className="w-3.5 h-3.5" /> Signs
          </button>
          <button onClick={() => { setSignMode('spell'); reset() }}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              signMode === 'spell' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
            }`}>
            🔤 Spell
          </button>
        </motion.div>
      </motion.div>

      {/* ─── 3D Canvas + Info Panel ─── */}
      <motion.div className="relative bg-gradient-to-b from-slate-900 via-[#0f1a24] to-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl" layout transition={{ duration: 0.3 }}>
        <div className="flex flex-col lg:flex-row">
          {/* 3D Viewer */}
          <div className="flex-1 min-h-[450px] relative">
            <Canvas
              camera={{ position: viewMode === 'avatar' ? [0, 0.5, 2.8] : [0, 1.5, 3.5], fov: viewMode === 'avatar' ? 45 : 40 }}
              shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}
            >
              <Suspense fallback={<LoadingFallback />}>
                {viewMode === 'avatar' ? (
                  <AvatarScene currentPose={currentPose} skinTone={skinTone as AvatarSkinTone} expression={expression} viseme={currentViseme} headTilt={headTilt} />
                ) : (
                  <HandScene currentPose={currentPose} skinTone={skinTone} mirror={mirror} />
                )}
              </Suspense>
            </Canvas>

            {/* Language badge */}
            <motion.div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700/50 font-bold"
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              {languageMode === 'asl' ? '🇺🇸 ASL' : '🇮🇳 ISL'}
            </motion.div>

            {/* Emotion badge (avatar mode) */}
            {viewMode === 'avatar' && (
              <motion.div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm text-xs px-3 py-1.5 rounded-lg border border-slate-700/50 font-bold"
                initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} key={detectedEmotion}>
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300">{EMOTION_ICONS[detectedEmotion]} {detectedEmotion}</span>
              </motion.div>
            )}

            {/* Camera hint */}
            <motion.div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-sm text-slate-400 text-[10px] px-2.5 py-1.5 rounded-lg border border-slate-700/50"
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <Camera className="w-3 h-3" /> Drag to rotate • Scroll to zoom
            </motion.div>

            {/* Lip sync indicator */}
            {viewMode === 'avatar' && playing && (
              <motion.div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-teal-900/60 backdrop-blur-sm text-teal-300 text-[10px] px-2.5 py-1.5 rounded-lg border border-teal-700/40"
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                  <Volume2 className="w-3 h-3" />
                </motion.div>
                Lip Sync Active
              </motion.div>
            )}
          </div>

          {/* ─── Info Panel ─── */}
          <div className="lg:w-80 p-5 bg-[#0f1a24]/80 border-t lg:border-t-0 lg:border-l border-slate-700/50 space-y-4 overflow-y-auto max-h-[500px]">
            <AnimatePresence mode="wait">
              {signMode === 'signs' && currentItem ? (
                <motion.div key={`sign-${currentItemIndex}`} {...fadeSlide} className="space-y-3">
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                      {currentItem.type === 'word' ? currentItem.animation?.category || 'Sign' : 'Fingerspell'}
                    </span>
                    <motion.p className="text-3xl font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent mt-1"
                      key={currentItem.value} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                      {currentItem.value}
                    </motion.p>
                  </div>

                  {currentItem.type === 'word' && currentItem.animation && (
                    <>
                      <motion.div className="bg-teal-500/10 rounded-lg p-3 border border-teal-500/20" {...scaleIn}>
                        <p className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                          <Hand className="w-3.5 h-3.5" /> Description
                        </p>
                        <p className="text-xs text-teal-300/80 mt-1">{currentItem.animation.description}</p>
                      </motion.div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="bg-slate-700/50 px-2 py-1 rounded">Keyframe {currentKeyframe + 1}/{currentItem.animation.poses.length}</span>
                        <span className="bg-slate-700/50 px-2 py-1 rounded">{currentItem.animation.type === 'motion' ? '🎬 Animated' : '📸 Static'}</span>
                      </div>
                    </>
                  )}

                  {currentItem.type === 'fingerspell' && (
                    <motion.div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50" {...scaleIn}>
                      <p className="text-xs text-slate-400">No word sign — spelling: <strong className="text-slate-300">{currentItem.value}</strong></p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {currentItem.value.split('').map((c, i) => (
                          <motion.span key={i}
                            className={`w-7 h-8 flex items-center justify-center rounded text-xs font-mono font-bold transition-all ${
                              i === currentLetterIndex ? 'bg-teal-500 text-white scale-110' : i < currentLetterIndex ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-700 text-slate-500'
                            }`}
                            animate={i === currentLetterIndex ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.3 }}>
                            {c}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : signMode === 'spell' ? (
                <motion.div key={`spell-${currentLetterIndex}`} {...fadeSlide} className="space-y-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Letter</p>
                    <motion.p className="text-5xl font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent"
                      key={currentChar} initial={{ scale: 0.5, opacity: 0, rotateY: -90 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}>
                      {currentChar === ' ' ? '⎵' : currentChar.toUpperCase()}
                    </motion.p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Emotion display */}
            {viewMode === 'avatar' && (
              <motion.div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20" {...scaleIn}>
                <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Emotional AI</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl">{EMOTION_ICONS[detectedEmotion]}</span>
                  <div>
                    <p className="text-xs text-amber-300 font-bold capitalize">{detectedEmotion}</p>
                    <p className="text-[10px] text-amber-400/60">Detected from text</p>
                  </div>
                </div>
                <div className="mt-2 w-full bg-slate-700/50 rounded-full h-1.5">
                  <motion.div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${expression.intensity * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
              </motion.div>
            )}

            {/* Skin Tone */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Skin Tone:</p>
              <div className="flex gap-1.5">
                {SKIN_TONES.map(tone => (
                  <motion.button key={tone.id} onClick={() => setSkinTone(tone.id)}
                    className={`flex-1 py-2 px-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                      skinTone === tone.id ? 'bg-teal-500/20 text-teal-400 ring-1 ring-teal-500/40' : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'
                    }`}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <span className="w-3 h-3 rounded-full border border-slate-600" style={{ background: tone.color }} />
                    {tone.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Mirror toggle (hand mode) */}
            {viewMode === 'hand' && (
              <motion.div {...fadeSlide}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Mirror:</span>
                  <button onClick={() => setMirror(!mirror)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mirror ? 'bg-teal-500 text-white' : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'}`}>
                    {mirror ? 'Left Hand' : 'Right Hand'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Speed */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Speed:</p>
              <div className="flex gap-1">
                {[{ label: '0.5x', val: 0.5 }, { label: '1x', val: 1 }, { label: '1.5x', val: 1.5 }, { label: '2x', val: 2 }].map(s => (
                  <motion.button key={s.label} onClick={() => setSpeed(s.val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${speed === s.val ? 'bg-teal-500 text-white' : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'}`}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {s.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <motion.div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 h-full rounded-r"
            animate={{ width: `${progress}%` }} transition={{ duration: 0.3, ease: 'easeOut' }} />
        </div>
      </motion.div>

      {/* ─── Playback Controls ─── */}
      <motion.div className="flex items-center gap-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <motion.button onClick={stepBackward} disabled={currentIdx === 0}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-30 border border-slate-700"
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        {playing ? (
          <motion.button onClick={stopPlaying}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-slate-600"
            whileTap={{ scale: 0.98 }}>
            <Pause className="w-4 h-4" /> Pause
          </motion.button>
        ) : (
          <motion.button onClick={startPlaying} disabled={totalItems === 0}
            className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(20, 184, 166, 0.3)' }} whileTap={{ scale: 0.98 }}>
            <Play className="w-4 h-4" />
            {currentIdx > 0 ? 'Resume' : `Start ${viewMode === 'avatar' ? '🧍 Avatar' : '🖐️ Hand'} ${languageMode.toUpperCase()}`}
          </motion.button>
        )}

        <motion.button onClick={stepForward} disabled={currentIdx >= totalItems - 1}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-30 border border-slate-700"
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        <motion.button onClick={reset}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          whileHover={{ scale: 1.1, rotate: -180 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.3 }}>
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* ─── Sign sequence ─── */}
      {signMode === 'signs' && glossItems.length > 0 && (
        <motion.div className="flex flex-wrap gap-1.5 justify-center" variants={staggerContainer} initial="initial" animate="animate">
          {glossItems.map((item, idx) => (
            <motion.button key={idx} variants={staggerItem}
              onClick={() => { setCurrentItemIndex(idx); setCurrentKeyframe(0); setCurrentLetterIndex(0) }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                idx === currentItemIndex
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'
                  : idx < currentItemIndex
                  ? 'bg-teal-500/15 text-teal-400'
                  : 'bg-slate-800 text-slate-500 hover:bg-slate-700 border border-slate-700'
              }`}
              whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
              {item.type === 'word' ? `🤟 ${item.value}` : `🔤 ${item.value}`}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* ─── Footer ─── */}
      <motion.div className="text-xs text-slate-500 text-center space-y-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <p>
          {viewMode === 'avatar' ? '🧍 Full Avatar' : '🖐️ Hand'} •{' '}
          {languageMode === 'asl' ? '🇺🇸 ASL' : '🇮🇳 ISL'} •{' '}
          {signMode === 'signs' ? `${glossItems.length} signs (${wordCount} word signs)` : `${spellChars.length} letters`}
          {viewMode === 'avatar' && ` • ${EMOTION_ICONS[detectedEmotion]} ${detectedEmotion}`}
        </p>
        <p className="text-[10px] opacity-70">
          {viewMode === 'avatar' ? '3D Digital Interpreter with lip sync, facial expressions & emotional AI' : 'Interactive 3D hand model • Drag to rotate • Scroll to zoom'}
        </p>
      </motion.div>
    </motion.div>
  )
}

export default SignLanguage3D
