'use client'


export interface FingerPose {
  mcp: { curl: number; spread: number }   // base knuckle
  pip: { curl: number }                    // middle joint
  dip: { curl: number }                    // tip joint
}

export interface HandPose {
  thumb: FingerPose
  index: FingerPose
  middle: FingerPose
  ring: FingerPose
  pinky: FingerPose
  wrist?: { pitch: number; yaw: number; roll: number }
}

export interface SignAnimation {
  name: string
  type: 'static' | 'motion'
  category: string
  description: string
  poses: HandPose[]        // For static: single pose. For motion: keyframes
  durations?: number[]     // Duration per keyframe (ms)
  loop?: boolean
}

export type SignLanguageMode = 'asl' | 'isl'

// ─── Shorthand helpers ───
const curled = (spread = 0): FingerPose => ({
  mcp: { curl: 1.5, spread },
  pip: { curl: 1.5 },
  dip: { curl: 1.2 },
})

const extended = (spread = 0): FingerPose => ({
  mcp: { curl: 0, spread },
  pip: { curl: 0 },
  dip: { curl: 0 },
})

const bent = (spread = 0): FingerPose => ({
  mcp: { curl: 1.2, spread },
  pip: { curl: 0.6 },
  dip: { curl: 0.4 },
})

const hooked = (spread = 0): FingerPose => ({
  mcp: { curl: 0.3, spread },
  pip: { curl: 1.4 },
  dip: { curl: 1.2 },
})

const halfCurl = (spread = 0): FingerPose => ({
  mcp: { curl: 0.8, spread },
  pip: { curl: 0.8 },
  dip: { curl: 0.6 },
})

const slightBend = (spread = 0): FingerPose => ({
  mcp: { curl: 0.4, spread },
  pip: { curl: 0.3 },
  dip: { curl: 0.2 },
})

const flatBent = (spread = 0): FingerPose => ({
  mcp: { curl: 1.2, spread },
  pip: { curl: 0 },
  dip: { curl: 0 },
})

const thumbSide: FingerPose = {
  mcp: { curl: 0.2, spread: 0.5 },
  pip: { curl: 0.1 },
  dip: { curl: 0.1 },
}

const thumbAcross: FingerPose = {
  mcp: { curl: 0.8, spread: -0.3 },
  pip: { curl: 0.5 },
  dip: { curl: 0.3 },
}

const thumbTucked: FingerPose = {
  mcp: { curl: 1.0, spread: -0.2 },
  pip: { curl: 0.8 },
  dip: { curl: 0.6 },
}

const thumbOut: FingerPose = {
  mcp: { curl: 0, spread: 0.8 },
  pip: { curl: 0 },
  dip: { curl: 0 },
}

const thumbBetween: FingerPose = {
  mcp: { curl: 0.6, spread: 0.1 },
  pip: { curl: 0.3 },
  dip: { curl: 0.2 },
}

const thumbUp: FingerPose = {
  mcp: { curl: 0, spread: 0.9 },
  pip: { curl: 0 },
  dip: { curl: 0 },
}

const thumbDown: FingerPose = {
  mcp: { curl: 0, spread: 0.9 },
  pip: { curl: 0 },
  dip: { curl: 0 },
}

const thumbTip: FingerPose = {
  mcp: { curl: 0.5, spread: 0.3 },
  pip: { curl: 0.4 },
  dip: { curl: 0.3 },
}

