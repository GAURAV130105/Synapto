'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { HandPose, FingerPose } from './sign-poses'
import { REST_POSE } from './sign-poses'


// ─── Hand Geometry Config ───
const SKIN_COLORS = {
  light: { base: '#F5D0B0', accent: '#E8B090', nail: '#FADADD', joint: '#D4A48A', tendon: '#E0C0A0', palm: '#F0C8A8' },
  medium: { base: '#C68642', accent: '#A0673A', nail: '#D4A07A', joint: '#8B5E3C', tendon: '#B07540', palm: '#BA7A3A' },
  dark: { base: '#6B4423', accent: '#5A3A1E', nail: '#8B6B50', joint: '#4A2E15', tendon: '#5E3820', palm: '#60401E' },
  robot: { base: '#8BA4B8', accent: '#6B8BA0', nail: '#A0B8CC', joint: '#4A6B80', tendon: '#7090A8', palm: '#7A98B0' },
} as const

export type SkinTone = keyof typeof SKIN_COLORS

// Finger segment lengths (relative)
const FINGER_LENGTHS = {
  thumb:  [0.22, 0.18, 0.14],
  index:  [0.28, 0.20, 0.16],
  middle: [0.30, 0.22, 0.17],
  ring:   [0.28, 0.20, 0.16],
  pinky:  [0.22, 0.16, 0.13],
}

// Finger base positions on the palm (x, y, z offsets from palm center)
const FINGER_BASES = {
  thumb:  [-0.32, 0.02, 0.05],
  index:  [-0.16, 0.28, 0],
  middle: [0, 0.3, 0],
  ring:   [0.16, 0.28, 0],
  pinky:  [0.3, 0.24, 0],
}

// Finger widths (radius)
const FINGER_WIDTHS = {
  thumb:  [0.045, 0.04, 0.035],
  index:  [0.04, 0.035, 0.03],
  middle: [0.042, 0.037, 0.032],
  ring:   [0.04, 0.035, 0.03],
  pinky:  [0.035, 0.03, 0.025],
}

// ─── Knuckle Component (adds ridges at joints) ───
function Knuckle({
  radius, color, jointColor,
}: {
  radius: number; color: string; jointColor: string;
}) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius * 1.2, 14, 14]} />
        <meshStandardMaterial color={jointColor} roughness={0.45} metalness={0.08} />
      </mesh>
      {/* Knuckle ridge — small torus ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[radius * 0.9, radius * 0.12, 6, 16]} />
        <meshStandardMaterial color={jointColor} roughness={0.5} metalness={0.05} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

// ─── Finger Segment Component ───
function FingerSegment({
  length, radius, color, jointColor, isProximal,
}: {
  length: number; radius: number; color: string; jointColor: string; isProximal?: boolean;
}) {
  return (
    <group>
      {/* Knuckle at joint */}
      <Knuckle radius={radius} color={color} jointColor={jointColor} />
      {/* Bone/segment */}
      <mesh position={[0, length / 2, 0]}>
        <capsuleGeometry args={[radius, length - radius * 2, 8, 14]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.04} />
      </mesh>
      {/* Subtle wrinkle lines on segments */}
      {isProximal && (
        <>
          <mesh position={[0, length * 0.3, -radius * 0.9]} rotation={[0, 0, 0]}>
            <boxGeometry args={[radius * 1.5, 0.003, 0.001]} />
            <meshStandardMaterial color={jointColor} transparent opacity={0.2} />
          </mesh>
          <mesh position={[0, length * 0.6, -radius * 0.9]} rotation={[0, 0, 0]}>
            <boxGeometry args={[radius * 1.3, 0.003, 0.001]} />
            <meshStandardMaterial color={jointColor} transparent opacity={0.15} />
          </mesh>
        </>
      )}
    </group>
  )
}

