/**
 * PlaybackControls Component
 * Play/pause, stop, speed controls for the signing animation.
 */

import useAppStore from '../store/useAppStore'

export default function PlaybackControls({ onPause, onResume, onStop }) {
  const isPlaying = useAppStore((s) => s.isPlaying)
  const playbackSpeed = useAppStore((s) => s.playbackSpeed)
  const setPlaybackSpeed = useAppStore((s) => s.setPlaybackSpeed)
  const status = useAppStore((s) => s.status)
  const statusMessage = useAppStore((s) => s.statusMessage)

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

  if (status === 'idle') return null

  return (
    <div className="playback-controls">
      <div className="controls-row">
        <button
          className="control-btn"
          onClick={isPlaying ? onPause : onResume}
          disabled={status === 'done' || status === 'translating'}
          title={isPlaying ? 'Pause' : 'Resume'}
        >
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </button>
        
        <button
          className="control-btn stop-btn"
          onClick={onStop}
          title="Stop"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
          </svg>
        </button>

        <div className="speed-controls">
          <span className="speed-label">Speed</span>
          <div className="speed-buttons">
            {speeds.map((s) => (
              <button
                key={s}
                className={`speed-btn ${playbackSpeed === s ? 'active' : ''}`}
                onClick={() => setPlaybackSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="status-message">
          <div className={`status-dot ${status}`} />
          {statusMessage}
        </div>
      )}
    </div>
  )
}