// ─── ASL Fingerspelling Alphabet Poses (A-Z) ───
export const ASL_LETTER_POSES: Record<string, HandPose> = {
  a: { thumb: thumbSide, index: curled(), middle: curled(), ring: curled(), pinky: curled() },
  b: { thumb: thumbTucked, index: extended(), middle: extended(), ring: extended(), pinky: extended() },
  c: { thumb: { mcp: { curl: 0.4, spread: 0.6 }, pip: { curl: 0.3 }, dip: { curl: 0.2 } }, index: halfCurl(0.1), middle: halfCurl(0.05), ring: halfCurl(-0.05), pinky: halfCurl(-0.1) },
  d: { thumb: { mcp: { curl: 0.8, spread: -0.2 }, pip: { curl: 0.6 }, dip: { curl: 0.4 } }, index: extended(), middle: curled(), ring: curled(), pinky: curled() },
  e: { thumb: thumbTucked, index: bent(), middle: bent(), ring: bent(), pinky: bent() },
  f: { thumb: { mcp: { curl: 0.6, spread: 0 }, pip: { curl: 0.5 }, dip: { curl: 0.4 } }, index: hooked(), middle: extended(0.05), ring: extended(0), pinky: extended(-0.05) },
  g: { thumb: thumbOut, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: -1.2, roll: 0 } },
  h: { thumb: thumbOut, index: extended(), middle: extended(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: -1.2, roll: 0 } },
  i: { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: extended() },
  j: { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: extended() },
  k: { thumb: { mcp: { curl: 0.4, spread: 0.2 }, pip: { curl: 0.3 }, dip: { curl: 0.1 } }, index: extended(0.1), middle: extended(-0.1), ring: curled(), pinky: curled() },
  l: { thumb: thumbOut, index: extended(), middle: curled(), ring: curled(), pinky: curled() },
  m: { thumb: thumbTucked, index: bent(-0.1), middle: bent(0), ring: bent(0.1), pinky: curled() },
  n: { thumb: thumbTucked, index: bent(-0.05), middle: bent(0.05), ring: curled(), pinky: curled() },
  o: { thumb: { mcp: { curl: 0.5, spread: 0.3 }, pip: { curl: 0.4 }, dip: { curl: 0.3 } }, index: halfCurl(0.05), middle: halfCurl(0), ring: halfCurl(-0.05), pinky: halfCurl(-0.1) },
  p: { thumb: { mcp: { curl: 0.4, spread: 0.2 }, pip: { curl: 0.3 }, dip: { curl: 0.1 } }, index: extended(0.1), middle: extended(-0.1), ring: curled(), pinky: curled(), wrist: { pitch: 1.2, yaw: 0, roll: 0 } },
  q: { thumb: thumbOut, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 1.2, yaw: -0.8, roll: 0 } },
  r: { thumb: thumbAcross, index: extended(0.05), middle: extended(-0.05), ring: curled(), pinky: curled() },
  s: { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled() },
  t: { thumb: thumbBetween, index: curled(), middle: curled(), ring: curled(), pinky: curled() },
  u: { thumb: thumbTucked, index: extended(0), middle: extended(0), ring: curled(), pinky: curled() },
  v: { thumb: thumbAcross, index: extended(0.15), middle: extended(-0.15), ring: curled(), pinky: curled() },
  w: { thumb: thumbTucked, index: extended(0.1), middle: extended(0), ring: extended(-0.1), pinky: curled() },
  x: { thumb: thumbAcross, index: hooked(), middle: curled(), ring: curled(), pinky: curled() },
  y: { thumb: thumbOut, index: curled(), middle: curled(), ring: curled(), pinky: extended() },
  z: { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled() },
}

