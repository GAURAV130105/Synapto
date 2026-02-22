'use client'

/**
 * High-Quality Robotic / Mechanical Hand SVG Components
 * These render clean, futuristic robotic hands with:
 * - Segmented metallic fingers with visible joints
 * - Gradient shading for 3D depth
 * - Glowing accents at joints
 * - Clean outlines for clarity
 */

export interface HandTheme {
  metal: string
  metalLight: string
  metalDark: string
  joint: string
  jointGlow: string
  accent: string
  outline: string
}

export const HAND_THEMES: Record<string, HandTheme> = {
  silver: {
    metal: '#B8C4D0', metalLight: '#D4DEE8', metalDark: '#8A9BB0',
    joint: '#64748B', jointGlow: '#94A3B8', accent: '#3B82F6', outline: '#475569',
  },
  gold: {
    metal: '#D4A853', metalLight: '#E8C878', metalDark: '#B08A35',
    joint: '#8B6914', jointGlow: '#C49B38', accent: '#F59E0B', outline: '#7C5E10',
  },
  dark: {
    metal: '#374151', metalLight: '#4B5563', metalDark: '#1F2937',
    joint: '#6366F1', jointGlow: '#818CF8', accent: '#A78BFA', outline: '#111827',
  },
}

export type HandThemeName = keyof typeof HAND_THEMES

// Shared gradient definitions
function HandDefs({ theme, id }: { theme: HandTheme; id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={theme.metalLight} />
        <stop offset="50%" stopColor={theme.metal} />
        <stop offset="100%" stopColor={theme.metalDark} />
      </linearGradient>
      <linearGradient id={`${id}-finger`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={theme.metalLight} />
        <stop offset="100%" stopColor={theme.metalDark} />
      </linearGradient>
      <radialGradient id={`${id}-joint`}>
        <stop offset="0%" stopColor={theme.jointGlow} />
        <stop offset="70%" stopColor={theme.joint} />
        <stop offset="100%" stopColor={theme.metalDark} />
      </radialGradient>
      <filter id={`${id}-glow`}>
        <feGaussianBlur stdDeviation="2" result="g" />
        <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id={`${id}-shadow`} x="-20%" y="-20%" width="150%" height="150%">
        <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.25" />
      </filter>
    </defs>
  )
}

// Joint circle component
function Joint({ cx, cy, r, theme, id }: { cx: number; cy: number; r: number; theme: HandTheme; id: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 1} fill={theme.accent} opacity="0.3" filter={`url(#${id}-glow)`} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-joint)`} stroke={theme.outline} strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r * 0.35} fill={theme.accent} opacity="0.8" />
    </g>
  )
}

// Finger segment (rectangular with rounded ends)
function FingerSeg({ x, y, w, h, theme, id, rotate = 0 }: {
  x: number; y: number; w: number; h: number; theme: HandTheme; id: string; rotate?: number
}) {
  return (
    <g transform={`rotate(${rotate}, ${x + w / 2}, ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} rx={w / 2.5} ry={w / 2.5}
        fill={`url(#${id}-finger)`} stroke={theme.outline} strokeWidth="1.2" />
      {/* Metallic line highlight */}
      <line x1={x + w * 0.3} y1={y + 3} x2={x + w * 0.3} y2={y + h - 3}
        stroke={theme.metalLight} strokeWidth="0.8" opacity="0.5" />
    </g>
  )
}

// Fingertip (rounded cap)
function Fingertip({ cx, cy, rx, ry, theme, id }: {
  cx: number; cy: number; rx: number; ry: number; theme: HandTheme; id: string
}) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
        fill={theme.metal} stroke={theme.outline} strokeWidth="1.2" />
      <ellipse cx={cx} cy={cy - 1} rx={rx * 0.5} ry={ry * 0.4}
        fill={theme.metalLight} opacity="0.6" />
    </g>
  )
}

