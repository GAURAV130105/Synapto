'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Hand, Info, Sparkles } from 'lucide-react'
import {
  RoboticHandOpen, RoboticHandFist, RoboticHandPointing, RoboticHandFlat,
  RoboticSingleHand, HAND_THEMES, HandThemeName,
  type HandTheme,
} from './robotic-hands'
import { ASL_HANDSHAPES } from './asl-handshapes'

/**
 * Premium Robotic ASL Sign Language Avatar
 * Features high-quality mechanical hand illustrations with:
 * - Metallic segmented fingers with glowing joints
 * - Multiple hand themes (Silver, Gold, Dark)
 * - Two-hand word signs + fingerspelling
 * - Step-by-step instructions
 */

// ─── ASL Word Signs Database ───
interface ASLSign {
  word: string
  leftHand: 'open' | 'fist' | 'pointing' | 'flat'
  rightHand: 'open' | 'fist' | 'pointing' | 'flat'
  steps: string[]
  movement: string
  category: string
}

const HAND_COMPONENTS = {
  open: RoboticHandOpen,
  fist: RoboticHandFist,
  pointing: RoboticHandPointing,
  flat: RoboticHandFlat,
}

const ASL_WORD_SIGNS: ASLSign[] = [
  {
    word: 'HELLO', leftHand: 'open', rightHand: 'open',
    steps: [
      'Raise your dominant (right) hand to the side of your forehead',
      'Keep your hand flat with fingers together, palm facing outward',
      'Move your hand outward from your forehead in a small wave',
      'Like a salute that opens up — a friendly wave away from your head',
    ],
    movement: 'Hand moves outward from forehead', category: 'Greeting',
  },
  {
    word: 'THANK YOU', leftHand: 'open', rightHand: 'flat',
    steps: [
      'Touch your chin or lips with the fingertips of your flat right hand',
      'Your left hand stays relaxed at your side or in a neutral position',
      'Move your right hand forward and slightly down, away from your chin',
      'Like blowing a kiss of gratitude — fingers move from mouth outward',
    ],
    movement: 'Right hand moves from chin outward', category: 'Politeness',
  },
  {
    word: 'PLEASE', leftHand: 'open', rightHand: 'flat',
    steps: [
      'Place your flat right hand on your chest (over your heart)',
      'Keep your fingers together and palm flat against your chest',
      'Make a circular rubbing motion on your chest — clockwise',
      'This is a warm, polite gesture showing earnest request',
    ],
    movement: 'Circular motion on chest', category: 'Politeness',
  },
  {
    word: 'SORRY', leftHand: 'open', rightHand: 'fist',
    steps: [
      'Make a fist with your right hand (the letter A)',
      'Place your fist on your chest, over your heart area',
      'Rub your fist in a circular motion on your chest',
      'Similar to "please" but uses a fist instead of flat hand — shows remorse',
    ],
    movement: 'Fist circles on chest', category: 'Emotion',
  },
  {
    word: 'YES', leftHand: 'open', rightHand: 'fist',
    steps: [
      'Make a fist with your right hand (like the letter S)',
      'Hold your fist in front of you at about chin level',
      'Nod your fist up and down — like your hand is nodding "yes"',
      'The wrist bends to make the fist bob, mimicking a head nod',
    ],
    movement: 'Fist nods up and down', category: 'Response',
  },
  {
    word: 'NO', leftHand: 'open', rightHand: 'pointing',
    steps: [
      'Extend your index and middle finger on your right hand',
      'Hold your thumb out slightly — like making a "duck bill"',
      'Snap your index+middle fingers against your thumb quickly',
      'The fingers close to thumb like a mouth shutting — a sharp "no"',
    ],
    movement: 'Fingers snap to thumb', category: 'Response',
  },
  {
    word: 'HELP', leftHand: 'flat', rightHand: 'fist',
    steps: [
      'Make a fist with your right hand, thumb pointing up (thumbs up)',
      'Place your right fist on your left palm — flat left hand supports it',
      'Lift both hands together upward from waist level',
      'Your left hand "helps" the right fist rise up — symbolizing assistance',
    ],
    movement: 'Both hands lift upward together', category: 'Action',
  },
  {
    word: 'FRIEND', leftHand: 'pointing', rightHand: 'pointing',
    steps: [
      'Make an X shape by hooking your right index finger',
      'Hook your left index finger into it — link them together',
      'The linked hooks connect at the knuckle area',
      'Then reverse: left on top, right below — showing mutual bond',
    ],
    movement: 'Index fingers hook together, then swap', category: 'People',
  },
  {
    word: 'LEARN', leftHand: 'flat', rightHand: 'open',
    steps: [
      'Hold your left hand flat, palm up (like an open book)',
      'Place your right fingertips on your left palm — "picking up" info',
      'Pull your right hand up toward your forehead',
      'Close your fingers as you reach your head — "putting knowledge in"',
    ],
    movement: 'Right hand moves from palm to forehead', category: 'Education',
  },
  {
    word: 'LOVE', leftHand: 'open', rightHand: 'open',
    steps: [
      'Cross both arms over your chest, forming an X',
      'Place your fists/hands against your chest, arms crossed',
      'This looks like you are giving yourself a big hug',
      'Hold this position briefly — it represents embracing love',
    ],
    movement: 'Arms cross over chest in a hug', category: 'Emotion',
  },
]

