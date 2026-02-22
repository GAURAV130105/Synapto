'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface FocusModeProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  onSettingsChange?: (settings: FocusModeSettings) => void
}

export interface FocusModeSettings {
  hideImages: boolean
  hideAds: boolean
  hideDistractions: boolean
  enhanceContrast: boolean
  increaseLineHeight: boolean
  increaseFontSize: boolean
}

const defaultSettings: FocusModeSettings = {
  hideImages: true,
  hideAds: true,
  hideDistractions: true,
  enhanceContrast: true,
  increaseLineHeight: true,
  increaseFontSize: true,
}

export function FocusMode({ enabled, onToggle, onSettingsChange }: FocusModeProps) {
  const [settings, setSettings] = useState<FocusModeSettings>(defaultSettings)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (enabled) {
      // Apply focus mode CSS
      const style = document.createElement('style')
      style.id = 'focus-mode-styles'
      style.textContent = `
        ${settings.hideImages ? 'img { display: none !important; }' : ''}
        ${settings.hideAds ? '[data-ad-slot], [data-ad], .ad { display: none !important; }' : ''}
        ${settings.hideDistractions ? 'aside, .sidebar, .related { display: none !important; }' : ''}
        ${settings.enhanceContrast ? 'body { filter: contrast(1.2); }' : ''}
        ${settings.increaseLineHeight ? 'p, li, article { line-height: 1.8 !important; }' : ''}
        ${settings.increaseFontSize ? 'body { font-size: 110%; } p, li { font-size: 1.1em; }' : ''}
      `
      document.head.appendChild(style)

      return () => {
        const existing = document.getElementById('focus-mode-styles')
        if (existing) existing.remove()
      }
    }
  }, [enabled, settings])

  const handleSettingChange = (key: keyof FocusModeSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-card border border-border rounded-lg shadow-lg transition-all ${expanded ? 'w-80' : 'w-auto'}`}>
        {/* Toggle Button */}
        <button
          onClick={() => {
            onToggle(!enabled)
            if (!enabled) setExpanded(true)
          }}
          className={`w-full px-4 py-3 flex items-center justify-between font-medium transition-colors rounded-lg ${
            enabled ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          aria-label={enabled ? 'Disable focus mode' : 'Enable focus mode'}
        >
          <div className="flex items-center gap-2">
            {enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>Focus Mode {enabled ? 'On' : 'Off'}</span>
          </div>
          <span className="text-xs">{expanded ? '▼' : '▶'}</span>
        </button>

        {/* Settings Panel */}
        {expanded && enabled && (
          <div className="border-t border-border p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">Customize Focus Mode:</p>

            {[
              { key: 'hideImages' as const, label: 'Hide Images', desc: 'Removes visual distractions' },
              { key: 'hideAds' as const, label: 'Hide Ads', desc: 'Blocks advertisement content' },
              { key: 'hideDistractions' as const, label: 'Hide Sidebars', desc: 'Removes related content' },
              { key: 'enhanceContrast' as const, label: 'Enhance Contrast', desc: 'Improves text readability' },
              { key: 'increaseLineHeight' as const, label: 'Increase Line Height', desc: 'More space between lines' },
              { key: 'increaseFontSize' as const, label: 'Increase Font Size', desc: 'Larger, easier to read text' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={() => handleSettingChange(key)}
                  className="mt-1 w-4 h-4 rounded border-border cursor-pointer"
                  aria-label={label}
                />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </label>
            ))}

            <button
              onClick={() => setExpanded(false)}
              className="w-full text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {!enabled && !expanded && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute bottom-12 right-0 text-xs bg-muted text-muted-foreground px-2 py-1 rounded whitespace-nowrap"
        >
          Settings
        </button>
      )}
    </div>
  )
}

export default FocusMode