// ─── OPEN HAND (all fingers extended) ───
export function RoboticHandOpen({ theme, side }: { theme: HandTheme; side: 'left' | 'right' }) {
  const id = `open-${side}`
  const sx = side === 'right' ? -1 : 1
  return (
    <g transform={side === 'right' ? 'translate(260, 0) scale(-1, 1)' : ''}>
      <HandDefs theme={theme} id={id} />
      <g filter={`url(#${id}-shadow)`}>
        {/* Palm */}
        <path d={`M 50 200 L 55 155 Q 60 130, 80 125 L 190 125 Q 210 130, 215 155 L 220 200 
          Q 220 245, 200 265 L 185 280 Q 135 295, 85 280 L 70 265 Q 50 245, 50 200 Z`}
          fill={`url(#${id}-metal)`} stroke={theme.outline} strokeWidth="2" />
        {/* Palm plate lines */}
        <path d="M 80 160 L 190 160" stroke={theme.metalDark} strokeWidth="0.8" opacity="0.3" />
        <path d="M 75 195 L 195 195" stroke={theme.metalDark} strokeWidth="0.8" opacity="0.3" />
        {/* Palm center light */}
        <ellipse cx="135" cy="190" rx="25" ry="20" fill={theme.accent} opacity="0.08" />

        {/* ── Index finger ── */}
        <FingerSeg x={80} y={70} w={18} h={55} theme={theme} id={id} />
        <Joint cx={89} cy={70} r={5} theme={theme} id={id} />
        <FingerSeg x={81} y={22} w={16} h={48} theme={theme} id={id} />
        <Joint cx={89} cy={22} r={4} theme={theme} id={id} />
        <Fingertip cx={89} cy={12} rx={8} ry={6} theme={theme} id={id} />

        {/* ── Middle finger ── */}
        <FingerSeg x={113} y={60} w={18} h={65} theme={theme} id={id} />
        <Joint cx={122} cy={60} r={5} theme={theme} id={id} />
        <FingerSeg x={114} y={12} w={16} h={48} theme={theme} id={id} />
        <Joint cx={122} cy={12} r={4} theme={theme} id={id} />
        <Fingertip cx={122} cy={2} rx={8} ry={6} theme={theme} id={id} />

        {/* ── Ring finger ── */}
        <FingerSeg x={147} y={65} w={18} h={60} theme={theme} id={id} />
        <Joint cx={156} cy={65} r={5} theme={theme} id={id} />
        <FingerSeg x={148} y={20} w={16} h={45} theme={theme} id={id} />
        <Joint cx={156} cy={20} r={4} theme={theme} id={id} />
        <Fingertip cx={156} cy={10} rx={8} ry={6} theme={theme} id={id} />

        {/* ── Pinky ── */}
        <FingerSeg x={180} y={80} w={16} h={45} theme={theme} id={id} />
        <Joint cx={188} cy={80} r={4.5} theme={theme} id={id} />
        <FingerSeg x={181} y={40} w={14} h={40} theme={theme} id={id} />
        <Joint cx={188} cy={40} r={3.5} theme={theme} id={id} />
        <Fingertip cx={188} cy={32} rx={7} ry={5} theme={theme} id={id} />

        {/* ── Thumb ── */}
        <g transform="rotate(35, 55, 200)">
          <FingerSeg x={20} y={165} w={18} h={45} theme={theme} id={id} />
          <Joint cx={29} cy={165} r={5} theme={theme} id={id} />
          <FingerSeg x={21} y={125} w={16} h={40} theme={theme} id={id} />
          <Fingertip cx={29} cy={118} rx={8} ry={6} theme={theme} id={id} />
        </g>

        {/* Wrist connector */}
        <rect x={65} y={280} width={140} height={25} rx={6}
          fill={theme.metalDark} stroke={theme.outline} strokeWidth="1.5" />
        <rect x={90} y={285} width={90} height={4} rx={2} fill={theme.accent} opacity="0.4" />
      </g>
    </g>
  )
}

// ─── FIST (all fingers curled) ───
export function RoboticHandFist({ theme, side }: { theme: HandTheme; side: 'left' | 'right' }) {
  const id = `fist-${side}`
  return (
    <g transform={side === 'right' ? 'translate(260, 0) scale(-1, 1)' : ''}>
      <HandDefs theme={theme} id={id} />
      <g filter={`url(#${id}-shadow)`}>
        {/* Closed fist body */}
        <path d={`M 60 140 Q 65 100, 95 90 L 180 90 Q 210 100, 215 140 
          L 218 200 Q 218 250, 195 270 L 175 280 Q 135 290, 95 280 
          L 75 270 Q 52 250, 52 200 Z`}
          fill={`url(#${id}-metal)`} stroke={theme.outline} strokeWidth="2" />
        {/* Curled finger segments visible on top */}
        <path d="M 85 95 Q 85 75, 95 68 Q 105 62, 110 72 Q 112 82, 105 92"
          fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
        <path d="M 115 90 Q 115 65, 128 58 Q 140 52, 145 65 Q 147 78, 138 88"
          fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
        <path d="M 148 92 Q 148 72, 160 65 Q 172 60, 175 72 Q 177 84, 168 92"
          fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
        <path d="M 175 100 Q 178 82, 188 78 Q 198 76, 200 88 Q 200 98, 192 102"
          fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
        {/* Knuckle joints */}
        <Joint cx={95} cy={92} r={5} theme={theme} id={id} />
        <Joint cx={128} cy={88} r={5} theme={theme} id={id} />
        <Joint cx={160} cy={90} r={5} theme={theme} id={id} />
        <Joint cx={188} cy={100} r={4.5} theme={theme} id={id} />
        {/* Thumb across front */}
        <path d={`M 60 180 Q 45 165, 48 145 Q 52 128, 65 122 Q 78 118, 85 130`}
          fill={theme.metal} stroke={theme.outline} strokeWidth="2" />
        <Joint cx={55} cy={140} r={5} theme={theme} id={id} />
        <Fingertip cx={85} cy={126} rx={8} ry={7} theme={theme} id={id} />
        {/* Wrist */}
        <rect x={68} y={278} width={135} height={25} rx={6}
          fill={theme.metalDark} stroke={theme.outline} strokeWidth="1.5" />
        <rect x={93} y={283} width={85} height={4} rx={2} fill={theme.accent} opacity="0.4" />
      </g>
    </g>
  )
}