// ─── ISL (Indian Sign Language) Letter Poses ───
// ISL uses a different set of hand shapes for many letters
export const ISL_LETTER_POSES: Record<string, HandPose> = {
  // ISL uses two-handed signs for many letters; here we represent the dominant hand shape
  a: { thumb: thumbOut, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
  b: { thumb: thumbTucked, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
  c: { thumb: { mcp: { curl: 0.4, spread: 0.6 }, pip: { curl: 0.3 }, dip: { curl: 0.2 } }, index: halfCurl(0.1), middle: halfCurl(0.05), ring: halfCurl(-0.05), pinky: halfCurl(-0.1), wrist: { pitch: 0, yaw: -0.3, roll: 0 } },
  d: { thumb: thumbTip, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
  e: { thumb: thumbTucked, index: slightBend(), middle: slightBend(), ring: slightBend(), pinky: slightBend() },
  f: { thumb: thumbTip, index: hooked(), middle: extended(0.05), ring: extended(0), pinky: extended(-0.05) },
  g: { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: -0.8, roll: 0 } },
  h: { thumb: thumbTucked, index: extended(), middle: extended(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: -0.3 } },
  i: { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: extended(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
  j: { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: extended(), wrist: { pitch: 0, yaw: 0, roll: 0.3 } },
  k: { thumb: { mcp: { curl: 0.3, spread: 0.4 }, pip: { curl: 0.2 }, dip: { curl: 0.1 } }, index: extended(0.15), middle: extended(-0.1), ring: curled(), pinky: curled() },
  l: { thumb: thumbOut, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
  m: { thumb: thumbTucked, index: flatBent(-0.1), middle: flatBent(0), ring: flatBent(0.1), pinky: curled() },
  n: { thumb: thumbTucked, index: flatBent(-0.05), middle: flatBent(0.05), ring: curled(), pinky: curled() },
  o: { thumb: thumbTip, index: halfCurl(0.05), middle: halfCurl(0), ring: halfCurl(-0.05), pinky: halfCurl(-0.1) },
  p: { thumb: thumbOut, index: extended(0.1), middle: extended(-0.1), ring: curled(), pinky: curled(), wrist: { pitch: 0.8, yaw: 0, roll: 0 } },
  q: { thumb: thumbOut, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 1.0, yaw: -0.5, roll: 0 } },
  r: { thumb: thumbAcross, index: extended(0.05), middle: extended(-0.05), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0.2 } },
  s: { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
  t: { thumb: thumbBetween, index: curled(), middle: curled(), ring: curled(), pinky: curled() },
  u: { thumb: thumbTucked, index: extended(0), middle: extended(0), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
  v: { thumb: thumbAcross, index: extended(0.15), middle: extended(-0.15), ring: curled(), pinky: curled() },
  w: { thumb: thumbTucked, index: extended(0.1), middle: extended(0), ring: extended(-0.1), pinky: curled() },
  x: { thumb: thumbAcross, index: hooked(), middle: curled(), ring: curled(), pinky: curled() },
  y: { thumb: thumbOut, index: curled(), middle: curled(), ring: curled(), pinky: extended() },
  z: { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0.3 } },
}

// ─── ASL Common Word Signs (expanded — 30+ signs) ───
export const ASL_WORD_ANIMATIONS: Record<string, SignAnimation> = {
  hello: {
    name: 'HELLO',
    type: 'motion',
    category: 'Greeting',
    description: 'Wave hand outward from forehead',
    poses: [
      { thumb: thumbSide, index: extended(0.05), middle: extended(0), ring: extended(-0.05), pinky: extended(-0.1), wrist: { pitch: -0.3, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(0.1), middle: extended(0.05), ring: extended(0), pinky: extended(-0.05), wrist: { pitch: -0.1, yaw: 0.3, roll: 0.15 } },
      { thumb: thumbSide, index: extended(0.05), middle: extended(0), ring: extended(-0.05), pinky: extended(-0.1), wrist: { pitch: 0.1, yaw: 0.5, roll: -0.1 } },
    ],
    durations: [400, 350, 300],
  },
  'thank you': {
    name: 'THANK YOU',
    type: 'motion',
    category: 'Politeness',
    description: 'Flat hand from chin outward',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.5, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.3, yaw: 0, roll: 0 } },
    ],
    durations: [500, 400],
  },
  thanks: {
    name: 'THANKS',
    type: 'motion',
    category: 'Politeness',
    description: 'Same as THANK YOU — flat hand from chin',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.5, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.3, yaw: 0, roll: 0 } },
    ],
    durations: [500, 400],
  },
  please: {
    name: 'PLEASE',
    type: 'motion',
    category: 'Politeness',
    description: 'Flat hand circles on chest',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.2, yaw: 0.2, roll: 0.1 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0, yaw: 0, roll: -0.1 } },
    ],
    durations: [400, 400, 400],
    loop: true,
  },
  yes: {
    name: 'YES',
    type: 'motion',
    category: 'Response',
    description: 'Fist nods up and down',
    poses: [
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.4, yaw: 0, roll: 0 } },
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0.4, yaw: 0, roll: 0 } },
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.4, yaw: 0, roll: 0 } },
    ],
    durations: [300, 300, 300],
  },
  no: {
    name: 'NO',
    type: 'motion',
    category: 'Response',
    description: 'Fingers snap against thumb',
    poses: [
      { thumb: thumbOut, index: extended(0.1), middle: extended(-0.1), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
      { thumb: { mcp: { curl: 0.6, spread: 0 }, pip: { curl: 0.4 }, dip: { curl: 0.3 } }, index: halfCurl(0.1), middle: halfCurl(-0.1), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
    ],
    durations: [250, 250],
  },
  sorry: {
    name: 'SORRY',
    type: 'motion',
    category: 'Emotion',
    description: 'Fist circles on chest',
    poses: [
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0.2, yaw: 0.2, roll: 0 } },
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: -0.2, roll: 0 } },
    ],
    durations: [400, 400, 400],
    loop: true,
  },
  help: {
    name: 'HELP',
    type: 'motion',
    category: 'Action',
    description: 'Fist on flat palm, both rise up',
    poses: [
      { thumb: thumbSide, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.5, yaw: 0, roll: 0 } },
    ],
    durations: [500, 400],
  },
  love: {
    name: 'LOVE / I LOVE YOU',
    type: 'static',
    category: 'Emotion',
    description: 'ILY sign — thumb, index, pinky extended',
    poses: [
      { thumb: thumbOut, index: extended(), middle: curled(), ring: curled(), pinky: extended() },
    ],
  },
  friend: {
    name: 'FRIEND',
    type: 'motion',
    category: 'People',
    description: 'Hooked index fingers link together',
    poses: [
      { thumb: thumbAcross, index: hooked(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
      { thumb: thumbAcross, index: hooked(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0, roll: 0.5 } },
    ],
    durations: [400, 400],
  },
  learn: {
    name: 'LEARN',
    type: 'motion',
    category: 'Education',
    description: 'Pick up knowledge from palm to forehead',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.3, yaw: 0, roll: 0 } },
      { thumb: thumbTip, index: halfCurl(), middle: halfCurl(), ring: halfCurl(), pinky: halfCurl(), wrist: { pitch: -0.5, yaw: 0, roll: 0 } },
    ],
    durations: [500, 500],
  },
  // ─── NEW: Expanded Word Signs ───
  good: {
    name: 'GOOD',
    type: 'motion',
    category: 'Description',
    description: 'Flat hand from chin downward to open palm',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.4, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.4, yaw: 0, roll: 0 } },
    ],
    durations: [400, 400],
  },
  bad: {
    name: 'BAD',
    type: 'motion',
    category: 'Description',
    description: 'Flat hand from chin, turns downward',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.3, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.5, yaw: 0, roll: 0.5 } },
    ],
    durations: [400, 350],
  },
  want: {
    name: 'WANT',
    type: 'motion',
    category: 'Action',
    description: 'Clawed hands pull toward body',
    poses: [
      { thumb: thumbOut, index: hooked(0.1), middle: hooked(0), ring: hooked(-0.05), pinky: hooked(-0.1), wrist: { pitch: 0, yaw: 0, roll: 0 } },
      { thumb: thumbOut, index: hooked(0.1), middle: hooked(0), ring: hooked(-0.05), pinky: hooked(-0.1), wrist: { pitch: -0.4, yaw: 0, roll: 0 } },
    ],
    durations: [400, 400],
  },
  need: {
    name: 'NEED',
    type: 'motion',
    category: 'Action',
    description: 'Bent index finger nods downward',
    poses: [
      { thumb: thumbAcross, index: hooked(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.3, yaw: 0, roll: 0 } },
      { thumb: thumbAcross, index: hooked(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0.4, yaw: 0, roll: 0 } },
    ],
    durations: [350, 350],
  },
  eat: {
    name: 'EAT',
    type: 'motion',
    category: 'Action',
    description: 'Bunched fingers tap to mouth repeatedly',
    poses: [
      { thumb: thumbTip, index: halfCurl(), middle: halfCurl(), ring: halfCurl(), pinky: halfCurl(), wrist: { pitch: -0.5, yaw: 0, roll: 0 } },
      { thumb: thumbTip, index: halfCurl(), middle: halfCurl(), ring: halfCurl(), pinky: halfCurl(), wrist: { pitch: -0.2, yaw: 0, roll: 0 } },
      { thumb: thumbTip, index: halfCurl(), middle: halfCurl(), ring: halfCurl(), pinky: halfCurl(), wrist: { pitch: -0.5, yaw: 0, roll: 0 } },
    ],
    durations: [300, 250, 300],
    loop: true,
  },
  drink: {
    name: 'DRINK',
    type: 'motion',
    category: 'Action',
    description: 'C-hand tilts toward mouth like drinking',
    poses: [
      { thumb: { mcp: { curl: 0.4, spread: 0.5 }, pip: { curl: 0.3 }, dip: { curl: 0.2 } }, index: halfCurl(0.1), middle: halfCurl(0), ring: halfCurl(-0.05), pinky: halfCurl(-0.1), wrist: { pitch: -0.2, yaw: 0, roll: 0 } },
      { thumb: { mcp: { curl: 0.4, spread: 0.5 }, pip: { curl: 0.3 }, dip: { curl: 0.2 } }, index: halfCurl(0.1), middle: halfCurl(0), ring: halfCurl(-0.05), pinky: halfCurl(-0.1), wrist: { pitch: -0.7, yaw: 0, roll: 0.3 } },
    ],
    durations: [500, 500],
  },
  water: {
    name: 'WATER',
    type: 'motion',
    category: 'Object',
    description: 'W-hand taps chin — index, middle, ring extended',
    poses: [
      { thumb: thumbTucked, index: extended(0.1), middle: extended(0), ring: extended(-0.1), pinky: curled(), wrist: { pitch: -0.3, yaw: 0, roll: 0 } },
      { thumb: thumbTucked, index: extended(0.1), middle: extended(0), ring: extended(-0.1), pinky: curled(), wrist: { pitch: -0.5, yaw: 0, roll: 0 } },
      { thumb: thumbTucked, index: extended(0.1), middle: extended(0), ring: extended(-0.1), pinky: curled(), wrist: { pitch: -0.3, yaw: 0, roll: 0 } },
    ],
    durations: [300, 250, 300],
  },
  home: {
    name: 'HOME',
    type: 'motion',
    category: 'Place',
    description: 'Bunched fingertips touch cheek then jaw',
    poses: [
      { thumb: thumbTip, index: halfCurl(), middle: halfCurl(), ring: halfCurl(), pinky: halfCurl(), wrist: { pitch: -0.3, yaw: 0.2, roll: 0 } },
      { thumb: thumbTip, index: halfCurl(), middle: halfCurl(), ring: halfCurl(), pinky: halfCurl(), wrist: { pitch: -0.1, yaw: 0.4, roll: 0 } },
    ],
    durations: [400, 400],
  },
  school: {
    name: 'SCHOOL',
    type: 'motion',
    category: 'Place',
    description: 'Clap flat hands together twice',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.2, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.2, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.2, yaw: 0, roll: 0 } },
    ],
    durations: [300, 250, 300],
  },
  work: {
    name: 'WORK',
    type: 'motion',
    category: 'Action',
    description: 'Fist taps on other fist twice',
    poses: [
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.3, yaw: 0, roll: 0 } },
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0.2, yaw: 0, roll: 0 } },
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.3, yaw: 0, roll: 0 } },
    ],
    durations: [300, 250, 300],
  },
  name: {
    name: 'NAME',
    type: 'motion',
    category: 'Communication',
    description: 'H-hand taps on H-hand',
    poses: [
      { thumb: thumbOut, index: extended(), middle: extended(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: -0.5, roll: 0 } },
      { thumb: thumbOut, index: extended(), middle: extended(), ring: curled(), pinky: curled(), wrist: { pitch: 0.3, yaw: -0.5, roll: 0 } },
    ],
    durations: [350, 350],
  },
  what: {
    name: 'WHAT',
    type: 'motion',
    category: 'Question',
    description: 'Open hands shake side to side',
    poses: [
      { thumb: thumbSide, index: extended(0.1), middle: extended(0), ring: extended(-0.05), pinky: extended(-0.1), wrist: { pitch: 0, yaw: -0.3, roll: 0 } },
      { thumb: thumbSide, index: extended(0.1), middle: extended(0), ring: extended(-0.05), pinky: extended(-0.1), wrist: { pitch: 0, yaw: 0.3, roll: 0 } },
    ],
    durations: [350, 350],
  },
  where: {
    name: 'WHERE',
    type: 'motion',
    category: 'Question',
    description: 'Index finger wags side to side',
    poses: [
      { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: -0.3, roll: 0 } },
      { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: 0.3, roll: 0 } },
      { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: -0.3, roll: 0 } },
    ],
    durations: [300, 300, 300],
  },
  how: {
    name: 'HOW',
    type: 'motion',
    category: 'Question',
    description: 'Fists together, palms in, roll forward to open',
    poses: [
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0.3, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.3, yaw: 0, roll: 0 } },
    ],
    durations: [500, 500],
  },
  why: {
    name: 'WHY',
    type: 'motion',
    category: 'Question',
    description: 'Fingers touch forehead, pull down to Y-hand',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.5, yaw: 0, roll: 0 } },
      { thumb: thumbOut, index: curled(), middle: curled(), ring: curled(), pinky: extended(), wrist: { pitch: 0.2, yaw: 0, roll: 0 } },
    ],
    durations: [500, 500],
  },
  stop: {
    name: 'STOP',
    type: 'motion',
    category: 'Action',
    description: 'Flat hand chops down on flat palm',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.5, yaw: -0.3, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.3, yaw: -0.3, roll: 0 } },
    ],
    durations: [300, 300],
  },
  go: {
    name: 'GO',
    type: 'motion',
    category: 'Action',
    description: 'Index fingers point and arc forward',
    poses: [
      { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.2, yaw: 0, roll: 0 } },
      { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0.4, yaw: 0, roll: 0.2 } },
    ],
    durations: [400, 400],
  },
  come: {
    name: 'COME',
    type: 'motion',
    category: 'Action',
    description: 'Index finger beckons toward body',
    poses: [
      { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0.3, yaw: 0, roll: 0 } },
      { thumb: thumbAcross, index: hooked(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.2, yaw: 0, roll: 0 } },
    ],
    durations: [400, 400],
  },
  happy: {
    name: 'HAPPY',
    type: 'motion',
    category: 'Emotion',
    description: 'Flat hand brushes up chest repeatedly',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.2, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.3, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.2, yaw: 0, roll: 0 } },
    ],
    durations: [350, 300, 350],
  },
  sad: {
    name: 'SAD',
    type: 'motion',
    category: 'Emotion',
    description: 'Open hands move down in front of face',
    poses: [
      { thumb: thumbSide, index: extended(0.05), middle: extended(0), ring: extended(-0.05), pinky: extended(-0.1), wrist: { pitch: -0.3, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(0.05), middle: extended(0), ring: extended(-0.05), pinky: extended(-0.1), wrist: { pitch: 0.4, yaw: 0, roll: 0 } },
    ],
    durations: [600, 600],
  },
  understand: {
    name: 'UNDERSTAND',
    type: 'motion',
    category: 'Communication',
    description: 'Index finger flicks up near temple',
    poses: [
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.3, yaw: 0.3, roll: 0 } },
      { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.5, yaw: 0.3, roll: 0 } },
    ],
    durations: [400, 350],
  },
  think: {
    name: 'THINK',
    type: 'static',
    category: 'Communication',
    description: 'Index finger touches forehead',
    poses: [
      { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.5, yaw: 0.2, roll: 0 } },
    ],
  },
  know: {
    name: 'KNOW',
    type: 'motion',
    category: 'Communication',
    description: 'Flat fingers tap forehead',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.5, yaw: 0.2, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.3, yaw: 0.2, roll: 0 } },
    ],
    durations: [350, 350],
  },
  like: {
    name: 'LIKE',
    type: 'motion',
    category: 'Emotion',
    description: 'Open hand pulls away from chest, closes',
    poses: [
      { thumb: thumbOut, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0, yaw: 0, roll: 0 } },
      { thumb: thumbTip, index: halfCurl(), middle: halfCurl(), ring: halfCurl(), pinky: halfCurl(), wrist: { pitch: 0.2, yaw: 0, roll: 0 } },
    ],
    durations: [500, 400],
  },
  don: { // for "don't"
    name: "DON'T",
    type: 'motion',
    category: 'Response',
    description: 'Arms cross outward from center',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0, yaw: 0.3, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0, yaw: -0.5, roll: 0-2 } },
    ],
    durations: [350, 350],
  },
  can: {
    name: 'CAN',
    type: 'motion',
    category: 'Action',
    description: 'Both fists move down together',
    poses: [
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.3, yaw: 0, roll: 0 } },
      { thumb: thumbAcross, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0.3, yaw: 0, roll: 0 } },
    ],
    durations: [400, 400],
  },
  more: {
    name: 'MORE',
    type: 'motion',
    category: 'Quantity',
    description: 'Bunched fingertips tap together',
    poses: [
      { thumb: thumbTip, index: halfCurl(0.05), middle: halfCurl(0), ring: halfCurl(-0.05), pinky: halfCurl(-0.1), wrist: { pitch: 0, yaw: -0.2, roll: 0 } },
      { thumb: thumbTip, index: halfCurl(0.05), middle: halfCurl(0), ring: halfCurl(-0.05), pinky: halfCurl(-0.1), wrist: { pitch: 0, yaw: 0.2, roll: 0 } },
      { thumb: thumbTip, index: halfCurl(0.05), middle: halfCurl(0), ring: halfCurl(-0.05), pinky: halfCurl(-0.1), wrist: { pitch: 0, yaw: -0.2, roll: 0 } },
    ],
    durations: [300, 250, 300],
  },
  teacher: {
    name: 'TEACHER',
    type: 'motion',
    category: 'People',
    description: 'Bunched fingers from temples outward + person marker',
    poses: [
      { thumb: thumbTip, index: halfCurl(), middle: halfCurl(), ring: halfCurl(), pinky: halfCurl(), wrist: { pitch: -0.4, yaw: 0.3, roll: 0 } },
      { thumb: thumbTip, index: halfCurl(), middle: halfCurl(), ring: halfCurl(), pinky: halfCurl(), wrist: { pitch: -0.2, yaw: 0.5, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.3, yaw: 0, roll: 0 } },
    ],
    durations: [400, 350, 400],
  },
  student: {
    name: 'STUDENT',
    type: 'motion',
    category: 'People',
    description: 'Pick up from palm to forehead + person marker',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.3, yaw: 0, roll: 0 } },
      { thumb: thumbTip, index: halfCurl(), middle: halfCurl(), ring: halfCurl(), pinky: halfCurl(), wrist: { pitch: -0.5, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.3, yaw: 0, roll: 0 } },
    ],
    durations: [400, 400, 400],
  },
  family: {
    name: 'FAMILY',
    type: 'motion',
    category: 'People',
    description: 'F-hands circle outward to connect',
    poses: [
      { thumb: thumbTip, index: hooked(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0, yaw: -0.3, roll: 0 } },
      { thumb: thumbTip, index: hooked(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0, yaw: 0.3, roll: 0 } },
    ],
    durations: [500, 500],
    loop: true,
  },
  play: {
    name: 'PLAY',
    type: 'motion',
    category: 'Action',
    description: 'Y-hands shake',
    poses: [
      { thumb: thumbOut, index: curled(), middle: curled(), ring: curled(), pinky: extended(), wrist: { pitch: 0, yaw: 0, roll: -0.3 } },
      { thumb: thumbOut, index: curled(), middle: curled(), ring: curled(), pinky: extended(), wrist: { pitch: 0, yaw: 0, roll: 0.3 } },
      { thumb: thumbOut, index: curled(), middle: curled(), ring: curled(), pinky: extended(), wrist: { pitch: 0, yaw: 0, roll: -0.3 } },
    ],
    durations: [300, 300, 300],
  },
  time: {
    name: 'TIME',
    type: 'motion',
    category: 'Concept',
    description: 'Index finger taps wrist (like pointing at watch)',
    poses: [
      { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0.3, yaw: -0.3, roll: 0 } },
      { thumb: thumbAcross, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0.5, yaw: -0.3, roll: 0 } },
    ],
    durations: [350, 350],
  },
  today: {
    name: 'TODAY',
    type: 'motion',
    category: 'Time',
    description: 'Both hands drop down in front of body',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.3, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.3, yaw: 0, roll: 0 } },
    ],
    durations: [400, 400],
  },
}

