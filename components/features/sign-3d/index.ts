export { SignLanguage3D } from './sign-language-3d'
export { Hand3DModel } from './hand-3d-model'
export { AvatarModel } from './avatar-model'
export type { SkinTone } from './hand-3d-model'
export type { AvatarSkinTone, AvatarModelProps } from './avatar-model'
export type { HandPose, FingerPose, SignAnimation, SignLanguageMode, SignGlossItem } from './sign-poses'
export type { FacialExpression, EmotionType } from './emotion-engine'
export type { Viseme, LipSyncFrame } from './lip-sync-engine'
export {
  ASL_LETTER_POSES, ISL_LETTER_POSES,
  ASL_WORD_ANIMATIONS, ISL_WORD_ANIMATIONS,
  REST_POSE, textToSignGloss, getLetterPoses, getWordAnimations, interpolatePose,
} from './sign-poses'
export { analyzeEmotion, getExpression, NEUTRAL_EXPRESSION, lerpExpression } from './emotion-engine'
export { generateLipSync, getVisemeAtTime, VISEMES, lerpViseme } from './lip-sync-engine'