// ─── POINTING (index extended, others curled) ───
export function RoboticHandPointing({ theme, side }: { theme: HandTheme; side: 'left' | 'right' }) {
  const id = `point-${side}`
  return (
    <g transform={side === 'right' ? 'translate(260, 0) scale(-1, 1)' : ''}>
      <HandDefs theme={theme} id={id} />
      <g filter={`url(#${id}-shadow)`}>
        {/* Palm/fist body */}
        <path d={`M 60 150 Q 65 115, 95 105 L 180 105 Q 210 115, 215 150 
          L 218 210 Q 218 255, 195 275 L 175 285 Q 135 295, 95 285 
          L 75 275 Q 52 255, 52 210 Z`}
          fill={`url(#${id}-metal)`} stroke={theme.outline} strokeWidth="2" />
        {/* Index finger - extended upward */}
        <FingerSeg x={81} y={50} w={18} h={55} theme={theme} id={id} />
        <Joint cx={90} cy={50} r={5} theme={theme} id={id} />
        <FingerSeg x={82} y={5} w={16} h={45} theme={theme} id={id} />
        <Joint cx={90} cy={5} r={4} theme={theme} id={id} />
        <Fingertip cx={90} cy={-5} rx={8} ry={6} theme={theme} id={id} />
        {/* Other fingers curled */}
        <path d="M 120 108 Q 122 85, 135 80 Q 148 78, 150 90 Q 150 102, 140 108"
          fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
        <path d="M 155 110 Q 158 90, 170 86 Q 182 84, 184 96 Q 184 108, 174 112"
          fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
        <path d="M 185 118 Q 190 100, 200 98 Q 208 97, 208 108 Q 206 118, 198 120"
          fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
        <Joint cx={135} cy={106} r={4.5} theme={theme} id={id} />
        <Joint cx={170} cy={110} r={4.5} theme={theme} id={id} />
        <Joint cx={198} cy={118} r={4} theme={theme} id={id} />
        {/* Thumb */}
        <path d={`M 60 190 Q 42 170, 48 148 Q 54 132, 70 130`}
          fill={theme.metal} stroke={theme.outline} strokeWidth="2" />
        <Joint cx={55} cy={150} r={5} theme={theme} id={id} />
        {/* Wrist */}
        <rect x={68} y={283} width={135} height={25} rx={6}
          fill={theme.metalDark} stroke={theme.outline} strokeWidth="1.5" />
        <rect x={93} y={288} width={85} height={4} rx={2} fill={theme.accent} opacity="0.4" />
      </g>
    </g>
  )
}

