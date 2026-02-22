'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, Loader2 } from 'lucide-react'

export default function PreferencesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Accessibility settings
  const [fontSize, setFontSize] = useState('normal')
  const [highContrast, setHighContrast] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [languageLevel, setLanguageLevel] = useState('intermediate')
  const [enableSignLanguage, setEnableSignLanguage] = useState(true)
  const [enableAudioNarrative, setEnableAudioNarrative] = useState(true)
  const [textSpacing, setTextSpacing] = useState(50)

  // Load preferences from Supabase on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch('/api/user/preferences')
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to load preferences')
        }

        const { preferences } = await res.json()
        if (preferences) {
          if (preferences.fontSize) setFontSize(preferences.fontSize)
          if (preferences.highContrast !== undefined) setHighContrast(preferences.highContrast)
          if (preferences.focusMode !== undefined) setFocusMode(preferences.focusMode)
          if (preferences.languageLevel) setLanguageLevel(preferences.languageLevel)
          if (preferences.enableSignLanguage !== undefined) setEnableSignLanguage(preferences.enableSignLanguage)
          if (preferences.enableAudioNarrative !== undefined) setEnableAudioNarrative(preferences.enableAudioNarrative)
          if (preferences.textSpacing !== undefined) setTextSpacing(preferences.textSpacing)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadPreferences()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)
    setError(null)

    try {
      const preferences = {
        fontSize,
        highContrast,
        focusMode,
        languageLevel,
        enableSignLanguage,
        enableAudioNarrative,
        textSpacing,
      }

      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save preferences')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Accessibility Preferences</h1>
        <p className="text-muted-foreground">Customize Synapto for your learning style</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saved && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your preferences have been saved successfully
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Text Customization */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Text Settings</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger id="font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (14px)</SelectItem>
                  <SelectItem value="normal">Normal (16px)</SelectItem>
                  <SelectItem value="large">Large (18px)</SelectItem>
                  <SelectItem value="xlarge">Extra Large (20px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="spacing">Text Spacing</Label>
                <span className="text-sm text-muted-foreground">{textSpacing}%</span>
              </div>
              <Slider
                id="spacing"
                min={30}
                max={150}
                step={10}
                value={[textSpacing]}
                onValueChange={(value) => setTextSpacing(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language-level">Language Simplification Level</Label>
              <Select value={languageLevel} onValueChange={setLanguageLevel}>
                <SelectTrigger id="language-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (Simplified)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (Balanced)</SelectItem>
                  <SelectItem value="advanced">Advanced (Original)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Display Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Display Settings</h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <p className="text-xs text-muted-foreground">Increases color contrast for better visibility</p>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="focus-mode">Focus Mode</Label>
                <p className="text-xs text-muted-foreground">Minimize distractions in the interface</p>
              </div>
              <Switch
                id="focus-mode"
                checked={focusMode}
                onCheckedChange={setFocusMode}
              />
            </div>
          </div>
        </Card>

        {/* Feature Toggles */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Feature Preferences</h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sign-language">Sign Language Avatar</Label>
                <p className="text-xs text-muted-foreground">Show ASL translation of content</p>
              </div>
              <Switch
                id="sign-language"
                checked={enableSignLanguage}
                onCheckedChange={setEnableSignLanguage}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="audio-narrative">Audio Narratives</Label>
                <p className="text-xs text-muted-foreground">Auto-play audio descriptions</p>
              </div>
              <Switch
                id="audio-narrative"
                checked={enableAudioNarrative}
                onCheckedChange={setEnableAudioNarrative}
              />
            </div>
          </div>
        </Card>

        {/* Preview */}
        <Card className="p-6 bg-muted/50">
          <h2 className="text-xl font-semibold text-foreground mb-6">Preview</h2>
          <div
            className={`p-4 rounded-lg border bg-background space-y-2 transition-all`}
            style={{
              fontSize: fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : fontSize === 'xlarge' ? '20px' : '16px',
              lineHeight: `${1.5 + (textSpacing - 50) / 200}`,
              filter: highContrast ? 'contrast(1.3)' : 'none',
            }}
          >
            <p className="font-semibold text-foreground">Example Text</p>
            <p className="text-muted-foreground">
              This is how your content will appear with your current settings. Adjust the options to find what works best for you.
            </p>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </div>
  )
}