// ─── ISL-specific Word Signs (different from ASL) ───
export const ISL_WORD_ANIMATIONS: Record<string, SignAnimation> = {
  ...ASL_WORD_ANIMATIONS, // Share common signs
  // Override ISL-specific signs
  hello: {
    name: 'NAMASTE / HELLO',
    type: 'motion',
    category: 'Greeting',
    description: 'Palms together, slight bow (Namaste gesture)',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.2, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.4, yaw: 0, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.2, yaw: 0, roll: 0 } },
    ],
    durations: [500, 400, 500],
  },
  'thank you': {
    name: 'DHANYAVAAD',
    type: 'motion',
    category: 'Politeness',
    description: 'Right hand touches forehead and moves forward (sign of respect)',
    poses: [
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: -0.5, yaw: 0.2, roll: 0 } },
      { thumb: thumbSide, index: extended(), middle: extended(), ring: extended(), pinky: extended(), wrist: { pitch: 0.2, yaw: 0.2, roll: 0 } },
    ],
    durations: [500, 500],
  },
  water: {
    name: 'PAANI',
    type: 'motion',
    category: 'Object',
    description: 'C-hand gestures as if holding cup and drinking',
    poses: [
      { thumb: { mcp: { curl: 0.4, spread: 0.5 }, pip: { curl: 0.3 }, dip: { curl: 0.2 } }, index: halfCurl(0.1), middle: halfCurl(0), ring: halfCurl(-0.05), pinky: halfCurl(-0.1), wrist: { pitch: -0.2, yaw: 0, roll: 0 } },
      { thumb: { mcp: { curl: 0.4, spread: 0.5 }, pip: { curl: 0.3 }, dip: { curl: 0.2 } }, index: halfCurl(0.1), middle: halfCurl(0), ring: halfCurl(-0.05), pinky: halfCurl(-0.1), wrist: { pitch: -0.8, yaw: 0, roll: 0.4 } },
    ],
    durations: [500, 500],
  },
  school: {
    name: 'SCHOOL / VIDYALAYA',
    type: 'motion',
    category: 'Place',
    description: 'Writing motion on palm (study gesture)',
    poses: [
      { thumb: thumbTip, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: -0.3, roll: 0 } },
      { thumb: thumbTip, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0.3, yaw: -0.3, roll: 0.2 } },
      { thumb: thumbTip, index: extended(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0, yaw: -0.3, roll: 0 } },
    ],
    durations: [350, 300, 350],
  },
  good: {
    name: 'ACCHA / GOOD',
    type: 'motion',
    category: 'Description',
    description: 'Thumbs up with forward motion',
    poses: [
      { thumb: thumbUp, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: -0.2, yaw: 0, roll: 0 } },
      { thumb: thumbUp, index: curled(), middle: curled(), ring: curled(), pinky: curled(), wrist: { pitch: 0.2, yaw: 0, roll: 0 } },
    ],
    durations: [400, 400],
  },
}