// ─── FLAT HAND (horizontal, palm down) ───
export function RoboticHandFlat({ theme, side }: { theme: HandTheme; side: 'left' | 'right' }) {
  const id = `flat-${side}`
  return (
    <g transform={side === 'right' ? 'translate(260, 0) scale(-1, 1)' : ''}>
      <HandDefs theme={theme} id={id} />
      <g filter={`url(#${id}-shadow)`} transform="translate(0, 40)">
        {/* Palm - horizontal */}
        <rect x={40} y={130} width={185} height={55} rx={14}
          fill={`url(#${id}-metal)`} stroke={theme.outline} strokeWidth="2" />
        <line x1={65} y1={148} x2={200} y2={148} stroke={theme.metalDark} strokeWidth="0.8" opacity="0.3" />
        <line x1={65} y1={168} x2={200} y2={168} stroke={theme.metalDark} strokeWidth="0.8" opacity="0.3" />
        {/* Fingers extending forward */}
        {[0, 1, 2, 3].map(i => {
          const y = 133 + i * 13
          const x = 225
          return (
            <g key={i}>
              <rect x={x} y={y} width={35} height={10} rx={5}
                fill={theme.metal} stroke={theme.outline} strokeWidth="1" />
              <Joint cx={x} cy={y + 5} r={3.5} theme={theme} id={`${id}-f${i}`} />
              <rect x={x + 35} y={y + 1} width={22} height={8} rx={4}
                fill={theme.metalLight} stroke={theme.outline} strokeWidth="1" />
            </g>
          )
        })}
        {/* Thumb */}
        <g transform="rotate(-30, 55, 185)">
          <rect x={30} y={185} width={30} height={12} rx={6}
            fill={theme.metal} stroke={theme.outline} strokeWidth="1.2" />
          <Joint cx={30} cy={191} r={4} theme={theme} id={id} />
          <rect x={10} y={187} width={20} height={9} rx={4}
            fill={theme.metalLight} stroke={theme.outline} strokeWidth="1" />
        </g>
        {/* Wrist */}
        <rect x={10} y={140} width={30} height={35} rx={6}
          fill={theme.metalDark} stroke={theme.outline} strokeWidth="1.5" />
        <rect x={15} y={150} width={4} height={15} rx={2} fill={theme.accent} opacity="0.4" />
      </g>
    </g>
  )
}

// ─── FINGERSPELLING SINGLE HAND ───
// Maps each letter to a pose category for distinct SVG rendering
const LETTER_POSE: Record<string, string> = {
  a: 'fist-thumb-side', s: 'fist-thumb-across', t: 'fist-thumb-between',
  e: 'fist-curled', m: 'fist-drape-3', n: 'fist-drape-2',
  b: 'flat-up', d: 'index-up', g: 'point-side', z: 'index-up',
  u: 'two-up-close', v: 'two-up-spread', r: 'two-crossed',
  h: 'two-side', k: 'two-up-thumb',
  w: 'three-up', f: 'ok-spread', 
  c: 'c-curve', o: 'o-circle',
  l: 'l-shape', i: 'pinky-up', j: 'pinky-up', y: 'shaka',
  x: 'hook', p: 'k-down', q: 'g-down',
}

// Wrist component used by all poses
function Wrist({ theme, id, x = 68, y = 270, w = 135 }: { theme: HandTheme; id: string; x?: number; y?: number; w?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={22} rx={6} fill={theme.metalDark} stroke={theme.outline} strokeWidth="1.5" />
      <rect x={x + 20} y={y + 5} width={w - 40} height={4} rx={2} fill={theme.accent} opacity="0.4" />
    </g>
  )
}

// Palm shape used by most poses
function PalmBase({ theme, id, top = 125 }: { theme: HandTheme; id: string; top?: number }) {
  return (
    <path d={`M 60 ${top + 75} L 65 ${top + 30} Q 70 ${top + 5}, 90 ${top} L 185 ${top} Q 205 ${top + 5}, 210 ${top + 30} L 215 ${top + 75} 
      Q 215 ${top + 115}, 198 ${top + 133} L 182 ${top + 145} Q 140 ${top + 155}, 98 ${top + 145} L 82 ${top + 133} Q 60 ${top + 115}, 60 ${top + 75} Z`}
      fill={`url(#${id}-metal)`} stroke={theme.outline} strokeWidth="2" />
  )
}

// Extended finger (straight up from palm)
function ExtendedFinger({ x, theme, id, highlight = false, yBase = 70, segH = 55, tipY = 18, yOff = 0 }: {
  x: number; theme: HandTheme; id: string; highlight?: boolean; yBase?: number; segH?: number; tipY?: number; yOff?: number
}) {
  const accentFill = highlight ? theme.accent : theme.metal
  return (
    <g>
      <FingerSeg x={x - 8} y={yBase + yOff} w={16} h={segH} theme={theme} id={id} />
      <Joint cx={x} cy={yBase + yOff} r={4.5} theme={theme} id={id} />
      <FingerSeg x={x - 7} y={tipY + yOff + 5} w={14} h={segH - 10} theme={theme} id={id} />
      <Fingertip cx={x} cy={tipY + yOff} rx={7} ry={5} theme={theme} id={id} />
      {highlight && <circle cx={x} cy={tipY + yOff} r={10} fill={theme.accent} opacity="0.15" />}
    </g>
  )
}

// Curled finger (shows only knuckle bump)
function CurledFinger({ x, y, theme, id }: { x: number; y: number; theme: HandTheme; id: string }) {
  return (
    <g>
      <path d={`M ${x - 8} ${y + 2} Q ${x - 6} ${y - 15}, ${x + 2} ${y - 20} Q ${x + 10} ${y - 22}, ${x + 12} ${y - 12} Q ${x + 13} ${y - 2}, ${x + 6} ${y + 2}`}
        fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
      <Joint cx={x + 2} cy={y} r={4.5} theme={theme} id={id} />
    </g>
  )
}

