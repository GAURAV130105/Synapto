/**
 * ASL Pose Database
 * Defines bone rotations for ASL fingerspelling and common word signs.
 * Rotations are in radians (Euler angles).
 * 
 * Ready Player Me bone names follow the standard humanoid skeleton:
 * RightHand, RightHandThumb1-3, RightHandIndex1-3, RightHandMiddle1-3,
 * RightHandRing1-3, RightHandPinky1-3, etc.
 */

// Default rest pose for the right hand (neutral position)
const REST_POSE = {
  RightArm: { x: 0, y: 0, z: 0 },
  RightForeArm: { x: 0, y: 0, z: 0 },
  RightHand: { x: 0, y: 0, z: 0 },
  RightHandThumb1: { x: 0, y: 0, z: 0 },
  RightHandThumb2: { x: 0, y: 0, z: 0 },
  RightHandThumb3: { x: 0, y: 0, z: 0 },
  RightHandIndex1: { x: 0, y: 0, z: 0 },
  RightHandIndex2: { x: 0, y: 0, z: 0 },
  RightHandIndex3: { x: 0, y: 0, z: 0 },
  RightHandMiddle1: { x: 0, y: 0, z: 0 },
  RightHandMiddle2: { x: 0, y: 0, z: 0 },
  RightHandMiddle3: { x: 0, y: 0, z: 0 },
  RightHandRing1: { x: 0, y: 0, z: 0 },
  RightHandRing2: { x: 0, y: 0, z: 0 },
  RightHandRing3: { x: 0, y: 0, z: 0 },
  RightHandPinky1: { x: 0, y: 0, z: 0 },
  RightHandPinky2: { x: 0, y: 0, z: 0 },
  RightHandPinky3: { x: 0, y: 0, z: 0 },
}

// Curled finger helper
const curl = (v = 1.5) => ({ x: v, y: 0, z: 0 })
const flat = () => ({ x: 0, y: 0, z: 0 })
const halfCurl = () => ({ x: 0.8, y: 0, z: 0 })

