'use client'

/**
 * Lip Sync Engine — Text-to-Viseme Mapping
 * Maps text characters to mouth shapes (visemes) for realistic lip sync.
 * Each viseme defines mouth open amount, width, and lip shape.
 */

export interface Viseme {
  name: string
  mouthOpen: number    // 0=closed, 1=fully open
  mouthWidth: number   // 0.5=narrow/round, 1=normal, 1.5=wide
  lipRound: number     // 0=flat, 1=fully rounded
  tongueOut: number    // 0=in, 1=out (for TH sounds)
  jawOpen: number      // 0=closed, 1=open
  upperLipRaise: number // 0=normal, 1=raised (for F/V)
}

// Standard visemes
export const VISEMES: Record<string, Viseme> = {
  // Silence / Rest
  rest: { name: 'Rest', mouthOpen: 0, mouthWidth: 1, lipRound: 0, tongueOut: 0, jawOpen: 0, upperLipRaise: 0 },
  
  // Bilabials: M, B, P — lips pressed
  mbp: { name: 'M/B/P', mouthOpen: 0, mouthWidth: 0.9, lipRound: 0, tongueOut: 0, jawOpen: 0, upperLipRaise: 0 },
  
  // Labiodentals: F, V — upper teeth on lower lip
  fv: { name: 'F/V', mouthOpen: 0.1, mouthWidth: 0.95, lipRound: 0, tongueOut: 0, jawOpen: 0.05, upperLipRaise: 0.4 },
  
  // Dentals: TH — tongue between teeth
  th: { name: 'TH', mouthOpen: 0.15, mouthWidth: 1, lipRound: 0, tongueOut: 0.5, jawOpen: 0.1, upperLipRaise: 0 },
  
  // Alveolars: T, D, N, L, S, Z — tongue behind teeth
  tdnl: { name: 'T/D/N/L', mouthOpen: 0.15, mouthWidth: 1, lipRound: 0, tongueOut: 0.1, jawOpen: 0.1, upperLipRaise: 0 },
  
  // Sibilants: S, Z, SH, CH, J — teeth close, air
  sz: { name: 'S/Z', mouthOpen: 0.1, mouthWidth: 1.1, lipRound: 0, tongueOut: 0, jawOpen: 0.05, upperLipRaise: 0 },
  
  // Sh/Ch — lips slightly rounded
  shch: { name: 'SH/CH', mouthOpen: 0.15, mouthWidth: 0.85, lipRound: 0.4, tongueOut: 0, jawOpen: 0.1, upperLipRaise: 0 },
  
  // Velars: K, G, NG — back of tongue
  kgng: { name: 'K/G', mouthOpen: 0.25, mouthWidth: 1, lipRound: 0, tongueOut: 0, jawOpen: 0.2, upperLipRaise: 0 },
  
  // R sound
  r: { name: 'R', mouthOpen: 0.2, mouthWidth: 0.85, lipRound: 0.3, tongueOut: 0, jawOpen: 0.15, upperLipRaise: 0 },
  
  // W sound — rounded lips
  w: { name: 'W', mouthOpen: 0.15, mouthWidth: 0.65, lipRound: 0.7, tongueOut: 0, jawOpen: 0.1, upperLipRaise: 0 },
  
  // Vowels
  aa: { name: 'AA (father)', mouthOpen: 0.7, mouthWidth: 1.1, lipRound: 0, tongueOut: 0, jawOpen: 0.6, upperLipRaise: 0 },
  ae: { name: 'AE (cat)', mouthOpen: 0.5, mouthWidth: 1.2, lipRound: 0, tongueOut: 0, jawOpen: 0.4, upperLipRaise: 0 },
  ah: { name: 'AH (but)', mouthOpen: 0.4, mouthWidth: 1, lipRound: 0, tongueOut: 0, jawOpen: 0.35, upperLipRaise: 0 },
  ee: { name: 'EE (feet)', mouthOpen: 0.2, mouthWidth: 1.3, lipRound: 0, tongueOut: 0, jawOpen: 0.1, upperLipRaise: 0 },
  eh: { name: 'EH (bed)', mouthOpen: 0.35, mouthWidth: 1.15, lipRound: 0, tongueOut: 0, jawOpen: 0.25, upperLipRaise: 0 },
  ih: { name: 'IH (sit)', mouthOpen: 0.25, mouthWidth: 1.2, lipRound: 0, tongueOut: 0, jawOpen: 0.15, upperLipRaise: 0 },
  oh: { name: 'OH (go)', mouthOpen: 0.45, mouthWidth: 0.7, lipRound: 0.8, tongueOut: 0, jawOpen: 0.35, upperLipRaise: 0 },
  oo: { name: 'OO (food)', mouthOpen: 0.3, mouthWidth: 0.6, lipRound: 0.9, tongueOut: 0, jawOpen: 0.2, upperLipRaise: 0 },
  uh: { name: 'UH (book)', mouthOpen: 0.3, mouthWidth: 0.8, lipRound: 0.5, tongueOut: 0, jawOpen: 0.2, upperLipRaise: 0 },
}

