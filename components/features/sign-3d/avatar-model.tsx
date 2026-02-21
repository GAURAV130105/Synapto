'use client'

import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { HandPose, FingerPose } from './sign-poses'
import { REST_POSE } from './sign-poses'
import type { FacialExpression } from './emotion-engine'
import { NEUTRAL_EXPRESSION, lerpExpression } from './emotion-engine'
import type { Viseme } from './lip-sync-engine'
import { VISEMES } from './lip-sync-engine'

/**
 * Full 3D Upper-Body Avatar Model
 * Procedurally generated with:
 * - Head with facial features (eyes, eyebrows, nose, mouth, ears)
 * - Neck with natural connection to torso
 * - Torso (chest, shoulders)
 * - Arms (upper arm, forearm, connected to hands)
 * - Existing articulated Hand3DModel
 * - Lip sync mouth shapes
 * - Emotional facial expressions
 */

// ─── Skin / Material Config ───
const AVATAR_COLORS = {
  light: {
    skin: '#F5D0B0', skinDark: '#E8B090', lip: '#CC8080', eyeWhite: '#FAF8F5',
    iris: '#5B8CA0', pupil: '#1A1A1A', browHair: '#4A3520', hair: '#3A2515',
    shirt: '#4A6FA5', shirtAccent: '#3B5C8A', teeth: '#F5F0E8',
  },
  medium: {
    skin: '#C68642', skinDark: '#A0673A', lip: '#A05050', eyeWhite: '#FAF5EE',
    iris: '#4A3020', pupil: '#0A0A0A', browHair: '#2A1810', hair: '#1A0A05',
    shirt: '#5A4A3A', shirtAccent: '#4A3A2A', teeth: '#F0EBE0',
  },
  dark: {
    skin: '#6B4423', skinDark: '#5A3A1E', lip: '#7A4040', eyeWhite: '#F5F0E8',
    iris: '#2A1810', pupil: '#050505', browHair: '#1A0A05', hair: '#0A0500',
    shirt: '#3A4A5A', shirtAccent: '#2A3A4A', teeth: '#EBE5DA',
  },
  robot: {
    skin: '#8BA4B8', skinDark: '#6B8BA0', lip: '#7A90A0', eyeWhite: '#D0E8F5',
    iris: '#00D4FF', pupil: '#001A2A', browHair: '#4A6070', hair: '#3A5060',
    shirt: '#4A5A6A', shirtAccent: '#3A4A5A', teeth: '#C0D0E0',
  },
} as const

export type AvatarSkinTone = keyof typeof AVATAR_COLORS