// ─── Text to Sign Gloss Pipeline ───
export interface SignGlossItem {
  type: 'word' | 'fingerspell'
  value: string
  animation?: SignAnimation
  letterPoses?: HandPose[]
}

/**
 * Get the appropriate letter poses based on sign language mode
 */
export function getLetterPoses(mode: SignLanguageMode): Record<string, HandPose> {
  return mode === 'isl' ? ISL_LETTER_POSES : ASL_LETTER_POSES
}

/**
 * Get the appropriate word animations based on sign language mode
 */
export function getWordAnimations(mode: SignLanguageMode): Record<string, SignAnimation> {
  return mode === 'isl' ? ISL_WORD_ANIMATIONS : ASL_WORD_ANIMATIONS
}

/**
 * Convert plain English text to a sequence of sign gloss items.
 * Matches known word signs first, then falls back to fingerspelling.
 */
export function textToSignGloss(text: string, mode: SignLanguageMode = 'asl'): SignGlossItem[] {
  const wordAnimations = getWordAnimations(mode)
  const letterPoses = getLetterPoses(mode)
  
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)
  const glossItems: SignGlossItem[] = []
  
  let i = 0
  while (i < words.length) {
    // Try three-word phrases
    if (i + 2 < words.length) {
      const threeWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
      if (wordAnimations[threeWord]) {
        glossItems.push({
          type: 'word',
          value: threeWord.toUpperCase(),
          animation: wordAnimations[threeWord],
        })
        i += 3
        continue
      }
    }

    // Try two-word phrases (e.g., "thank you")
    if (i + 1 < words.length) {
      const twoWord = `${words[i]} ${words[i + 1]}`
      if (wordAnimations[twoWord]) {
        glossItems.push({
          type: 'word',
          value: twoWord.toUpperCase(),
          animation: wordAnimations[twoWord],
        })
        i += 2
        continue
      }
    }

    // Try single word
    if (wordAnimations[words[i]]) {
      glossItems.push({
        type: 'word',
        value: words[i].toUpperCase(),
        animation: wordAnimations[words[i]],
      })
    } else {
      // Fingerspell this word
      const poses = words[i].split('').map(char => letterPoses[char]).filter(Boolean)
      glossItems.push({
        type: 'fingerspell',
        value: words[i].toUpperCase(),
        letterPoses: poses,
      })
    }
    i++
  }

  return glossItems
}