// ASL Fingerspelling Alphabet
export const ASL_ALPHABET = {
  A: { // Fist with thumb to the side
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: { x: 0, y: 0.3, z: 0.3 },
    RightHandThumb2: flat(), RightHandThumb3: flat(),
    RightHandIndex1: curl(), RightHandIndex2: curl(), RightHandIndex3: curl(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  B: { // Flat hand, fingers up, thumb tucked
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: -0.3, y: 0, z: 0 },
    RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
    RightHandRing1: flat(), RightHandRing2: flat(), RightHandRing3: flat(),
    RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
  },
  C: { // Curved hand like holding a cup
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: -0.2, y: 0, z: 0 },
    RightHandThumb1: { x: 0, y: 0.5, z: 0 },
    RightHandThumb2: { x: 0.3, y: 0, z: 0 }, RightHandThumb3: flat(),
    RightHandIndex1: halfCurl(), RightHandIndex2: halfCurl(), RightHandIndex3: { x: 0.4, y: 0, z: 0 },
    RightHandMiddle1: halfCurl(), RightHandMiddle2: halfCurl(), RightHandMiddle3: { x: 0.4, y: 0, z: 0 },
    RightHandRing1: halfCurl(), RightHandRing2: halfCurl(), RightHandRing3: { x: 0.4, y: 0, z: 0 },
    RightHandPinky1: halfCurl(), RightHandPinky2: halfCurl(), RightHandPinky3: { x: 0.4, y: 0, z: 0 },
  },
  D: { // Index up, others curled touching thumb
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: { x: 0.3, y: 0.5, z: 0 },
    RightHandThumb2: { x: 0.3, y: 0, z: 0 }, RightHandThumb3: flat(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  E: { // All fingers curled, thumb tucked
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: halfCurl(), RightHandIndex2: curl(), RightHandIndex3: curl(),
    RightHandMiddle1: halfCurl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: halfCurl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: halfCurl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  F: { // OK sign (thumb + index circle, others up)
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: { x: 0.5, y: 0.4, z: 0 },
    RightHandThumb2: { x: 0.5, y: 0, z: 0 }, RightHandThumb3: { x: 0.3, y: 0, z: 0 },
    RightHandIndex1: curl(), RightHandIndex2: curl(), RightHandIndex3: { x: 0.5, y: 0, z: 0 },
    RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
    RightHandRing1: flat(), RightHandRing2: flat(), RightHandRing3: flat(),
    RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
  },
  G: { // Index pointing sideways, thumb parallel
    RightArm: { x: 0.3, y: 0.5, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: -0.5, z: 0 },
    RightHandThumb1: { x: 0, y: 0, z: 0.3 },
    RightHandThumb2: flat(), RightHandThumb3: flat(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  H: { // Index + middle pointing sideways
    RightArm: { x: 0.3, y: 0.5, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: -0.5, z: 0 },
    RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  I: { // Pinky up, rest curled
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: curl(), RightHandIndex2: curl(), RightHandIndex3: curl(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
  },
  J: { // Like I but with a downward twist motion
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0.5, z: 0.3 },
    RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: curl(), RightHandIndex2: curl(), RightHandIndex3: curl(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
  },
  K: { // Index + middle up, V-shape, thumb between
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: { x: 0.3, y: 0.3, z: 0 },
    RightHandThumb2: flat(), RightHandThumb3: flat(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: { x: 0.4, y: 0, z: 0 }, RightHandMiddle2: flat(), RightHandMiddle3: flat(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  L: { // L-shape: index up, thumb out
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: { x: 0, y: 0, z: 0.8 },
    RightHandThumb2: flat(), RightHandThumb3: flat(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  M: { // Three fingers over thumb
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0.3, y: 0, z: 0 },
    RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: curl(), RightHandIndex2: curl(), RightHandIndex3: curl(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  N: { // Two fingers over thumb
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0.3, y: 0, z: 0 },
    RightHandThumb1: { x: 0.5, y: 0.3, z: 0 },
    RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: curl(), RightHandIndex2: curl(), RightHandIndex3: curl(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  O: { // Fingers and thumb form an O
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: { x: 0.4, y: 0.4, z: 0 },
    RightHandThumb2: { x: 0.3, y: 0, z: 0 }, RightHandThumb3: { x: 0.2, y: 0, z: 0 },
    RightHandIndex1: { x: 1.0, y: 0, z: 0 }, RightHandIndex2: { x: 0.8, y: 0, z: 0 }, RightHandIndex3: { x: 0.3, y: 0, z: 0 },
    RightHandMiddle1: { x: 1.0, y: 0, z: 0 }, RightHandMiddle2: { x: 0.8, y: 0, z: 0 }, RightHandMiddle3: { x: 0.3, y: 0, z: 0 },
    RightHandRing1: { x: 1.0, y: 0, z: 0 }, RightHandRing2: { x: 0.8, y: 0, z: 0 }, RightHandRing3: { x: 0.3, y: 0, z: 0 },
    RightHandPinky1: { x: 1.0, y: 0, z: 0 }, RightHandPinky2: { x: 0.8, y: 0, z: 0 }, RightHandPinky3: { x: 0.3, y: 0, z: 0 },
  },
  P: { // Like K but pointing down
    RightArm: { x: 0.5, y: 0, z: -0.8 },
    RightForeArm: { x: 0.5, y: 0, z: -0.5 },
    RightHand: { x: 0.5, y: 0, z: 0 },
    RightHandThumb1: { x: 0.3, y: 0.3, z: 0 },
    RightHandThumb2: flat(), RightHandThumb3: flat(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: { x: 0.8, y: 0, z: 0 }, RightHandMiddle2: flat(), RightHandMiddle3: flat(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  Q: { // Like G but pointing down
    RightArm: { x: 0.5, y: 0, z: -0.8 },
    RightForeArm: { x: 0.5, y: 0, z: -0.5 },
    RightHand: { x: 0.5, y: 0, z: 0 },
    RightHandThumb1: { x: 0, y: 0, z: 0.3 },
    RightHandThumb2: flat(), RightHandThumb3: flat(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  R: { // Index + middle crossed
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: { x: 0, y: 0, z: -0.3 }, RightHandMiddle2: flat(), RightHandMiddle3: flat(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  S: { // Fist with thumb over fingers
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: { x: 0.3, y: 0.5, z: 0 },
    RightHandThumb2: { x: 0.3, y: 0, z: 0 }, RightHandThumb3: { x: 0.2, y: 0, z: 0 },
    RightHandIndex1: curl(), RightHandIndex2: curl(), RightHandIndex3: curl(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  T: { // Thumb between index and middle
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: { x: 0.5, y: 0.5, z: 0 },
    RightHandThumb2: { x: 0.5, y: 0, z: 0 }, RightHandThumb3: flat(),
    RightHandIndex1: curl(), RightHandIndex2: curl(), RightHandIndex3: curl(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  U: { // Index + middle together, up
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  V: { // Peace/V sign
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: { x: 0, y: 0, z: 0.3 }, RightHandMiddle2: flat(), RightHandMiddle3: flat(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  W: { // Index + middle + ring spread up
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
    RightHandRing1: flat(), RightHandRing2: flat(), RightHandRing3: flat(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  X: { // Index hooked, rest curled
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: { x: 0.3, y: 0, z: 0 }, RightHandIndex2: { x: 1.2, y: 0, z: 0 }, RightHandIndex3: flat(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
  Y: { // Thumb + pinky out (shaka)
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: { x: 0, y: 0, z: 0.8 },
    RightHandThumb2: flat(), RightHandThumb3: flat(),
    RightHandIndex1: curl(), RightHandIndex2: curl(), RightHandIndex3: curl(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
  },
  Z: { // Index traces Z shape (static start pose)
    RightArm: { x: 0.3, y: 0, z: -0.8 },
    RightForeArm: { x: 0, y: 0, z: -0.5 },
    RightHand: { x: 0, y: 0, z: 0 },
    RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
    RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
    RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
    RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
    RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
  },
}

// Common ASL Word Signs (multi-frame animations)
export const ASL_WORDS = {
  HELLO: {
    duration: 1.5,
    description: "Wave near head",
    frames: [
      {
        time: 0,
        bones: {
          RightArm: { x: 0, y: 0, z: -1.2 },
          RightForeArm: { x: -0.5, y: 0.3, z: 0 },
          RightHand: { x: 0, y: 0, z: 0 },
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
          RightHandRing1: flat(), RightHandRing2: flat(), RightHandRing3: flat(),
          RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
          RightHandThumb1: { x: 0, y: 0, z: 0.3 }, RightHandThumb2: flat(), RightHandThumb3: flat(),
        }
      },
      {
        time: 0.4,
        bones: {
          RightArm: { x: 0, y: 0, z: -1.2 },
          RightForeArm: { x: -0.5, y: 0.3, z: 0.4 },
          RightHand: { x: 0, y: 0.3, z: 0 },
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
          RightHandRing1: flat(), RightHandRing2: flat(), RightHandRing3: flat(),
          RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
          RightHandThumb1: { x: 0, y: 0, z: 0.3 }, RightHandThumb2: flat(), RightHandThumb3: flat(),
        }
      },
      {
        time: 0.8,
        bones: {
          RightArm: { x: 0, y: 0, z: -1.2 },
          RightForeArm: { x: -0.5, y: 0.3, z: -0.4 },
          RightHand: { x: 0, y: -0.3, z: 0 },
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
          RightHandRing1: flat(), RightHandRing2: flat(), RightHandRing3: flat(),
          RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
          RightHandThumb1: { x: 0, y: 0, z: 0.3 }, RightHandThumb2: flat(), RightHandThumb3: flat(),
        }
      },
      {
        time: 1.2,
        bones: {
          RightArm: { x: 0, y: 0, z: -1.2 },
          RightForeArm: { x: -0.5, y: 0.3, z: 0.3 },
          RightHand: { x: 0, y: 0.2, z: 0 },
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
          RightHandRing1: flat(), RightHandRing2: flat(), RightHandRing3: flat(),
          RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
          RightHandThumb1: { x: 0, y: 0, z: 0.3 }, RightHandThumb2: flat(), RightHandThumb3: flat(),
        }
      },
    ]
  },
  "THANK-YOU": {
    duration: 1.2,
    description: "Flat hand from chin forward",
    frames: [
      {
        time: 0,
        bones: {
          RightArm: { x: 0.3, y: 0, z: -0.5 },
          RightForeArm: { x: -1.2, y: 0, z: 0 },
          RightHand: { x: -0.3, y: 0, z: 0 },
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
          RightHandRing1: flat(), RightHandRing2: flat(), RightHandRing3: flat(),
          RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
          RightHandThumb1: flat(), RightHandThumb2: flat(), RightHandThumb3: flat(),
        }
      },
      {
        time: 0.6,
        bones: {
          RightArm: { x: 0.5, y: 0, z: -0.5 },
          RightForeArm: { x: -0.6, y: 0, z: 0 },
          RightHand: { x: -0.3, y: 0, z: 0 },
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
          RightHandRing1: flat(), RightHandRing2: flat(), RightHandRing3: flat(),
          RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
          RightHandThumb1: flat(), RightHandThumb2: flat(), RightHandThumb3: flat(),
        }
      },
    ]
  },
  YES: {
    duration: 1.0,
    description: "Fist nodding motion",
    frames: [
      { time: 0, bones: { ...ASL_ALPHABET.S, RightArm: { x: 0.3, y: 0, z: -0.6 }, RightForeArm: { x: -0.3, y: 0, z: 0 } } },
      { time: 0.3, bones: { ...ASL_ALPHABET.S, RightArm: { x: 0.3, y: 0, z: -0.6 }, RightForeArm: { x: -0.6, y: 0, z: 0 } } },
      { time: 0.6, bones: { ...ASL_ALPHABET.S, RightArm: { x: 0.3, y: 0, z: -0.6 }, RightForeArm: { x: -0.3, y: 0, z: 0 } } },
      { time: 0.9, bones: { ...ASL_ALPHABET.S, RightArm: { x: 0.3, y: 0, z: -0.6 }, RightForeArm: { x: -0.6, y: 0, z: 0 } } },
    ]
  },
  NO: {
    duration: 0.8,
    description: "Index and middle snap to thumb",
    frames: [
      {
        time: 0,
        bones: {
          RightArm: { x: 0.3, y: 0, z: -0.6 },
          RightForeArm: { x: -0.3, y: 0, z: 0 },
          RightHand: { x: 0, y: 0, z: 0 },
          RightHandThumb1: { x: 0, y: 0, z: 0.5 }, RightHandThumb2: flat(), RightHandThumb3: flat(),
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: { x: 0, y: 0, z: 0.3 }, RightHandMiddle2: flat(), RightHandMiddle3: flat(),
          RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
          RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
        }
      },
      {
        time: 0.4,
        bones: {
          RightArm: { x: 0.3, y: 0, z: -0.6 },
          RightForeArm: { x: -0.3, y: 0, z: 0 },
          RightHand: { x: 0, y: 0, z: 0 },
          RightHandThumb1: { x: 0.4, y: 0.5, z: 0 }, RightHandThumb2: { x: 0.3, y: 0, z: 0 }, RightHandThumb3: flat(),
          RightHandIndex1: { x: 0.8, y: 0, z: 0 }, RightHandIndex2: { x: 0.5, y: 0, z: 0 }, RightHandIndex3: flat(),
          RightHandMiddle1: { x: 0.8, y: 0, z: 0 }, RightHandMiddle2: { x: 0.5, y: 0, z: 0 }, RightHandMiddle3: flat(),
          RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
          RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
        }
      },
    ]
  },
  PLEASE: {
    duration: 1.2,
    description: "Flat hand circles on chest",
    frames: [
      {
        time: 0,
        bones: {
          RightArm: { x: 0.5, y: 0, z: -0.3 },
          RightForeArm: { x: -0.8, y: 0.3, z: 0 },
          RightHand: { x: -0.3, y: 0, z: 0 },
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
          RightHandRing1: flat(), RightHandRing2: flat(), RightHandRing3: flat(),
          RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
          RightHandThumb1: flat(), RightHandThumb2: flat(), RightHandThumb3: flat(),
        }
      },
      {
        time: 0.6,
        bones: {
          RightArm: { x: 0.5, y: 0, z: -0.3 },
          RightForeArm: { x: -0.8, y: -0.3, z: 0 },
          RightHand: { x: -0.3, y: 0, z: 0 },
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: flat(), RightHandMiddle2: flat(), RightHandMiddle3: flat(),
          RightHandRing1: flat(), RightHandRing2: flat(), RightHandRing3: flat(),
          RightHandPinky1: flat(), RightHandPinky2: flat(), RightHandPinky3: flat(),
          RightHandThumb1: flat(), RightHandThumb2: flat(), RightHandThumb3: flat(),
        }
      },
    ]
  },
  I: {
    duration: 0.8,
    description: "Point to self",
    frames: [
      {
        time: 0,
        bones: {
          RightArm: { x: 0.5, y: 0, z: -0.2 },
          RightForeArm: { x: -0.5, y: 0, z: 0 },
          RightHand: { x: 0, y: 0, z: 0 },
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
          RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
          RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
          RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
        }
      },
      {
        time: 0.4,
        bones: {
          RightArm: { x: 0.6, y: 0, z: 0 },
          RightForeArm: { x: -0.8, y: 0, z: 0 },
          RightHand: { x: 0, y: 0, z: 0 },
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
          RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
          RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
          RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
        }
      },
    ]
  },
  YOU: {
    duration: 0.8,
    description: "Point forward",
    frames: [
      {
        time: 0,
        bones: {
          RightArm: { x: 0.5, y: 0, z: -0.4 },
          RightForeArm: { x: -0.3, y: 0, z: 0 },
          RightHand: { x: 0, y: 0, z: 0 },
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
          RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
          RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
          RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
        }
      },
      {
        time: 0.5,
        bones: {
          RightArm: { x: 0.3, y: 0, z: -0.4 },
          RightForeArm: { x: 0, y: 0, z: 0 },
          RightHand: { x: -0.3, y: 0, z: 0 },
          RightHandIndex1: flat(), RightHandIndex2: flat(), RightHandIndex3: flat(),
          RightHandMiddle1: curl(), RightHandMiddle2: curl(), RightHandMiddle3: curl(),
          RightHandRing1: curl(), RightHandRing2: curl(), RightHandRing3: curl(),
          RightHandPinky1: curl(), RightHandPinky2: curl(), RightHandPinky3: curl(),
          RightHandThumb1: curl(), RightHandThumb2: curl(), RightHandThumb3: curl(),
        }
      },
    ]
  },
}

export { REST_POSE }
