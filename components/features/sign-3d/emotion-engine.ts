'use client'

/**
 * Emotion Engine — Keyword-based sentiment analysis
 * Analyzes text to determine emotional expression for the avatar.
 * Outputs facial expression parameters to drive the 3D avatar.
 */

export type EmotionType = 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry' | 'thinking' | 'excited' | 'confused'

export interface FacialExpression {
  emotion: EmotionType
  intensity: number // 0-1
  // Eye parameters
  eyeOpenLeft: number    // 0=closed, 1=normal, 1.5=wide
  eyeOpenRight: number
  eyeLookX: number       // -1=left, 0=center, 1=right
  eyeLookY: number       // -1=down, 0=center, 1=up
  pupilDilation: number  // 0.5-1.5
  // Eyebrow parameters
  browLeftHeight: number   // -1=furrowed, 0=neutral, 1=raised
  browRightHeight: number
  browLeftAngle: number    // -1=angled down inner, 0=flat, 1=angled up
  browRightAngle: number
  // Mouth parameters (additional to lip sync)
  mouthSmile: number     // -1=frown, 0=neutral, 1=smile
  mouthOpen: number      // 0=closed, 1=fully open
  mouthWidth: number     // 0.5=pursed, 1=normal, 1.5=wide
  jawOpen: number        // 0=closed, 1=open
  // Cheek & other
  cheekPuff: number      // 0=normal, 1=puffed
  noseWrinkle: number    // 0=normal, 1=wrinkled
  blushIntensity: number // 0=none, 1=full blush
}

// Default neutral expression
export const NEUTRAL_EXPRESSION: FacialExpression = {
  emotion: 'neutral',
  intensity: 0,
  eyeOpenLeft: 1,
  eyeOpenRight: 1,
  eyeLookX: 0,
  eyeLookY: 0,
  pupilDilation: 1,
  browLeftHeight: 0,
  browRightHeight: 0,
  browLeftAngle: 0,
  browRightAngle: 0,
  mouthSmile: 0,
  mouthOpen: 0,
  mouthWidth: 1,
  jawOpen: 0,
  cheekPuff: 0,
  noseWrinkle: 0,
  blushIntensity: 0,
}

// Preset expressions
const EXPRESSIONS: Record<EmotionType, Partial<FacialExpression>> = {
  neutral: {},
  happy: {
    eyeOpenLeft: 0.85,
    eyeOpenRight: 0.85,
    browLeftHeight: 0.3,
    browRightHeight: 0.3,
    mouthSmile: 0.8,
    mouthWidth: 1.2,
    cheekPuff: 0.2,
    blushIntensity: 0.15,
  },
  sad: {
    eyeOpenLeft: 0.7,
    eyeOpenRight: 0.7,
    eyeLookY: -0.3,
    browLeftHeight: -0.4,
    browRightHeight: -0.4,
    browLeftAngle: 0.5,
    browRightAngle: 0.5,
    mouthSmile: -0.6,
    mouthWidth: 0.85,
  },
  surprised: {
    eyeOpenLeft: 1.4,
    eyeOpenRight: 1.4,
    pupilDilation: 1.3,
    browLeftHeight: 0.9,
    browRightHeight: 0.9,
    mouthOpen: 0.6,
    mouthSmile: 0,
    jawOpen: 0.4,
  },
  angry: {
    eyeOpenLeft: 0.8,
    eyeOpenRight: 0.8,
    browLeftHeight: -0.5,
    browRightHeight: -0.5,
    browLeftAngle: -0.7,
    browRightAngle: -0.7,
    mouthSmile: -0.3,
    mouthWidth: 0.9,
    noseWrinkle: 0.6,
    jawOpen: 0.15,
  },
  thinking: {
    eyeOpenLeft: 0.9,
    eyeOpenRight: 0.75,
    eyeLookX: 0.4,
    eyeLookY: 0.3,
    browLeftHeight: 0.4,
    browRightHeight: -0.1,
    mouthSmile: 0.1,
    mouthWidth: 0.9,
  },
  excited: {
    eyeOpenLeft: 1.3,
    eyeOpenRight: 1.3,
    pupilDilation: 1.2,
    browLeftHeight: 0.7,
    browRightHeight: 0.7,
    mouthSmile: 1.0,
    mouthOpen: 0.3,
    mouthWidth: 1.3,
    cheekPuff: 0.1,
    blushIntensity: 0.3,
  },
  confused: {
    eyeOpenLeft: 1.1,
    eyeOpenRight: 0.8,
    eyeLookX: 0.2,
    browLeftHeight: 0.6,
    browRightHeight: -0.2,
    browLeftAngle: 0.3,
    browRightAngle: -0.4,
    mouthSmile: -0.1,
    mouthWidth: 0.95,
  },
}