// ─── Enhanced Fingertip with realistic nail ───
function Fingertip({
  radius, color, nailColor,
}: {
  radius: number; color: string; nailColor: string;
}) {
  return (
    <group>
      {/* Fingertip pad */}
      <mesh>
        <sphereGeometry args={[radius * 1.15, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      {/* Nail base */}
      <mesh position={[0, radius * 0.35, -radius * 0.72]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[radius * 1.5, radius * 1.1, radius * 0.12]} />
        <meshStandardMaterial color={nailColor} roughness={0.25} metalness={0.25} />
      </mesh>
      {/* Nail shine highlight */}
      <mesh position={[0, radius * 0.45, -radius * 0.78]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[radius * 0.8, radius * 0.4, radius * 0.05]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.1} 
          metalness={0.5} 
          transparent 
          opacity={0.2} 
        />
      </mesh>
      {/* Cuticle (darker semi-circle at nail base) */}
      <mesh position={[0, radius * 0.05, -radius * 0.7]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[radius * 1.3, radius * 0.15, radius * 0.08]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} />
      </mesh>
    </group>
  )
}

// ─── Full Articulated Finger ───
function ArticulatedFinger({
  fingerName, pose, skinTone,
}: {
  fingerName: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky'
  pose: FingerPose
  skinTone: SkinTone
}) {
  const colors = SKIN_COLORS[skinTone]
  const lengths = FINGER_LENGTHS[fingerName]
  const widths = FINGER_WIDTHS[fingerName]
  const [bx, by, bz] = FINGER_BASES[fingerName]

  return (
    <group position={[bx, by, bz]}>
      {/* MCP joint — base rotation with curl and spread */}
      <group rotation={[
        fingerName === 'thumb' ? -pose.mcp.curl * 0.7 : -pose.mcp.curl,
        fingerName === 'thumb' ? -pose.mcp.spread : 0,
        fingerName === 'thumb' ? 0 : pose.mcp.spread,
      ]}>
        <FingerSegment
          length={lengths[0]} radius={widths[0]}
          color={colors.base} jointColor={colors.joint}
          isProximal
        />
        {/* PIP joint */}
        <group position={[0, lengths[0], 0]} rotation={[-pose.pip.curl, 0, 0]}>
          <FingerSegment
            length={lengths[1]} radius={widths[1]}
            color={colors.base} jointColor={colors.joint}
          />
          {/* DIP joint */}
          <group position={[0, lengths[1], 0]} rotation={[-pose.dip.curl, 0, 0]}>
            <FingerSegment
              length={lengths[2]} radius={widths[2]}
              color={colors.accent} jointColor={colors.joint}
            />
            {/* Fingertip */}
            <group position={[0, lengths[2], 0]}>
              <Fingertip radius={widths[2]} color={colors.accent} nailColor={colors.nail} />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

// ─── Enhanced Palm Mesh ───
function Palm({ skinTone }: { skinTone: SkinTone }) {
  const colors = SKIN_COLORS[skinTone]

  const palmShape = useMemo(() => {
    const shape = new THREE.Shape()
    // Palm outline — wider at knuckles, narrower at wrist
    shape.moveTo(-0.25, -0.15)
    shape.quadraticCurveTo(-0.3, 0.05, -0.28, 0.2)
    shape.lineTo(-0.18, 0.3)
    shape.lineTo(0.22, 0.3)
    shape.quadraticCurveTo(0.34, 0.26, 0.35, 0.15)
    shape.quadraticCurveTo(0.32, -0.05, 0.22, -0.18)
    shape.lineTo(-0.15, -0.2)
    shape.quadraticCurveTo(-0.25, -0.18, -0.25, -0.15)

    return shape
  }, [])

  const extrudeSettings = useMemo(() => ({
    depth: 0.09,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 4,
  }), [])

  return (
    <group>
      {/* Main palm body */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0.045]}>
        <extrudeGeometry args={[palmShape, extrudeSettings]} />
        <meshStandardMaterial color={colors.base} roughness={0.6} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Palm creases (life line, heart line, head line) */}
      {/* Heart line */}
      <mesh position={[0.02, 0.18, -0.01]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.38, 0.004, 0.002]} />
        <meshStandardMaterial color={colors.joint} opacity={0.25} transparent />
      </mesh>
      {/* Head line */}
      <mesh position={[-0.02, 0.1, -0.01]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.32, 0.004, 0.002]} />
        <meshStandardMaterial color={colors.joint} opacity={0.22} transparent />
      </mesh>
      {/* Life line */}
      <mesh position={[-0.12, 0.05, -0.01]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.22, 0.004, 0.002]} />
        <meshStandardMaterial color={colors.joint} opacity={0.2} transparent />
      </mesh>
      
      {/* Thenar eminence (thumb muscle pad) */}
      <mesh position={[-0.2, -0.02, 0.02]} rotation={[0, 0, -0.2]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color={colors.palm} roughness={0.65} metalness={0.02} />
      </mesh>
      
      {/* Hypothenar eminence (pinky side pad) */}
      <mesh position={[0.22, -0.02, 0.02]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color={colors.palm} roughness={0.65} metalness={0.02} />
      </mesh>
    </group>
  )
}

// ─── Enhanced Wrist/Forearm ───
function Wrist({ skinTone }: { skinTone: SkinTone }) {
  const colors = SKIN_COLORS[skinTone]
  return (
    <group position={[0, -0.28, 0.04]}>
      {/* Main wrist cylinder */}
      <mesh>
        <capsuleGeometry args={[0.12, 0.22, 10, 14]} />
        <meshStandardMaterial color={colors.base} roughness={0.65} metalness={0.02} />
      </mesh>
      {/* Wrist crease lines */}
      <mesh position={[0, 0.05, -0.12]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.003, 0.002]} />
        <meshStandardMaterial color={colors.joint} opacity={0.2} transparent />
      </mesh>
      <mesh position={[0, 0.02, -0.12]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[0.18, 0.003, 0.002]} />
        <meshStandardMaterial color={colors.joint} opacity={0.15} transparent />
      </mesh>
      {/* Subtle wrist bone bump (ulna) */}
      <mesh position={[0.11, 0.01, -0.04]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color={colors.joint} roughness={0.5} metalness={0.02} />
      </mesh>
    </group>
  )
}

// ─── MAIN 3D HAND MODEL ───
interface Hand3DModelProps {
  pose?: HandPose
  targetPose?: HandPose
  skinTone?: SkinTone
  transitionSpeed?: number
  mirror?: boolean
  scale?: number
}

export function Hand3DModel({
  pose: externalPose,
  targetPose,
  skinTone = 'light',
  transitionSpeed = 5,
  mirror = false,
  scale = 1,
}: Hand3DModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const currentPoseRef = useRef<HandPose>(externalPose || REST_POSE)
  const targetPoseRef = useRef<HandPose>(targetPose || externalPose || REST_POSE)

  // Update target when props change
  if (targetPose) {
    targetPoseRef.current = targetPose
  } else if (externalPose) {
    targetPoseRef.current = externalPose
  }

  // Smoothly interpolate toward target pose each frame
  useFrame((_, delta) => {
    const speed = transitionSpeed * delta
    const t = Math.min(1, speed)

    const lerpVal = (current: number, target: number) =>
      current + (target - current) * t

    const lerpFinger = (cur: FingerPose, tgt: FingerPose): FingerPose => ({
      mcp: {
        curl: lerpVal(cur.mcp.curl, tgt.mcp.curl),
        spread: lerpVal(cur.mcp.spread, tgt.mcp.spread),
      },
      pip: { curl: lerpVal(cur.pip.curl, tgt.pip.curl) },
      dip: { curl: lerpVal(cur.dip.curl, tgt.dip.curl) },
    })

    const cur = currentPoseRef.current
    const tgt = targetPoseRef.current

    currentPoseRef.current = {
      thumb: lerpFinger(cur.thumb, tgt.thumb),
      index: lerpFinger(cur.index, tgt.index),
      middle: lerpFinger(cur.middle, tgt.middle),
      ring: lerpFinger(cur.ring, tgt.ring),
      pinky: lerpFinger(cur.pinky, tgt.pinky),
      wrist: {
        pitch: lerpVal(cur.wrist?.pitch ?? 0, tgt.wrist?.pitch ?? 0),
        yaw: lerpVal(cur.wrist?.yaw ?? 0, tgt.wrist?.yaw ?? 0),
        roll: lerpVal(cur.wrist?.roll ?? 0, tgt.wrist?.roll ?? 0),
      },
    }

    // Apply wrist rotation to group
    if (groupRef.current) {
      const w = currentPoseRef.current.wrist!
      groupRef.current.rotation.x = w.pitch
      groupRef.current.rotation.y = w.yaw
      groupRef.current.rotation.z = w.roll
    }
  })

  const currentPose = currentPoseRef.current

  return (
    <group ref={groupRef} scale={[mirror ? -scale : scale, scale, scale]}>
      {/* Palm */}
      <Palm skinTone={skinTone} />

      {/* Wrist */}
      <Wrist skinTone={skinTone} />

      {/* Fingers */}
      {(['thumb', 'index', 'middle', 'ring', 'pinky'] as const).map(name => (
        <ArticulatedFinger
          key={name}
          fingerName={name}
          pose={currentPose[name]}
          skinTone={skinTone}
        />
      ))}
    </group>
  )
}
