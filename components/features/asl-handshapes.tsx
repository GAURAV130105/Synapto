'use client'

/**
 * ASL Fingerspelling Handshape Definitions
 * Maps each letter to a specific hand pose category with finger state descriptions.
 * Based on standard ASL fingerspelling alphabet.
 */

export type FingerState = 'extended' | 'curled' | 'bent' | 'hooked' | 'spread' | 'touching'

export type ThumbPositionType = 'side' | 'across' | 'up' | 'out' | 'tucked' | 'touching-index' | 'touching-middle' | 'between'
export type OrientationType = 'palm-out' | 'palm-in' | 'palm-side' | 'palm-down'

export interface ASLHandshape {
  letter: string
  pose: string // category name
  thumb: FingerState
  index: FingerState
  middle: FingerState
  ring: FingerState
  pinky: FingerState
  thumbPosition: 'side' | 'across' | 'up' | 'out' | 'tucked' | 'touching-index' | 'touching-middle' | 'between'
  orientation: 'palm-out' | 'palm-in' | 'palm-side' | 'palm-down'
  description: string
}

export const ASL_HANDSHAPES: Record<string, ASLHandshape> = {
  a: { letter: 'A', pose: 'fist-thumb-side', thumb: 'extended', index: 'curled', middle: 'curled', ring: 'curled', pinky: 'curled', thumbPosition: 'side', orientation: 'palm-out', description: 'Fist with thumb resting beside' },
  b: { letter: 'B', pose: 'flat-up', thumb: 'curled', index: 'extended', middle: 'extended', ring: 'extended', pinky: 'extended', thumbPosition: 'tucked', orientation: 'palm-out', description: 'Flat hand up, thumb tucked' },
  c: { letter: 'C', pose: 'c-curve', thumb: 'bent', index: 'bent', middle: 'bent', ring: 'bent', pinky: 'bent', thumbPosition: 'out', orientation: 'palm-side', description: 'Hand curves into C shape' },
  d: { letter: 'D', pose: 'index-up-circle', thumb: 'touching', index: 'extended', middle: 'curled', ring: 'curled', pinky: 'curled', thumbPosition: 'touching-middle', orientation: 'palm-out', description: 'Index up, others form circle with thumb' },
  e: { letter: 'E', pose: 'fingers-curled', thumb: 'curled', index: 'bent', middle: 'bent', ring: 'bent', pinky: 'bent', thumbPosition: 'tucked', orientation: 'palm-out', description: 'All fingers curled, thumb under' },
  f: { letter: 'F', pose: 'ok-spread', thumb: 'touching', index: 'touching', middle: 'extended', ring: 'extended', pinky: 'extended', thumbPosition: 'touching-index', orientation: 'palm-out', description: 'Thumb-index circle, others spread up' },
  g: { letter: 'G', pose: 'point-side', thumb: 'extended', index: 'extended', middle: 'curled', ring: 'curled', pinky: 'curled', thumbPosition: 'out', orientation: 'palm-side', description: 'Index and thumb point sideways' },
  h: { letter: 'H', pose: 'two-side', thumb: 'extended', index: 'extended', middle: 'extended', ring: 'curled', pinky: 'curled', thumbPosition: 'out', orientation: 'palm-side', description: 'Index and middle extend sideways' },
  i: { letter: 'I', pose: 'pinky-up', thumb: 'curled', index: 'curled', middle: 'curled', ring: 'curled', pinky: 'extended', thumbPosition: 'across', orientation: 'palm-out', description: 'Fist with pinky extended up' },
  j: { letter: 'J', pose: 'pinky-j-trace', thumb: 'curled', index: 'curled', middle: 'curled', ring: 'curled', pinky: 'extended', thumbPosition: 'across', orientation: 'palm-out', description: 'Like I, pinky traces J curve' },
  k: { letter: 'K', pose: 'v-thumb-touch', thumb: 'extended', index: 'extended', middle: 'extended', ring: 'curled', pinky: 'curled', thumbPosition: 'touching-middle', orientation: 'palm-out', description: 'V shape, thumb touches middle finger' },
  l: { letter: 'L', pose: 'l-shape', thumb: 'extended', index: 'extended', middle: 'curled', ring: 'curled', pinky: 'curled', thumbPosition: 'out', orientation: 'palm-out', description: 'L-shape with thumb and index' },
  m: { letter: 'M', pose: 'three-over-thumb', thumb: 'curled', index: 'curled', middle: 'curled', ring: 'curled', pinky: 'curled', thumbPosition: 'tucked', orientation: 'palm-down', description: 'Three fingers draped over thumb' },
  n: { letter: 'N', pose: 'two-over-thumb', thumb: 'curled', index: 'curled', middle: 'curled', ring: 'curled', pinky: 'curled', thumbPosition: 'tucked', orientation: 'palm-down', description: 'Two fingers draped over thumb' },
  o: { letter: 'O', pose: 'o-circle', thumb: 'touching', index: 'touching', middle: 'touching', ring: 'touching', pinky: 'touching', thumbPosition: 'touching-index', orientation: 'palm-side', description: 'All fingertips touch thumb, O circle' },
  p: { letter: 'P', pose: 'k-down', thumb: 'extended', index: 'extended', middle: 'extended', ring: 'curled', pinky: 'curled', thumbPosition: 'touching-middle', orientation: 'palm-down', description: 'Like K but pointing downward' },
  q: { letter: 'Q', pose: 'g-down', thumb: 'extended', index: 'extended', middle: 'curled', ring: 'curled', pinky: 'curled', thumbPosition: 'out', orientation: 'palm-down', description: 'Like G but pointing downward' },
  r: { letter: 'R', pose: 'crossed-fingers', thumb: 'curled', index: 'extended', middle: 'extended', ring: 'curled', pinky: 'curled', thumbPosition: 'across', orientation: 'palm-out', description: 'Index and middle crossed' },
  s: { letter: 'S', pose: 'tight-fist', thumb: 'curled', index: 'curled', middle: 'curled', ring: 'curled', pinky: 'curled', thumbPosition: 'across', orientation: 'palm-out', description: 'Tight fist, thumb across front' },
  t: { letter: 'T', pose: 'thumb-between', thumb: 'extended', index: 'curled', middle: 'curled', ring: 'curled', pinky: 'curled', thumbPosition: 'between', orientation: 'palm-out', description: 'Thumb between index and middle' },
  u: { letter: 'U', pose: 'two-up-together', thumb: 'curled', index: 'extended', middle: 'extended', ring: 'curled', pinky: 'curled', thumbPosition: 'tucked', orientation: 'palm-out', description: 'Index and middle up together' },
  v: { letter: 'V', pose: 'peace-sign', thumb: 'curled', index: 'extended', middle: 'extended', ring: 'curled', pinky: 'curled', thumbPosition: 'across', orientation: 'palm-out', description: 'V / peace sign, fingers spread' },
  w: { letter: 'W', pose: 'three-up', thumb: 'curled', index: 'extended', middle: 'extended', ring: 'extended', pinky: 'curled', thumbPosition: 'tucked', orientation: 'palm-out', description: 'Three fingers spread up' },
  x: { letter: 'X', pose: 'hook', thumb: 'curled', index: 'hooked', middle: 'curled', ring: 'curled', pinky: 'curled', thumbPosition: 'across', orientation: 'palm-side', description: 'Index bent like a hook' },
  y: { letter: 'Y', pose: 'shaka', thumb: 'extended', index: 'curled', middle: 'curled', ring: 'curled', pinky: 'extended', thumbPosition: 'out', orientation: 'palm-out', description: 'Thumb and pinky out — shaka' },
  z: { letter: 'Z', pose: 'z-trace', thumb: 'curled', index: 'extended', middle: 'curled', ring: 'curled', pinky: 'curled', thumbPosition: 'across', orientation: 'palm-out', description: 'Index finger traces Z in air' },
}

// Group letters by similar hand poses for visual reference
export const POSE_GROUPS: Record<string, string[]> = {
  'Fist Variants': ['a', 's', 't', 'e', 'm', 'n'],
  'Extended Fingers': ['b', 'u', 'v', 'w', 'r', 'k'],
  'Pointing': ['d', 'g', 'h', 'l', 'i', 'x', 'z'],
  'Circle/Curve': ['c', 'f', 'o'],
  'Special': ['j', 'p', 'q', 'y'],
}