// Thumb extended to side
function ThumbSide({ theme, id }: { theme: HandTheme; id: string }) {
  return (
    <g>
      <rect x={35} y={130} width={16} height={45} rx={8} fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
      <Joint cx={43} cy={130} r={5} theme={theme} id={id} />
      <Fingertip cx={43} cy={122} rx={8} ry={6} theme={theme} id={id} />
    </g>
  )
}

// Thumb across front of fist
function ThumbAcross({ theme, id }: { theme: HandTheme; id: string }) {
  return (
    <g>
      <path d={`M 58 180 Q 42 165, 46 145 Q 50 128, 65 122 Q 78 118, 88 130`}
        fill={theme.metal} stroke={theme.outline} strokeWidth="2" />
      <Joint cx={52} cy={142} r={5} theme={theme} id={id} />
      <Fingertip cx={86} cy={126} rx={8} ry={7} theme={theme} id={id} />
    </g>
  )
}

// Thumb tucked under fingers  
function ThumbTucked({ theme, id }: { theme: HandTheme; id: string }) {
  return (
    <g>
      <path d={`M 63 195 Q 48 178, 52 158 Q 56 143, 72 140`}
        fill={theme.metal} stroke={theme.outline} strokeWidth="1.8" />
      <Joint cx={54} cy={158} r={4.5} theme={theme} id={id} />
    </g>
  )
}

// Thumb between index and middle
function ThumbBetween({ theme, id }: { theme: HandTheme; id: string }) {
  return (
    <g>
      <path d={`M 60 175 Q 45 158, 50 138 Q 56 118, 75 112`}
        fill={theme.metal} stroke={theme.outline} strokeWidth="2" />
      <Joint cx={52} cy={140} r={5} theme={theme} id={id} />
      <Fingertip cx={75} cy={108} rx={7} ry={6} theme={theme} id={id} />
      {/* Glow to show thumb poking through */}
      <circle cx={75} cy={108} r={10} fill={theme.accent} opacity="0.2" />
    </g>
  )
}