// Keyword → Emotion mapping
const EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  happy: ['happy', 'joy', 'glad', 'great', 'wonderful', 'amazing', 'love', 'like', 'good', 'beautiful', 'fantastic', 'excellent', 'awesome', 'perfect', 'fun', 'smile', 'laugh', 'celebrate', 'yes', 'thank', 'thanks', 'welcome', 'friend', 'play', 'enjoy'],
  sad: ['sad', 'sorry', 'miss', 'lonely', 'cry', 'tears', 'unhappy', 'depressed', 'bad', 'hurt', 'pain', 'lose', 'lost', 'fail', 'failure', 'disappoint', 'unfortunately', 'grief', 'mourn'],
  surprised: ['surprise', 'wow', 'amazing', 'unbelievable', 'shocked', 'incredible', 'suddenly', 'unexpected', 'what', 'really', 'seriously', 'oh', 'omg'],
  angry: ['angry', 'mad', 'hate', 'furious', 'awful', 'terrible', 'horrible', 'stop', 'no', 'wrong', 'fight', 'unfair', 'annoyed', 'frustrated', 'stupid'],
  thinking: ['think', 'wonder', 'maybe', 'perhaps', 'consider', 'question', 'how', 'why', 'understand', 'learn', 'know', 'study', 'analyze', 'problem', 'solve', 'idea'],
  excited: ['excited', 'thrilled', 'can\'t wait', 'yay', 'hooray', 'fantastic', 'incredible', 'brilliant', 'absolutely', 'definitely', 'totally'],
  confused: ['confused', 'don\'t understand', 'what', 'huh', 'weird', 'strange', 'unclear', 'complicated', 'difficult', 'hard', 'where'],
  neutral: [],
}

/**
 * Analyze text and return detected emotion with intensity
 */
export function analyzeEmotion(text: string): { emotion: EmotionType; intensity: number } {
  const words = text.toLowerCase().split(/\s+/)
  const scores: Record<EmotionType, number> = {
    neutral: 0.1, // Small baseline so neutral wins if nothing else matches
    happy: 0,
    sad: 0,
    surprised: 0,
    angry: 0,
    thinking: 0,
    excited: 0,
    confused: 0,
  }

  // Count keyword matches
  for (const word of words) {
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      if (keywords.includes(word)) {
        scores[emotion as EmotionType] += 1
      }
    }
  }

  // Exclamation marks boost excitement/surprise
  const exclamations = (text.match(/!/g) || []).length
  if (exclamations > 0) {
    scores.excited += exclamations * 0.3
    scores.surprised += exclamations * 0.2
  }

  // Question marks boost thinking/confused
  const questions = (text.match(/\?/g) || []).length
  if (questions > 0) {
    scores.thinking += questions * 0.3
    scores.confused += questions * 0.2
  }

  // Find the winning emotion
  let maxEmotion: EmotionType = 'neutral'
  let maxScore = 0
  for (const [emotion, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      maxEmotion = emotion as EmotionType
    }
  }

  // Intensity based on how many matches we found (clamped to 0-1)
  const intensity = Math.min(1, maxScore / 3)

  return { emotion: maxEmotion, intensity }
}

/**
 * Build a full FacialExpression from emotion analysis
 */
export function getExpression(emotion: EmotionType, intensity: number = 1): FacialExpression {
  const preset = EXPRESSIONS[emotion]
  const result = { ...NEUTRAL_EXPRESSION, emotion, intensity }

  // Blend preset values by intensity
  for (const [key, value] of Object.entries(preset)) {
    if (typeof value === 'number') {
      const neutralVal = (NEUTRAL_EXPRESSION as any)[key] ?? 0
      ;(result as any)[key] = neutralVal + (value - neutralVal) * intensity
    }
  }

  return result
}

/**
 * Interpolate between two facial expressions
 */
export function lerpExpression(a: FacialExpression, b: FacialExpression, t: number): FacialExpression {
  const lerp = (x: number, y: number) => x + (y - x) * t
  return {
    emotion: t > 0.5 ? b.emotion : a.emotion,
    intensity: lerp(a.intensity, b.intensity),
    eyeOpenLeft: lerp(a.eyeOpenLeft, b.eyeOpenLeft),
    eyeOpenRight: lerp(a.eyeOpenRight, b.eyeOpenRight),
    eyeLookX: lerp(a.eyeLookX, b.eyeLookX),
    eyeLookY: lerp(a.eyeLookY, b.eyeLookY),
    pupilDilation: lerp(a.pupilDilation, b.pupilDilation),
    browLeftHeight: lerp(a.browLeftHeight, b.browLeftHeight),
    browRightHeight: lerp(a.browRightHeight, b.browRightHeight),
    browLeftAngle: lerp(a.browLeftAngle, b.browLeftAngle),
    browRightAngle: lerp(a.browRightAngle, b.browRightAngle),
    mouthSmile: lerp(a.mouthSmile, b.mouthSmile),
    mouthOpen: lerp(a.mouthOpen, b.mouthOpen),
    mouthWidth: lerp(a.mouthWidth, b.mouthWidth),
    jawOpen: lerp(a.jawOpen, b.jawOpen),
    cheekPuff: lerp(a.cheekPuff, b.cheekPuff),
    noseWrinkle: lerp(a.noseWrinkle, b.noseWrinkle),
    blushIntensity: lerp(a.blushIntensity, b.blushIntensity),
  }
}