/**
 * Interpolate between two hand poses for smooth animation.
 * t is 0-1 where 0 = poseA, 1 = poseB
 */
export function interpolatePose(poseA: HandPose, poseB: HandPose, t: number): HandPose {
  const lerp = (a: number, b: number) => a + (b - a) * t
  
  const interpolateFinger = (fA: FingerPose, fB: FingerPose): FingerPose => ({
    mcp: { curl: lerp(fA.mcp.curl, fB.mcp.curl), spread: lerp(fA.mcp.spread, fB.mcp.spread) },
    pip: { curl: lerp(fA.pip.curl, fB.pip.curl) },
    dip: { curl: lerp(fA.dip.curl, fB.dip.curl) },
  })

  return {
    thumb: interpolateFinger(poseA.thumb, poseB.thumb),
    index: interpolateFinger(poseA.index, poseB.index),
    middle: interpolateFinger(poseA.middle, poseB.middle),
    ring: interpolateFinger(poseA.ring, poseB.ring),
    pinky: interpolateFinger(poseA.pinky, poseB.pinky),
    wrist: {
      pitch: lerp(poseA.wrist?.pitch ?? 0, poseB.wrist?.pitch ?? 0),
      yaw: lerp(poseA.wrist?.yaw ?? 0, poseB.wrist?.yaw ?? 0),
      roll: lerp(poseA.wrist?.roll ?? 0, poseB.wrist?.roll ?? 0),
    },
  }
}

// ─── Default/rest pose ───
export const REST_POSE: HandPose = {
  thumb: { mcp: { curl: 0.3, spread: 0.4 }, pip: { curl: 0.2 }, dip: { curl: 0.1 } },
  index: { mcp: { curl: 0.2, spread: 0.05 }, pip: { curl: 0.15 }, dip: { curl: 0.1 } },
  middle: { mcp: { curl: 0.2, spread: 0 }, pip: { curl: 0.15 }, dip: { curl: 0.1 } },
  ring: { mcp: { curl: 0.25, spread: -0.05 }, pip: { curl: 0.2 }, dip: { curl: 0.15 } },
  pinky: { mcp: { curl: 0.3, spread: -0.1 }, pip: { curl: 0.25 }, dip: { curl: 0.2 } },
  wrist: { pitch: 0, yaw: 0, roll: 0 },
}
