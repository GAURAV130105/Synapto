/**
 * Animation Mapper
 * Maps gloss tokens to animation data (word signs or fingerspelling)
 */

import { ASL_WORDS, ASL_ALPHABET } from './poseDatabase'

/**
 * Convert gloss tokens into a sequence of animation items
 * @param {string[]} glosses - Array of gloss tokens
 * @returns {Array} Animation sequence
 */
export function glossToAnimations(glosses) {
  const animations = []
  
  for (const gloss of glosses) {
    if (ASL_WORDS[gloss]) {
      // Known word sign - use the full animation
      animations.push({
        type: 'word',
        gloss,
        data: ASL_WORDS[gloss],
        description: ASL_WORDS[gloss].description || gloss,
      })
    } else {
      // Unknown word - fingerspell each letter
      const letters = gloss.replace(/[^A-Z]/g, '')
      for (const letter of letters) {
        if (ASL_ALPHABET[letter]) {
          animations.push({
            type: 'letter',
            gloss: `${gloss}[${letter}]`,
            letter,
            data: ASL_ALPHABET[letter],
            description: `Fingerspell: ${letter}`,
          })
        }
      }
    }
  }
  
  return animations
}

/**
 * Get the total estimated duration of an animation sequence
 */
export function getAnimationDuration(animations, speed = 1) {
  let total = 0
  for (const anim of animations) {
    if (anim.type === 'word') {
      total += anim.data.duration / speed
    } else {
      total += 0.6 / speed // each letter held for 0.6s
    }
  }
  return total
}