// ASL letter descriptions
const ASL_LETTER_DESCRIPTIONS: Record<string, string> = {
  a: 'Closed fist, thumb rests beside index finger',
  b: 'Flat hand pointing up, fingers together, thumb tucked across palm',
  c: 'Hand curves into a C shape, like holding a cup',
  d: 'Index finger points up, thumb and other fingers form a circle',
  e: 'Fingers curled down tightly, thumb tucked below',
  f: 'Thumb and index finger touch in a circle, other fingers spread up',
  g: 'Fist with index finger and thumb pointing sideways together',
  h: 'Index and middle finger extended sideways together',
  i: 'Fist with pinky finger extended straight up',
  j: 'Like I, but trace a J curve downward with pinky',
  k: 'Index and middle finger up in V, thumb touches middle finger',
  l: 'L-shape — index finger up, thumb extended sideways',
  m: 'Three fingers draped over thumb, fist position',
  n: 'Two fingers draped over thumb, fist position',
  o: 'All fingertips touch thumb, forming an O circle',
  p: 'Like K but angled downward toward the floor',
  q: 'Like G but angled downward toward the floor',
  r: 'Index and middle fingers crossed tightly',
  s: 'Tight fist with thumb wrapped over fingers',
  t: 'Thumb tucked between index and middle finger in fist',
  u: 'Index and middle finger point up together, close together',
  v: 'Index and middle finger up and spread apart — peace sign',
  w: 'Index, middle, and ring fingers spread up — like the number 3',
  x: 'Index finger bent like a hook, other fingers in fist',
  y: 'Thumb and pinky extended outward — hang loose / shaka',
  z: 'Index finger traces a Z shape in the air',
  ' ': 'Pause — space between words',
}

// ─── Main Component ───
interface SignLanguageAvatarProps {
  text: string
  isPlaying?: boolean
  onPlayPause?: (playing: boolean) => void
}

