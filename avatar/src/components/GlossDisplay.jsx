/**
 * GlossDisplay Component
 * Shows the current gloss sequence with the active sign highlighted.
 */

import useAppStore from '../store/useAppStore'

export default function GlossDisplay() {
  const glossSequence = useAppStore((s) => s.glossSequence)
  const currentGlossIndex = useAppStore((s) => s.currentGlossIndex)
  const animationQueue = useAppStore((s) => s.animationQueue)
  const status = useAppStore((s) => s.status)

  if (glossSequence.length === 0) return null

  return (
    <div className="gloss-display">
      <div className="gloss-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>ASL Gloss</span>
        {status === 'signing' && <span className="signing-badge">Signing...</span>}
        {status === 'done' && <span className="done-badge">Complete</span>}
      </div>
      <div className="gloss-tokens">
        {glossSequence.map((gloss, i) => {
          // Find which animation index this gloss corresponds to
          let isActive = false
          if (currentGlossIndex >= 0 && animationQueue[currentGlossIndex]) {
            const activeGloss = animationQueue[currentGlossIndex].gloss
            if (activeGloss) {
              // For fingerspelled letters, the gloss format is "WORD[L]"
              const baseGloss = activeGloss.includes('[') ? activeGloss.split('[')[0] : activeGloss
              isActive = gloss === baseGloss || gloss === activeGloss
            }
          }

          // Simple approach: mark active based on position tracking
          let animIdx = 0
          let glossIdx = 0
          for (let a = 0; a < animationQueue.length; a++) {
            const anim = animationQueue[a]
            if (anim.type === 'word') {
              if (glossIdx === i && a === currentGlossIndex) {
                isActive = true
                break
              }
              glossIdx++
            } else if (anim.type === 'letter') {
              // This letter belongs to the current gloss word
              const baseWord = anim.gloss.split('[')[0]
              if (gloss === baseWord) {
                if (a === currentGlossIndex) {
                  isActive = true
                  break
                }
              }
            }
          }

          return (
            <span
              key={`${gloss}-${i}`}
              className={`gloss-token ${isActive ? 'active' : ''} ${
                status === 'done' ? 'completed' : ''
              }`}
            >
              {gloss}
            </span>
          )
        })}
      </div>
    </div>
  )
}