// ─── Eye Component ───
function Eye({
  position, colors, expression, side,
}: {
  position: [number, number, number]
  colors: typeof AVATAR_COLORS.light
  expression: FacialExpression
  side: 'left' | 'right'
}) {
  const eyeOpen = side === 'left' ? expression.eyeOpenLeft : expression.eyeOpenRight
  const blinkScale = Math.max(0.05, Math.min(1.5, eyeOpen))

  return (
    <group position={position}>
      {/* Eye socket shadow */}
      <mesh position={[0, 0, -0.005]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color={colors.skinDark} roughness={0.7} />
      </mesh>
      {/* Eye white (sclera) */}
      <group scale={[1, blinkScale, 1]}>
        <mesh>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color={colors.eyeWhite} roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Iris */}
        <mesh position={[expression.eyeLookX * 0.015, expression.eyeLookY * 0.01, 0.035]}>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshStandardMaterial color={colors.iris} roughness={0.2} metalness={0.15} />
        </mesh>
        {/* Pupil */}
        <mesh position={[expression.eyeLookX * 0.015, expression.eyeLookY * 0.01, 0.048]}>
          <sphereGeometry args={[0.014 * expression.pupilDilation, 12, 12]} />
          <meshStandardMaterial color={colors.pupil} roughness={0.1} metalness={0} />
        </mesh>
        {/* Eye shine */}
        <mesh position={[expression.eyeLookX * 0.015 + 0.01, expression.eyeLookY * 0.01 + 0.01, 0.052]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} roughness={0} metalness={1} />
        </mesh>
      </group>
      {/* Eyelid (top) */}
      <mesh position={[0, 0.035 * blinkScale, 0.025]} scale={[1, 1 - blinkScale * 0.3, 1]}>
        <sphereGeometry args={[0.058, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        <meshStandardMaterial color={colors.skin} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Eyelash line */}
      <mesh position={[0, 0.04 * blinkScale, 0.035]}>
        <boxGeometry args={[0.1, 0.004, 0.01]} />
        <meshStandardMaterial color={colors.browHair} roughness={0.4} />
      </mesh>
    </group>
  )
}

// ─── Eyebrow Component ───
function Eyebrow({
  position, colors, height, angle, side,
}: {
  position: [number, number, number]
  colors: typeof AVATAR_COLORS.light
  height: number
  angle: number
  side: 'left' | 'right'
}) {
  const xFlip = side === 'left' ? -1 : 1
  return (
    <group position={[position[0], position[1] + height * 0.03, position[2]]}>
      <mesh rotation={[0, 0, angle * 0.3 * xFlip]}>
        <capsuleGeometry args={[0.008, 0.06, 6, 8]} />
        <meshStandardMaterial color={colors.browHair} roughness={0.6} />
      </mesh>
      {/* Brow arch */}
      <mesh position={[0.02 * xFlip, 0.005, 0]} rotation={[0, 0, (angle * 0.2 + 0.3) * xFlip]}>
        <capsuleGeometry args={[0.006, 0.03, 6, 8]} />
        <meshStandardMaterial color={colors.browHair} roughness={0.6} />
      </mesh>
    </group>
  )
}

// ─── Mouth Component with Lip Sync ───
function Mouth({
  position, colors, expression, viseme,
}: {
  position: [number, number, number]
  colors: typeof AVATAR_COLORS.light
  expression: FacialExpression
  viseme: Viseme
}) {
  // Combine expression mouth params with viseme
  const mouthOpen = Math.max(expression.mouthOpen, viseme.mouthOpen)
  const mouthWidth = expression.mouthWidth * viseme.mouthWidth
  const smile = expression.mouthSmile
  const jawOpen = Math.max(expression.jawOpen, viseme.jawOpen)
  const lipRound = viseme.lipRound

  return (
    <group position={position}>
      {/* Lip area base */}
      <mesh position={[0, -jawOpen * 0.02, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={colors.skinDark} roughness={0.6} />
      </mesh>

      {/* Upper lip */}
      <mesh
        position={[0, 0.01 + smile * 0.008, 0.03]}
        scale={[mouthWidth * (1 - lipRound * 0.3), 1, 1]}
      >
        <capsuleGeometry args={[0.008, 0.04 * mouthWidth, 6, 8]} />
        <meshStandardMaterial color={colors.lip} roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Lower lip */}
      <mesh
        position={[0, -0.012 - jawOpen * 0.02 - smile * 0.005, 0.028]}
        scale={[mouthWidth * (1 - lipRound * 0.3), 1, 1]}
      >
        <capsuleGeometry args={[0.009, 0.035 * mouthWidth, 6, 8]} />
        <meshStandardMaterial color={colors.lip} roughness={0.35} metalness={0.05} />
      </mesh>

      {/* Mouth opening (dark interior) */}
      {mouthOpen > 0.05 && (
        <mesh position={[0, -0.003 - jawOpen * 0.01, 0.025]}>
          <planeGeometry args={[0.035 * mouthWidth * (1 - lipRound * 0.3), 0.015 * mouthOpen * 3 + jawOpen * 0.02]} />
          <meshStandardMaterial color="#2A1010" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Teeth (visible when mouth open) */}
      {mouthOpen > 0.15 && (
        <>
          {/* Upper teeth */}
          <mesh position={[0, 0.005, 0.022]}>
            <boxGeometry args={[0.03 * mouthWidth, 0.006, 0.008]} />
            <meshStandardMaterial color={colors.teeth} roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Lower teeth */}
          <mesh position={[0, -0.012 - jawOpen * 0.015, 0.022]}>
            <boxGeometry args={[0.025 * mouthWidth, 0.005, 0.007]} />
            <meshStandardMaterial color={colors.teeth} roughness={0.2} metalness={0.1} />
          </mesh>
        </>
      )}

      {/* Tongue (visible when mouth more open) */}
      {(mouthOpen > 0.3 || viseme.tongueOut > 0) && (
        <mesh position={[0, -0.008 - jawOpen * 0.01, 0.02 + viseme.tongueOut * 0.015]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#CC6666" roughness={0.5} />
        </mesh>
      )}

      {/* Smile creases (nasolabial folds) */}
      {smile > 0.3 && (
        <>
          <mesh position={[-0.035, 0.015, 0.015]} rotation={[0, 0.2, 0.3]}>
            <boxGeometry args={[0.003, 0.025, 0.002]} />
            <meshStandardMaterial color={colors.skinDark} transparent opacity={smile * 0.3} />
          </mesh>
          <mesh position={[0.035, 0.015, 0.015]} rotation={[0, -0.2, -0.3]}>
            <boxGeometry args={[0.003, 0.025, 0.002]} />
            <meshStandardMaterial color={colors.skinDark} transparent opacity={smile * 0.3} />
          </mesh>
        </>
      )}
    </group>
  )
}

// ─── Nose Component ───
function Nose({ position, colors }: { position: [number, number, number]; colors: typeof AVATAR_COLORS.light }) {
  return (
    <group position={position}>
      {/* Nose bridge */}
      <mesh>
        <capsuleGeometry args={[0.012, 0.03, 6, 8]} />
        <meshStandardMaterial color={colors.skin} roughness={0.55} />
      </mesh>
      {/* Nose tip */}
      <mesh position={[0, -0.02, 0.015]}>
        <sphereGeometry args={[0.018, 10, 10]} />
        <meshStandardMaterial color={colors.skin} roughness={0.5} />
      </mesh>
      {/* Nostrils */}
      <mesh position={[-0.012, -0.025, 0.008]}>
        <sphereGeometry args={[0.006, 6, 6]} />
        <meshStandardMaterial color={colors.skinDark} roughness={0.7} />
      </mesh>
      <mesh position={[0.012, -0.025, 0.008]}>
        <sphereGeometry args={[0.006, 6, 6]} />
        <meshStandardMaterial color={colors.skinDark} roughness={0.7} />
      </mesh>
    </group>
  )
}

// ─── Ear Component ───
function Ear({ position, colors, side }: { position: [number, number, number]; colors: typeof AVATAR_COLORS.light; side: 'left' | 'right' }) {
  const xFlip = side === 'left' ? -1 : 1
  return (
    <group position={position}>
      {/* Outer ear */}
      <mesh rotation={[0, xFlip * 0.3, 0]}>
        <capsuleGeometry args={[0.02, 0.04, 6, 8]} />
        <meshStandardMaterial color={colors.skin} roughness={0.55} />
      </mesh>
      {/* Inner ear */}
      <mesh position={[xFlip * -0.005, 0, 0.005]} rotation={[0, xFlip * 0.3, 0]}>
        <capsuleGeometry args={[0.012, 0.025, 6, 8]} />
        <meshStandardMaterial color={colors.skinDark} roughness={0.6} />
      </mesh>
    </group>
  )
}

// ─── Head Component ───
function Head({
  colors, expression, viseme,
}: {
  colors: typeof AVATAR_COLORS.light
  expression: FacialExpression
  viseme: Viseme
}) {
  return (
    <group>
      {/* Cranium */}
      <mesh>
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshStandardMaterial color={colors.skin} roughness={0.55} metalness={0.02} />
      </mesh>

      {/* Hair (top part) */}
      <mesh position={[0, 0.06, -0.02]}>
        <sphereGeometry args={[0.145, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={colors.hair} roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Hair sides */}
      <mesh position={[-0.1, 0.04, -0.04]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color={colors.hair} roughness={0.7} />
      </mesh>
      <mesh position={[0.1, 0.04, -0.04]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color={colors.hair} roughness={0.7} />
      </mesh>

      {/* Face (front plate - slightly flatter) */}
      <mesh position={[0, -0.02, 0.04]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={colors.skin} roughness={0.5} />
      </mesh>

      {/* Chin */}
      <mesh position={[0, -0.12, 0.04]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color={colors.skin} roughness={0.55} />
      </mesh>

      {/* Jaw (moves with expression) */}
      <group position={[0, -0.09 - expression.jawOpen * 0.015, 0.02]}>
        <mesh>
          <capsuleGeometry args={[0.06, 0.02, 8, 10]} />
          <meshStandardMaterial color={colors.skin} roughness={0.55} />
        </mesh>
      </group>

      {/* Eyes */}
      <Eye position={[-0.045, 0.01, 0.1]} colors={colors} expression={expression} side="left" />
      <Eye position={[0.045, 0.01, 0.1]} colors={colors} expression={expression} side="right" />

      {/* Eyebrows */}
      <Eyebrow
        position={[-0.045, 0.065, 0.1]}
        colors={colors}
        height={expression.browLeftHeight}
        angle={expression.browLeftAngle}
        side="left"
      />
      <Eyebrow
        position={[0.045, 0.065, 0.1]}
        colors={colors}
        height={expression.browRightHeight}
        angle={expression.browRightAngle}
        side="right"
      />

      {/* Nose */}
      <Nose position={[0, -0.02, 0.13]} colors={colors} />

      {/* Mouth */}
      <Mouth
        position={[0, -0.065, 0.1]}
        colors={colors}
        expression={expression}
        viseme={viseme}
      />

      {/* Ears */}
      <Ear position={[-0.135, 0, 0]} colors={colors} side="left" />
      <Ear position={[0.135, 0, 0]} colors={colors} side="right" />

      {/* Cheek blush */}
      {expression.blushIntensity > 0 && (
        <>
          <mesh position={[-0.07, -0.03, 0.1]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#FF8888" transparent opacity={expression.blushIntensity * 0.25} roughness={0.6} />
          </mesh>
          <mesh position={[0.07, -0.03, 0.1]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#FF8888" transparent opacity={expression.blushIntensity * 0.25} roughness={0.6} />
          </mesh>
        </>
      )}
    </group>
  )
}

// ─── Neck ───
function Neck({ colors }: { colors: typeof AVATAR_COLORS.light }) {
  return (
    <group position={[0, -0.2, 0]}>
      <mesh>
        <capsuleGeometry args={[0.04, 0.08, 8, 10]} />
        <meshStandardMaterial color={colors.skin} roughness={0.55} />
      </mesh>
      {/* Adam's apple subtle detail */}
      <mesh position={[0, 0, 0.035]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshStandardMaterial color={colors.skin} roughness={0.5} />
      </mesh>
    </group>
  )
}

// ─── Torso ───
function Torso({ colors }: { colors: typeof AVATAR_COLORS.light }) {
  const torsoShape = useMemo(() => {
    const shape = new THREE.Shape()
    // Torso outline — shoulders to waist
    shape.moveTo(-0.18, 0.15)
    shape.quadraticCurveTo(-0.2, 0.1, -0.2, 0)
    shape.quadraticCurveTo(-0.18, -0.15, -0.12, -0.22)
    shape.lineTo(0.12, -0.22)
    shape.quadraticCurveTo(0.18, -0.15, 0.2, 0)
    shape.quadraticCurveTo(0.2, 0.1, 0.18, 0.15)
    shape.lineTo(-0.18, 0.15)
    return shape
  }, [])

  return (
    <group position={[0, -0.5, 0]}>
      {/* Main torso */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.04]}>
        <extrudeGeometry args={[torsoShape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 }]} />
        <meshStandardMaterial color={colors.shirt} roughness={0.7} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>

      {/* Collar / Neckline */}
      <mesh position={[0, 0.15, 0.05]}>
        <torusGeometry args={[0.05, 0.012, 6, 16, Math.PI]} />
        <meshStandardMaterial color={colors.shirtAccent} roughness={0.6} />
      </mesh>

      {/* Shoulder pads (rounded) */}
      <mesh position={[-0.2, 0.1, 0.04]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color={colors.shirt} roughness={0.65} />
      </mesh>
      <mesh position={[0.2, 0.1, 0.04]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color={colors.shirt} roughness={0.65} />
      </mesh>
    </group>
  )
}

// ─── Arm Segment ───
function ArmSegment({
  position, length, radius, color, rotation,
}: {
  position: [number, number, number]
  length: number
  radius: number
  color: string
  rotation?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* Joint */}
      <mesh>
        <sphereGeometry args={[radius * 1.2, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      {/* Segment */}
      <mesh position={[0, -length / 2, 0]}>
        <capsuleGeometry args={[radius, length - radius * 2, 8, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

// ─── Full Arm with Hand ───
function Arm({
  side, colors, handPose, skinTone, fingerColors,
}: {
  side: 'left' | 'right'
  colors: typeof AVATAR_COLORS.light
  handPose: HandPose
  skinTone: AvatarSkinTone
  fingerColors: { base: string; accent: string; nail: string; joint: string }
}) {
  const xPos = side === 'left' ? -0.25 : 0.25
  const shoulderAngle = side === 'left' ? 0.15 : -0.15

  // Import Hand3DModel dynamically to avoid circular dependency
  const { Hand3DModel } = require('./hand-3d-model')

  return (
    <group position={[xPos, -0.42, 0.04]}>
      {/* Upper arm */}
      <ArmSegment
        position={[0, 0, 0]}
        length={0.18}
        radius={0.035}
        color={colors.shirt}
        rotation={[shoulderAngle, 0, side === 'left' ? -0.2 : 0.2]}
      />
      {/* Forearm */}
      <group position={[side === 'left' ? -0.04 : 0.04, -0.18, 0]}>
        <ArmSegment
          position={[0, 0, 0]}
          length={0.16}
          radius={0.03}
          color={colors.skin}
        />
        {/* Hand */}
        <group position={[0, -0.2, 0]} scale={[0.9, 0.9, 0.9]}>
          <Hand3DModel
            targetPose={handPose}
            skinTone={skinTone}
            transitionSpeed={6}
            mirror={side === 'left'}
            scale={1}
          />
        </group>
      </group>
    </group>
  )
}

// ─── MAIN AVATAR MODEL ───
export interface AvatarModelProps {
  handPose?: HandPose
  skinTone?: AvatarSkinTone
  expression?: FacialExpression
  viseme?: Viseme
  headTilt?: { x: number; y: number; z: number }
  bodySwayEnabled?: boolean
}

export function AvatarModel({
  handPose = REST_POSE,
  skinTone = 'medium',
  expression = NEUTRAL_EXPRESSION,
  viseme = VISEMES.rest,
  headTilt = { x: 0, y: 0, z: 0 },
  bodySwayEnabled = true,
}: AvatarModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const currentExpRef = useRef<FacialExpression>(expression)
  const currentVisemeRef = useRef<Viseme>(viseme)
  const blinkTimerRef = useRef<number>(0)
  const blinkStateRef = useRef<number>(1) // 1=open, 0=closed
  const swayTimeRef = useRef<number>(0)

  // Smooth expression transitions
  useFrame((_, delta) => {
    const t = Math.min(1, delta * 4)
    currentExpRef.current = lerpExpression(currentExpRef.current, expression, t)

    // Natural blinking
    blinkTimerRef.current += delta
    if (blinkTimerRef.current > 3 + Math.random() * 2) {
      blinkTimerRef.current = 0
      blinkStateRef.current = 0 // trigger blink
    }
    if (blinkStateRef.current < 1) {
      blinkStateRef.current = Math.min(1, blinkStateRef.current + delta * 8)
    }
    // Apply blink to expression
    const blinkMod = blinkStateRef.current
    currentExpRef.current.eyeOpenLeft *= blinkMod
    currentExpRef.current.eyeOpenRight *= blinkMod

    // Subtle body sway
    if (bodySwayEnabled && groupRef.current) {
      swayTimeRef.current += delta
      groupRef.current.rotation.z = Math.sin(swayTimeRef.current * 0.5) * 0.015
      groupRef.current.position.y = Math.sin(swayTimeRef.current * 0.8) * 0.003
    }

    // Head micro-movements
    if (headRef.current) {
      headRef.current.rotation.x = headTilt.x + Math.sin(swayTimeRef.current * 1.2) * 0.01
      headRef.current.rotation.y = headTilt.y + Math.sin(swayTimeRef.current * 0.9) * 0.015
      headRef.current.rotation.z = headTilt.z
    }
  })

  const colors = AVATAR_COLORS[skinTone]
  const SKIN_COLORS_MAP = {
    light: { base: '#F5D0B0', accent: '#E8B090', nail: '#FADADD', joint: '#D4A48A' },
    medium: { base: '#C68642', accent: '#A0673A', nail: '#D4A07A', joint: '#8B5E3C' },
    dark: { base: '#6B4423', accent: '#5A3A1E', nail: '#8B6B50', joint: '#4A2E15' },
    robot: { base: '#8BA4B8', accent: '#6B8BA0', nail: '#A0B8CC', joint: '#4A6B80' },
  }

  return (
    <group ref={groupRef}>
      {/* Head */}
      <group ref={headRef} position={[0, 0.15, 0]}>
        <Head
          colors={colors}
          expression={currentExpRef.current}
          viseme={currentVisemeRef.current}
        />
      </group>

      {/* Neck */}
      <Neck colors={colors} />

      {/* Torso */}
      <Torso colors={colors} />

      {/* Arms */}
      <Arm
        side="right"
        colors={colors}
        handPose={handPose}
        skinTone={skinTone}
        fingerColors={SKIN_COLORS_MAP[skinTone]}
      />
      <Arm
        side="left"
        colors={colors}
        handPose={handPose}
        skinTone={skinTone}
        fingerColors={SKIN_COLORS_MAP[skinTone]}
      />
    </group>
  )
}
