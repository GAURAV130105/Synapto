/**
 * InputPanel Component
 * Text input with speech-to-text mic button and translation mode toggle.
 */

import { useState, useCallback } from 'react'
import { useSpeechInput } from '../hooks/useSpeechInput'
import useAppStore from '../store/useAppStore'

export default function InputPanel({ onTranslate }) {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const inputText = useAppStore((s) => s.inputText)
  const setInputText = useAppStore((s) => s.setInputText)
  const translationMode = useAppStore((s) => s.translationMode)
  const setTranslationMode = useAppStore((s) => s.setTranslationMode)
  const isListening = useAppStore((s) => s.isListening)
  const status = useAppStore((s) => s.status)

  const handleSpeechResult = useCallback((text) => {
    setInputText(text)
  }, [setInputText])

  const { startListening, stopListening } = useSpeechInput(handleSpeechResult)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputText.trim() || status === 'signing') return
    onTranslate(inputText, translationMode, apiKey)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="input-panel">
      <div className="mode-toggle">
        <button
          className={`mode-btn ${translationMode === 'rule' ? 'active' : ''}`}
          onClick={() => setTranslationMode('rule')}
          title="Rule-based translation (offline, fast)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Rule-Based
        </button>
        <button
          className={`mode-btn ${translationMode === 'llm' ? 'active' : ''}`}
          onClick={() => setTranslationMode('llm')}
          title="AI-powered translation (requires API key)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a5 5 0 0 1 5 5c0 2-1 3-2 4l-1 1v2h-4v-2l-1-1c-1-1-2-2-2-4a5 5 0 0 1 5-5z"/>
            <path d="M9 18h6M10 22h4"/>
          </svg>
          AI (Gemini)
        </button>
      </div>

      {translationMode === 'llm' && (
        <div className="api-key-section">
          <div className="api-key-input-wrap">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Gemini API Key..."
              className="api-key-input"
            />
            <button
              className="toggle-visibility"
              onClick={() => setShowApiKey(!showApiKey)}
              title={showApiKey ? 'Hide' : 'Show'}
            >
              {showApiKey ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-wrapper">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message to translate to sign language..."
            className="text-input"
            rows={2}
            disabled={status === 'signing'}
          />
          <button
            type="button"
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
            title={isListening ? 'Stop Listening' : 'Voice Input'}
            disabled={status === 'signing'}
          >
            {isListening ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>
        </div>
        <button
          type="submit"
          className="translate-btn"
          disabled={!inputText.trim() || status === 'signing'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          Translate to Sign
        </button>
      </form>

      <div className="quick-phrases">
        {['Hello', 'Thank you', 'Please help', 'I love you', 'How are you'].map((phrase) => (
          <button
            key={phrase}
            className="quick-btn"
            onClick={() => {
              setInputText(phrase)
              onTranslate(phrase, translationMode, apiKey)
            }}
            disabled={status === 'signing'}
          >
            {phrase}
          </button>
        ))}
      </div>
    </div>
  )
}
