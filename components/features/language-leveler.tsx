'use client'

import { useState } from 'react'
import { RotateCw } from 'lucide-react'

interface LanguageLevelerProps {
  originalText: string
  onSimplify?: (text: string, level: 'basic' | 'intermediate' | 'advanced') => Promise<string>
}

export function LanguageLeveler({ originalText, onSimplify }: LanguageLevelerProps) {
  const [selectedLevel, setSelectedLevel] = useState<'basic' | 'intermediate' | 'advanced'>('basic')
  const [simplifiedText, setSimplifiedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSimplified, setShowSimplified] = useState(false)

  const handleSimplify = async () => {
    if (!onSimplify) {
      // Local simplification fallback
      const mockSimplified = {
        basic: originalText.split(/[.!?]/).slice(0, 2).join('.') + '.',
        intermediate: originalText.substring(0, Math.min(originalText.length, 300)),
        advanced: originalText,
      }
      setSimplifiedText(mockSimplified[selectedLevel])
      setShowSimplified(true)
      return
    }

    setIsLoading(true)
    try {
      const result = await onSimplify(originalText, selectedLevel)
      setSimplifiedText(result)
      setShowSimplified(true)
    } catch (error) {
      console.error('[v0] Error simplifying text:', error)
      alert('Failed to simplify text. Using local processing.')
      const mockSimplified = {
        basic: originalText.split(/[.!?]/).slice(0, 2).join('.') + '.',
        intermediate: originalText.substring(0, Math.min(originalText.length, 300)),
        advanced: originalText,
      }
      setSimplifiedText(mockSimplified[selectedLevel])
      setShowSimplified(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Language Leveler</h3>
          <p className="text-sm text-muted-foreground mb-4">Simplify text to match your reading level</p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Select Reading Level:</label>
          <div className="grid grid-cols-3 gap-2">
            {(['basic', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                  selectedLevel === level
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                aria-label={`Select ${level} reading level`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Original Text:</label>
          <div className="bg-background border border-border rounded p-3 max-h-32 overflow-y-auto">
            <p className="text-sm text-foreground whitespace-pre-wrap">{originalText}</p>
          </div>
        </div>

        {showSimplified && (
          <div className="space-y-2 bg-accent/10 p-4 rounded-lg border border-accent/20">
            <label className="text-sm font-medium">Simplified Text ({selectedLevel}):</label>
            <div className="bg-background border border-border rounded p-3 max-h-32 overflow-y-auto">
              <p className="text-sm text-foreground whitespace-pre-wrap">{simplifiedText}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleSimplify}
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          aria-label="Simplify text"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Simplifying...' : 'Simplify Text'}
        </button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg">
        <p className="font-semibold">Reading Levels:</p>
        <ul className="space-y-1">
          <li><strong>Basic:</strong> Very short, simple sentences. 1-2 main ideas.</li>
          <li><strong>Intermediate:</strong> Standard length sentences. Multiple ideas organized logically.</li>
          <li><strong>Advanced:</strong> Original text with complex vocabulary and structure.</li>
        </ul>
      </div>
    </div>
  )
}

export default LanguageLeveler