export function SignLanguageAvatar({
  text,
  isPlaying: externalPlaying = false,
  onPlayPause,
}: SignLanguageAvatarProps) {
  const [mode, setMode] = useState<'words' | 'spell'>('words')
  const [playing, setPlaying] = useState(externalPlaying)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [speed, setSpeed] = useState(2000)
  const [themeName, setThemeName] = useState<HandThemeName>('silver')
  const [showInstructions, setShowInstructions] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const theme = HAND_THEMES[themeName]

  const words = text.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean).map(w => w.toUpperCase())

  const signSequence: Array<{ type: 'sign'; sign: ASLSign } | { type: 'spell'; word: string }> = words.map(w => {
    const found = ASL_WORD_SIGNS.find(s => s.word === w)
    return found ? { type: 'sign' as const, sign: found } : { type: 'spell' as const, word: w }
  })

  const spellChars = text.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').slice(0, 200).toLowerCase().split('')

  const currentItem = mode === 'words' ? signSequence[currentIndex] : null
  const currentChar = mode === 'spell' ? (spellChars[currentIndex] || ' ') : ''

  useEffect(() => {
    if (!playing) return
    intervalRef.current = setInterval(() => {
      if (mode === 'words') {
        setCurrentStep(prev => {
          const maxSteps = currentItem?.type === 'sign' ? currentItem.sign.steps.length - 1 : 0
          if (prev >= maxSteps) {
            setCurrentIndex(prevIdx => {
              if (prevIdx >= signSequence.length - 1) { stopPlaying(); return 0 }
              return prevIdx + 1
            })
            return 0
          }
          return prev + 1
        })
      } else {
        setCurrentIndex(prev => {
          if (prev >= spellChars.length - 1) { stopPlaying(); return 0 }
          return prev + 1
        })
      }
    }, speed)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, speed, mode, currentIndex, signSequence.length, spellChars.length])

  const startPlaying = () => { setPlaying(true); onPlayPause?.(true) }
  const stopPlaying = () => {
    setPlaying(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    onPlayPause?.(false)
  }
  const reset = () => { stopPlaying(); setCurrentIndex(0); setCurrentStep(0) }
  const stepForward = () => {
    const max = mode === 'words' ? signSequence.length - 1 : spellChars.length - 1
    if (currentIndex < max) { setCurrentIndex(p => p + 1); setCurrentStep(0) }
  }
  const stepBackward = () => {
    if (currentIndex > 0) { setCurrentIndex(p => p - 1); setCurrentStep(0) }
  }

  const totalItems = mode === 'words' ? signSequence.length : spellChars.length
  const progress = totalItems > 1 ? Math.round((currentIndex / (totalItems - 1)) * 100) : 0

  const getSpellWordContext = useCallback(() => {
    const cleanText = spellChars.join('')
    let wordStart = cleanText.lastIndexOf(' ', currentIndex)
    if (wordStart === -1) wordStart = 0; else wordStart++
    let wordEnd = cleanText.indexOf(' ', currentIndex)
    if (wordEnd === -1) wordEnd = cleanText.length
    return { word: cleanText.slice(wordStart, wordEnd), charInWord: currentIndex - wordStart }
  }, [spellChars, currentIndex])

  // Render hand by type
  const renderHand = (type: string, side: 'left' | 'right') => {
    const Comp = HAND_COMPONENTS[type as keyof typeof HAND_COMPONENTS] || RoboticHandOpen
    return <Comp theme={theme} side={side} />
  }

  return (
    <div className="w-full space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2 justify-center">
        <button
          onClick={() => { setMode('words'); reset() }}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            mode === 'words'
              ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-1.5" /> Word Signs
        </button>
        <button
          onClick={() => { setMode('spell'); reset() }}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            mode === 'spell'
              ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          🔤 Fingerspelling
        </button>
      </div>

      {/* Main display */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row">
          {/* Hand display area */}
          <div className="flex-1 flex items-center justify-center p-8 min-h-[400px] relative">
            {/* Grid background pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }} />

            {mode === 'words' && currentItem ? (
              <div className="flex items-center gap-6 relative z-10">
                {/* LEFT HAND */}
                <div className="relative">
                  <svg viewBox="-10 -20 290 330" className="w-48 h-56" style={{ transition: 'all 0.4s ease' }}>
                    {currentItem.type === 'sign'
                      ? renderHand(currentItem.sign.leftHand, 'left')
                      : <RoboticHandOpen theme={theme} side="left" />}
                  </svg>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 bg-slate-800/90 px-3 py-0.5 rounded-full border border-slate-700">LEFT</span>
                </div>
                {/* RIGHT HAND */}
                <div className="relative">
                  <svg viewBox="-10 -20 290 330" className="w-48 h-56" style={{ transition: 'all 0.4s ease' }}>
                    {currentItem.type === 'sign'
                      ? renderHand(currentItem.sign.rightHand, 'right')
                      : <RoboticHandOpen theme={theme} side="right" />}
                  </svg>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 bg-slate-800/90 px-3 py-0.5 rounded-full border border-slate-700">RIGHT</span>
                </div>
              </div>
            ) : mode === 'spell' ? (
              <div className="relative z-10">
                <svg viewBox="-10 -20 290 330" className="w-60 h-68" style={{ transition: 'all 0.3s ease' }}>
                  <RoboticSingleHand letter={currentChar} theme={theme} />
                </svg>
                {currentChar !== ' ' && (
                  <div className="absolute -top-3 -right-3 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-blue-500/40 border-2 border-blue-400/30">
                    {currentChar.toUpperCase()}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Info panel */}
          <div className="lg:w-80 p-5 bg-slate-800/60 border-t lg:border-t-0 lg:border-l border-slate-700 space-y-4">
            {mode === 'words' && currentItem ? (
              <>
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                    {currentItem.type === 'sign' ? currentItem.sign.category : 'Fingerspell'}
                  </span>
                  <p className="text-3xl font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mt-1">
                    {currentItem.type === 'sign' ? currentItem.sign.word : currentItem.word}
                  </p>
                </div>

                {currentItem.type === 'sign' && showInstructions && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> Step-by-Step
                    </p>
                    {currentItem.sign.steps.map((step, idx) => (
                      <div key={idx} className={`flex items-start gap-2 p-2 rounded-lg text-xs transition-all ${
                        idx === currentStep
                          ? 'bg-blue-500/15 text-blue-300 font-semibold ring-1 ring-blue-500/30'
                          : idx < currentStep
                          ? 'text-slate-600 line-through opacity-50'
                          : 'text-slate-400 opacity-70'
                      }`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                          idx === currentStep ? 'bg-blue-500 text-white' :
                          idx < currentStep ? 'bg-slate-700 text-slate-500' : 'bg-slate-700/50 text-slate-500'
                        }`}>{idx + 1}</span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {currentItem.type === 'sign' && (
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                    <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Hand className="w-3.5 h-3.5" /> Movement
                    </p>
                    <p className="text-xs text-amber-300/80 mt-1">{currentItem.sign.movement}</p>
                  </div>
                )}

                {currentItem.type === 'spell' && (
                  <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                    <p className="text-xs text-slate-400">
                      This word doesn&apos;t have a common ASL sign — fingerspell each letter: <strong className="text-slate-300">{currentItem.word}</strong>
                    </p>
                  </div>
                )}
              </>
            ) : mode === 'spell' ? (
              <>
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Sign</p>
                  <p className="text-5xl font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    {currentChar === ' ' ? '⎵' : currentChar.toUpperCase()}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600 space-y-2">
                  <p className="text-xs font-semibold text-slate-300 mb-1">Hand Position:</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {ASL_LETTER_DESCRIPTIONS[currentChar] || 'Form this letter with your dominant hand'}
                  </p>
                  {ASL_HANDSHAPES[currentChar] && (
                    <div className="mt-2 pt-2 border-t border-slate-600/50">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Finger Guide</p>
                      <div className="grid grid-cols-2 gap-1">
                        {(['thumb', 'index', 'middle', 'ring', 'pinky'] as const).map(finger => {
                          const state = ASL_HANDSHAPES[currentChar]?.[finger]
                          const isActive = state === 'extended' || state === 'spread'
                          return (
                            <div key={finger} className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                              isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800/50 text-slate-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-400' : 'bg-slate-600'}`} />
                              <span className="capitalize">{finger}:</span>
                              <span className="font-medium">{state}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Current Word:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {getSpellWordContext().word.split('').map((c, i) => (
                      <span key={i} className={`w-7 h-8 flex items-center justify-center rounded text-sm font-mono font-bold transition-colors ${
                        i === getSpellWordContext().charInWord
                          ? 'bg-blue-500 text-white scale-110'
                          : i < getSpellWordContext().charInWord
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-700 text-slate-500'
                      }`}>
                        {c.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {/* Theme selector */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Hand Style:</p>
              <div className="flex gap-2">
                {(Object.keys(HAND_THEMES) as HandThemeName[]).map((t) => (
                  <button key={t} onClick={() => setThemeName(t)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all capitalize ${
                      themeName === t 
                        ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40' 
                        : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    <span className="inline-block w-3 h-3 rounded-full mr-1.5 align-middle" 
                      style={{ background: HAND_THEMES[t].metal }} />
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Speed:</p>
              <div className="flex gap-1">
                {[
                  { label: 'Slow', ms: 3000 },
                  { label: 'Normal', ms: 2000 },
                  { label: 'Fast', ms: 1000 },
                ].map((s) => (
                  <button key={s.label} onClick={() => setSpeed(s.ms)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      speed === s.ms
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <div className="bg-gradient-to-r from-blue-500 to-violet-500 h-full transition-all duration-300 ease-out rounded-r" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button onClick={stepBackward} disabled={currentIndex === 0}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-30 border border-slate-700" title="Previous">
          <ChevronLeft className="w-5 h-5" />
        </button>
        {playing ? (
          <button onClick={stopPlaying}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-slate-600">
            <Pause className="w-4 h-4" /> Pause
          </button>
        ) : (
          <button onClick={startPlaying} disabled={totalItems === 0}
            className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
            <Play className="w-4 h-4" /> {currentIndex > 0 ? 'Resume' : 'Start ASL Translation'}
          </button>
        )}
        <button onClick={stepForward} disabled={currentIndex >= totalItems - 1}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-30 border border-slate-700" title="Next">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button onClick={reset} className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700" title="Reset">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Word sequence overview */}
      {mode === 'words' && signSequence.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {signSequence.map((item, idx) => (
            <button key={idx} onClick={() => { setCurrentIndex(idx); setCurrentStep(0) }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                idx === currentIndex
                  ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-md scale-105'
                  : idx < currentIndex
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'bg-slate-800 text-slate-500 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {item.type === 'sign' ? `🤟 ${item.sign.word}` : `🔤 ${item.word}`}
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-slate-500 text-center space-y-1">
        <p>ASL (American Sign Language) • {mode === 'words' ? `${signSequence.length} signs` : `${spellChars.length} characters`}</p>
        <p className="text-[10px] opacity-70">
          {mode === 'words'
            ? 'Robotic hand signs for common words. Words without known signs are flagged for fingerspelling.'
            : 'Single-hand fingerspelling alphabet. Use ◀ ▶ to step through letters at your own pace.'}
        </p>
      </div>
    </div>
  )
}

export default SignLanguageAvatar