// Character → Viseme mapping
const CHAR_TO_VISEME: Record<string, string> = {
  // Consonants
  'b': 'mbp', 'm': 'mbp', 'p': 'mbp',
  'f': 'fv', 'v': 'fv',
  't': 'tdnl', 'd': 'tdnl', 'n': 'tdnl', 'l': 'tdnl',
  's': 'sz', 'z': 'sz',
  'k': 'kgng', 'g': 'kgng',
  'r': 'r',
  'w': 'w',
  'h': 'ah',
  'j': 'shch', 'y': 'ee',
  'c': 'kgng',
  'q': 'kgng',
  'x': 'kgng',
  // Vowels
  'a': 'ae',
  'e': 'eh',
  'i': 'ih',
  'o': 'oh',
  'u': 'uh',
  // Space = rest
  ' ': 'rest',
}

export interface LipSyncFrame {
  viseme: Viseme
  character: string
  time: number       // ms from start
  duration: number   // ms
}

/**
 * Generate lip sync frames from text
 * Each character maps to a viseme with timing
 */
export function generateLipSync(text: string, wordsPerMinute: number = 150): LipSyncFrame[] {
  const chars = text.toLowerCase().split('')
  const msPerChar = (60000 / wordsPerMinute) / 5 // Average 5 chars per word
  const frames: LipSyncFrame[] = []
  let time = 0

  for (const char of chars) {
    const visemeKey = CHAR_TO_VISEME[char] || 'rest'
    const viseme = VISEMES[visemeKey] || VISEMES.rest
    
    // Vowels hold slightly longer than consonants
    const isVowel = 'aeiou'.includes(char)
    const duration = isVowel ? msPerChar * 1.3 : msPerChar * 0.8

    frames.push({
      viseme,
      character: char,
      time,
      duration,
    })

    time += duration
  }

  return frames
}

/**
 * Get the current viseme at a given playback time
 */
export function getVisemeAtTime(frames: LipSyncFrame[], currentTime: number): Viseme {
  if (frames.length === 0) return VISEMES.rest

  for (let i = frames.length - 1; i >= 0; i--) {
    if (currentTime >= frames[i].time) {
      return frames[i].viseme
    }
  }

  return VISEMES.rest
}

/**
 * Interpolate between two visemes
 */
export function lerpViseme(a: Viseme, b: Viseme, t: number): Viseme {
  const lerp = (x: number, y: number) => x + (y - x) * t
  return {
    name: t > 0.5 ? b.name : a.name,
    mouthOpen: lerp(a.mouthOpen, b.mouthOpen),
    mouthWidth: lerp(a.mouthWidth, b.mouthWidth),
    lipRound: lerp(a.lipRound, b.lipRound),
    tongueOut: lerp(a.tongueOut, b.tongueOut),
    jawOpen: lerp(a.jawOpen, b.jawOpen),
    upperLipRaise: lerp(a.upperLipRaise, b.upperLipRaise),
  }
}