export function RoboticSingleHand({ letter, theme }: { letter: string; theme: HandTheme }) {
  const id = `spell-${letter}`
  const l = letter.toLowerCase()
  const pose = LETTER_POSE[l] || 'flat-up'

  // Finger x-positions on palm
  const FX = { idx: 90, mid: 122, ring: 154, pinky: 183 }
  
  return (
    <g>
      <HandDefs theme={theme} id={id} />
      <g filter={`url(#${id}-shadow)`}>

        {/* ── FIST VARIANTS (A, S, T, E, M, N) ── */}
        {(pose === 'fist-thumb-side' || pose === 'fist-thumb-across' || pose === 'fist-thumb-between' ||
          pose === 'fist-curled' || pose === 'fist-drape-3' || pose === 'fist-drape-2') && (
          <g>
            {/* Fist body */}
            <path d={`M 60 130 Q 65 95, 95 85 L 180 85 Q 205 95, 210 130 
              L 213 195 Q 213 240, 193 258 L 175 268 Q 135 278, 95 268 
              L 78 258 Q 58 240, 58 195 Z`}
              fill={`url(#${id}-metal)`} stroke={theme.outline} strokeWidth="2" />
            {/* Curled finger bumps */}
            {(l === 'm' || l === 'n' || l === 'e') ? (
              /* M/N/E: fingers drape more visibly */
              <g>
                {[92, 122, 152, 182].slice(0, l === 'm' ? 3 : l === 'n' ? 2 : 4).map((x, i) => (
                  <path key={i} d={`M ${x - 10} ${90} Q ${x - 8} ${68}, ${x + 2} ${62} Q ${x + 12} ${58}, ${x + 14} ${70} Q ${x + 14} ${82}, ${x + 6} ${90}`}
                    fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
                ))}
                {[92, 122, 152, 182].slice(0, l === 'm' ? 3 : l === 'n' ? 2 : 4).map((x, i) => (
                  <Joint key={`j${i}`} cx={x + 2} cy={88} r={4.5} theme={theme} id={id} />
                ))}
              </g>
            ) : (
              <g>
                {[92, 122, 152, 182].map((x, i) => (
                  <CurledFinger key={i} x={x} y={88} theme={theme} id={id} />
                ))}
              </g>
            )}
            {/* Thumb varies by letter */}
            {pose === 'fist-thumb-side' && <ThumbSide theme={theme} id={id} />}
            {pose === 'fist-thumb-across' && <ThumbAcross theme={theme} id={id} />}
            {pose === 'fist-thumb-between' && <ThumbBetween theme={theme} id={id} />}
            {(pose === 'fist-curled' || pose === 'fist-drape-3' || pose === 'fist-drape-2') && <ThumbTucked theme={theme} id={id} />}
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── FLAT HAND UP (B) ── */}
        {pose === 'flat-up' && (
          <g>
            <PalmBase theme={theme} id={id} />
            {[FX.idx, FX.mid, FX.ring, FX.pinky].map((x, i) => (
              <ExtendedFinger key={i} x={x} theme={theme} id={id} yBase={70 + i * 4} tipY={16 + i * 4} />
            ))}
            <ThumbTucked theme={theme} id={id} />
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── INDEX POINTING UP (D, Z) ── */}
        {pose === 'index-up' && (
          <g>
            <PalmBase theme={theme} id={id} top={130} />
            {/* Index finger extended and highlighted */}
            <ExtendedFinger x={FX.idx} theme={theme} id={id} highlight yBase={75} tipY={18} />
            {/* Others curled */}
            <CurledFinger x={FX.mid} y={132} theme={theme} id={id} />
            <CurledFinger x={FX.ring} y={134} theme={theme} id={id} />
            <CurledFinger x={FX.pinky} y={138} theme={theme} id={id} />
            <ThumbAcross theme={theme} id={id} />
            {l === 'z' && (
              /* Z motion indicator */
              <g opacity="0.5">
                <path d="M 75 40 L 115 40 L 75 70 L 115 70" fill="none" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
              </g>
            )}
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── POINT SIDEWAYS (G) ── */}
        {pose === 'point-side' && (
          <g>
            <PalmBase theme={theme} id={id} top={130} />
            {/* Index + thumb extend sideways */}
            <g transform="rotate(-80, 90, 130)">
              <FingerSeg x={82} y={60} w={16} h={55} theme={theme} id={id} />
              <Joint cx={90} cy={60} r={5} theme={theme} id={id} />
              <FingerSeg x={83} y={12} w={14} h={48} theme={theme} id={id} />
              <Fingertip cx={90} cy={5} rx={7} ry={5} theme={theme} id={id} />
              <circle cx={90} cy={5} r={10} fill={theme.accent} opacity="0.15" />
            </g>
            <CurledFinger x={FX.mid} y={132} theme={theme} id={id} />
            <CurledFinger x={FX.ring} y={134} theme={theme} id={id} />
            <CurledFinger x={FX.pinky} y={138} theme={theme} id={id} />
            <ThumbSide theme={theme} id={id} />
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── TWO FINGERS UP CLOSE (U), SPREAD (V), CROSSED (R) ── */}
        {(pose === 'two-up-close' || pose === 'two-up-spread' || pose === 'two-crossed') && (
          <g>
            <PalmBase theme={theme} id={id} />
            {/* Index finger */}
            <ExtendedFinger x={pose === 'two-up-spread' ? FX.idx - 6 : FX.idx} theme={theme} id={id} highlight yBase={72} tipY={18} />
            {/* Middle finger */}
            <ExtendedFinger x={pose === 'two-up-spread' ? FX.mid + 6 : FX.mid} theme={theme} id={id} highlight yBase={68} tipY={14} />
            {pose === 'two-crossed' && (
              /* R: crossing indicator */
              <line x1={FX.idx} y1={50} x2={FX.mid} y2={30} stroke={theme.accent} strokeWidth="2" opacity="0.4" />
            )}
            <CurledFinger x={FX.ring} y={128} theme={theme} id={id} />
            <CurledFinger x={FX.pinky} y={132} theme={theme} id={id} />
            <ThumbTucked theme={theme} id={id} />
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── TWO FINGERS WITH THUMB (K), TWO SIDEWAYS (H) ── */}
        {(pose === 'two-up-thumb' || pose === 'two-side') && (
          <g>
            <PalmBase theme={theme} id={id} />
            <ExtendedFinger x={FX.idx} theme={theme} id={id} highlight yBase={72} tipY={18} />
            <ExtendedFinger x={FX.mid} theme={theme} id={id} highlight yBase={68} tipY={14} />
            <CurledFinger x={FX.ring} y={128} theme={theme} id={id} />
            <CurledFinger x={FX.pinky} y={132} theme={theme} id={id} />
            {/* Thumb touches middle finger for K */}
            {pose === 'two-up-thumb' ? (
              <g>
                <path d={`M 60 190 Q 42 170, 50 148 Q 58 130, 80 122`}
                  fill={theme.metal} stroke={theme.outline} strokeWidth="2" />
                <Joint cx={55} cy={148} r={5} theme={theme} id={id} />
                <circle cx={80} cy={122} r={8} fill={theme.accent} opacity="0.2" />
              </g>
            ) : <ThumbSide theme={theme} id={id} />}
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── THREE FINGERS UP (W) ── */}
        {pose === 'three-up' && (
          <g>
            <PalmBase theme={theme} id={id} />
            <ExtendedFinger x={FX.idx - 4} theme={theme} id={id} highlight yBase={72} tipY={18} />
            <ExtendedFinger x={FX.mid} theme={theme} id={id} highlight yBase={68} tipY={14} />
            <ExtendedFinger x={FX.ring + 4} theme={theme} id={id} highlight yBase={72} tipY={18} />
            <CurledFinger x={FX.pinky} y={132} theme={theme} id={id} />
            <ThumbTucked theme={theme} id={id} />
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── C CURVE / O CIRCLE ── */}
        {(pose === 'c-curve' || pose === 'o-circle') && (
          <g>
            {/* Curved palm */}
            <path d={`M 70 220 Q 65 180, 75 155 Q 85 135, 110 125 L 170 125 Q 195 135, 205 155 
              Q 215 180, 210 220 Q 208 255, 190 270 Q 150 285, 110 270 Q 75 255, 70 220 Z`}
              fill={`url(#${id}-metal)`} stroke={theme.outline} strokeWidth="2" />
            {/* Curved fingers forming C or O */}
            {[FX.idx, FX.mid, FX.ring, FX.pinky].map((x, i) => (
              <g key={i}>
                <path d={`M ${x - 4} ${128} Q ${x + 10} ${90 + i * 3}, ${x + 20 - (pose === 'o-circle' ? 8 : 0)} ${80 + i * 5} 
                  Q ${x + 25 - (pose === 'o-circle' ? 10 : 0)} ${75 + i * 5}, ${x + 18} ${90 + i * 3}`}
                  fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
                <Joint cx={x + 6} cy={100 + i * 3} r={4} theme={theme} id={id} />
              </g>
            ))}
            {/* Thumb curving to meet */}
            <path d={`M 65 195 Q 40 175, 38 150 Q 38 130, 55 118 Q 70 108, ${pose === 'o-circle' ? '95 105' : '85 100'}`}
              fill={theme.metal} stroke={theme.outline} strokeWidth="2" />
            <Joint cx={42} cy={150} r={5} theme={theme} id={id} />
            {pose === 'o-circle' && <circle cx={90} cy={102} r={12} fill={theme.accent} opacity="0.12" />}
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── L SHAPE ── */}
        {pose === 'l-shape' && (
          <g>
            <PalmBase theme={theme} id={id} />
            {/* Index up */}
            <ExtendedFinger x={FX.idx} theme={theme} id={id} highlight yBase={72} tipY={14} />
            {/* Others curled */}
            <CurledFinger x={FX.mid} y={128} theme={theme} id={id} />
            <CurledFinger x={FX.ring} y={130} theme={theme} id={id} />
            <CurledFinger x={FX.pinky} y={132} theme={theme} id={id} />
            {/* Thumb extended sideways (making L) */}
            <g>
              <rect x={25} y={150} width={38} height={14} rx={7} fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
              <Joint cx={62} cy={157} r={5} theme={theme} id={id} />
              <Fingertip cx={22} cy={157} rx={7} ry={6} theme={theme} id={id} />
              <circle cx={22} cy={157} r={10} fill={theme.accent} opacity="0.15" />
            </g>
            {/* L guide lines */}
            <line x1={FX.idx} y1={14} x2={FX.idx} y2={72} stroke={theme.accent} strokeWidth="1" opacity="0.2" />
            <line x1={22} y1={157} x2={62} y2={157} stroke={theme.accent} strokeWidth="1" opacity="0.2" />
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── PINKY UP (I, J) ── */}
        {pose === 'pinky-up' && (
          <g>
            <PalmBase theme={theme} id={id} top={130} />
            <CurledFinger x={FX.idx} y={132} theme={theme} id={id} />
            <CurledFinger x={FX.mid} y={130} theme={theme} id={id} />
            <CurledFinger x={FX.ring} y={132} theme={theme} id={id} />
            {/* Pinky extended and highlighted */}
            <ExtendedFinger x={FX.pinky} theme={theme} id={id} highlight yBase={82} tipY={30} segH={48} />
            <ThumbAcross theme={theme} id={id} />
            {l === 'j' && (
              /* J motion curve */
              <path d={`M ${FX.pinky} 30 Q ${FX.pinky + 15} 50, ${FX.pinky + 5} 70`}
                fill="none" stroke={theme.accent} strokeWidth="2" opacity="0.5" strokeDasharray="4 3" strokeLinecap="round" />
            )}
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── SHAKA / Y ── */}
        {pose === 'shaka' && (
          <g>
            <PalmBase theme={theme} id={id} />
            <CurledFinger x={FX.idx} y={128} theme={theme} id={id} />
            <CurledFinger x={FX.mid} y={126} theme={theme} id={id} />
            <CurledFinger x={FX.ring} y={128} theme={theme} id={id} />
            {/* Pinky extended */}
            <ExtendedFinger x={FX.pinky} theme={theme} id={id} highlight yBase={78} tipY={26} segH={48} />
            {/* Thumb extended outward */}
            <g transform="rotate(35, 60, 180)">
              <rect x={15} y={148} width={16} height={42} rx={8} fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
              <Joint cx={23} cy={148} r={5} theme={theme} id={id} />
              <Fingertip cx={23} cy={140} rx={8} ry={6} theme={theme} id={id} />
              <circle cx={23} cy={140} r={10} fill={theme.accent} opacity="0.15" />
            </g>
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── OK / F SHAPE ── */}
        {pose === 'ok-spread' && (
          <g>
            <PalmBase theme={theme} id={id} />
            {/* Middle, ring, pinky extended */}
            <ExtendedFinger x={FX.mid} theme={theme} id={id} yBase={68} tipY={14} />
            <ExtendedFinger x={FX.ring} theme={theme} id={id} yBase={72} tipY={18} />
            <ExtendedFinger x={FX.pinky} theme={theme} id={id} yBase={78} tipY={26} segH={48} />
            {/* Thumb + index forming circle */}
            <path d={`M 60 180 Q 42 160, 45 140 Q 50 120, 70 110 Q 85 105, 95 115 Q 102 122, 98 135`}
              fill={theme.metal} stroke={theme.outline} strokeWidth="2" />
            <path d={`M 82 125 Q 88 100, 92 90 Q 96 82, 100 90 Q 102 100, 98 120`}
              fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
            <Joint cx={52} cy={140} r={5} theme={theme} id={id} />
            <Joint cx={92} cy={115} r={4} theme={theme} id={id} />
            {/* Circle glow */}
            <circle cx={80} cy={118} r={18} fill={theme.accent} opacity="0.1" stroke={theme.accent} strokeWidth="1" strokeDasharray="3 3" />
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── HOOK / X ── */}
        {pose === 'hook' && (
          <g>
            <PalmBase theme={theme} id={id} top={130} />
            {/* Index finger hooked/bent */}
            <FingerSeg x={FX.idx - 8} y={80} w={16} h={50} theme={theme} id={id} />
            <Joint cx={FX.idx} cy={80} r={5} theme={theme} id={id} />
            <path d={`M ${FX.idx - 7} 80 Q ${FX.idx - 2} 58, ${FX.idx + 10} 55 Q ${FX.idx + 18} 55, ${FX.idx + 16} 68`}
              fill={theme.metal} stroke={theme.outline} strokeWidth="1.5" />
            <circle cx={FX.idx + 8} cy={62} r={8} fill={theme.accent} opacity="0.15" />
            <CurledFinger x={FX.mid} y={132} theme={theme} id={id} />
            <CurledFinger x={FX.ring} y={134} theme={theme} id={id} />
            <CurledFinger x={FX.pinky} y={138} theme={theme} id={id} />
            <ThumbAcross theme={theme} id={id} />
            <Wrist theme={theme} id={id} />
          </g>
        )}

        {/* ── K/P DOWN (pointing downward variants) ── */}
        {(pose === 'k-down' || pose === 'g-down') && (
          <g transform="rotate(180, 135, 170)">
            {/* Reuse upward poses but flipped */}
            <PalmBase theme={theme} id={id} />
            <ExtendedFinger x={FX.idx} theme={theme} id={id} highlight yBase={72} tipY={18} />
            {pose === 'k-down' && <ExtendedFinger x={FX.mid} theme={theme} id={id} highlight yBase={68} tipY={14} />}
            {pose === 'k-down' ? (
              <g>
                <CurledFinger x={FX.ring} y={128} theme={theme} id={id} />
                <CurledFinger x={FX.pinky} y={132} theme={theme} id={id} />
              </g>
            ) : (
              <g>
                <CurledFinger x={FX.mid} y={128} theme={theme} id={id} />
                <CurledFinger x={FX.ring} y={130} theme={theme} id={id} />
                <CurledFinger x={FX.pinky} y={132} theme={theme} id={id} />
              </g>
            )}
            <ThumbSide theme={theme} id={id} />
            <Wrist theme={theme} id={id} />
          </g>
        )}

      </g>
    </g>
  )
}
