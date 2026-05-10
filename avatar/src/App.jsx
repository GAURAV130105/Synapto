import { useRef, useCallback } from 'react'
import Avatar3D from './components/Avatar3D'
import InputPanel from './components/InputPanel'
import PlaybackControls from './components/PlaybackControls'
import GlossDisplay from './components/GlossDisplay'
import useAppStore from './store/useAppStore'
import './styles/index.css'

function App() {
  const avatarRef = useRef()
  const status = useAppStore((s) => s.status)
  const history = useAppStore((s) => s.history)

  const handleTranslate = useCallback(async (text, mode, apiKey) => {
    if (avatarRef.current) {
      await avatarRef.current.signText(text, mode, apiKey)
    }
  }, [])

  const handlePause = useCallback(() => {
    avatarRef.current?.pause()
  }, [])

  const handleResume = useCallback(() => {
    avatarRef.current?.resume()
  }, [])

  const handleStop = useCallback(() => {
    avatarRef.current?.stop()
  }, [])

  return (
    <div className="app">
      {/* Background effects */}
      <div className="bg-gradient" />
      <div className="bg-grid" />

      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🤟</span>
          <h1>SignSpeak</h1>
          <span className="badge">AI Avatar</span>
        </div>
        <p className="tagline">AI-Powered Sign Language Translation</p>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="avatar-section">
          <Avatar3D ref={avatarRef} />
          <PlaybackControls
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
          />
        </div>

        <div className="controls-section">
          <GlossDisplay />
          <InputPanel onTranslate={handleTranslate} />

          {/* History */}
          {history.length > 0 && (
            <div className="history-panel">
              <h3 className="history-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Recent
              </h3>
              <div className="history-list">
                {history.slice(0, 5).map((item, i) => (
                  <button
                    key={i}
                    className="history-item"
                    onClick={() => handleTranslate(item.text, 'rule', '')}
                    disabled={status === 'signing'}
                  >
                    <span className="history-text">{item.text}</span>
                    <span className="history-gloss">{item.glosses.join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Built with React Three Fiber • ASL Translation Engine • AI-Powered Gloss</p>
      </footer>
    </div>
  )
}

export default App
