'use client'

import { useRef, useMemo, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type { HandPose, FingerPose } from './sign-poses'
import { REST_POSE } from './sign-poses'
import type { FacialExpression } from './emotion-engine'
import { NEUTRAL_EXPRESSION, lerpExpression } from './emotion-engine'
import type { Viseme } from './lip-sync-engine'
import { VISEMES } from './lip-sync-engine'

/**
 * GLB-based Avatar Model using Ready Player Me skeleton.
 * Loads the avatar.glb file and animates it via bone rotations
 * driven by the HandPose sign language system.
 */

export type AvatarSkinTone = 'light' | 'medium' | 'dark' | 'robot'

// ─── Bone name map (Ready Player Me / Mixamo convention) ──────────────────────
const FINGER_BONES: Record<string, {
  mcp: string; pip: string; dip: string
}> = {
  thumb:  { mcp: 'RightHandThumb1',  pip: 'RightHandThumb2',  dip: 'RightHandThumb3'  },
  index:  { mcp: 'RightHandIndex1',  pip: 'RightHandIndex2',  dip: 'RightHandIndex3'  },
  middle: { mcp: 'RightHandMiddle1', pip: 'RightHandMiddle2', dip: 'RightHandMiddle3' },
  ring:   { mcp: 'RightHandRing1',   pip: 'RightHandRing2',   dip: 'RightHandRing3'   },
  pinky:  { mcp: 'RightHandPinky1',  pip: 'RightHandPinky2',  dip: 'RightHandPinky3'  },
}

const ARM_BONES = {
  rightArm:     'RightArm',
  rightForeArm: 'RightForeArm',
  rightHand:    'RightHand',
  spine:        'Spine',
  spine1:       'Spine1',
  spine2:       'Spine2',
  neck:         'Neck',
  head:         'Head',
}

// ─── Apply HandPose → bone rotations ─────────────────────────────────────────
function applyHandPoseToBones(
  handPose: HandPose,
  boneMap: Record<string, THREE.Bone>,
  lerpT: number
) {
  const lerp = THREE.MathUtils.lerp

  for (const [fingerName, fingerPose] of Object.entries(handPose) as [string, FingerPose][]) {
    if (fingerName === 'wrist') continue
    const bones = FINGER_BONES[fingerName]
    if (!bones) continue

    const { mcp, pip, dip } = fingerPose
    const isThumb = fingerName === 'thumb'

    const mcpBone = boneMap[bones.mcp]
    const pipBone = boneMap[bones.pip]
    const dipBone = boneMap[bones.dip]

    if (mcpBone) {
      mcpBone.rotation.x = lerp(mcpBone.rotation.x, isThumb ? -mcp.curl * 0.5 : -mcp.curl, lerpT)
      mcpBone.rotation.z = lerp(mcpBone.rotation.z, isThumb ? mcp.spread * 0.6 : -mcp.spread * 0.25, lerpT)
      if (isThumb) mcpBone.rotation.y = lerp(mcpBone.rotation.y, -mcp.spread * 0.4, lerpT)
    }
    if (pipBone) {
      pipBone.rotation.x = lerp(pipBone.rotation.x, isThumb ? -pip.curl * 0.5 : -pip.curl, lerpT)
    }
    if (dipBone) {
      dipBone.rotation.x = lerp(dipBone.rotation.x, isThumb ? -dip.curl * 0.4 : -dip.curl, lerpT)
    }
  }

  // Wrist
  const wrist = (handPose as any).wrist
  const handBone = boneMap[ARM_BONES.rightHand]
  if (handBone && wrist) {
    handBone.rotation.x = lerp(handBone.rotation.x, wrist.pitch, lerpT)
    handBone.rotation.y = lerp(handBone.rotation.y, wrist.yaw * 0.5, lerpT)
    handBone.rotation.z = lerp(handBone.rotation.z, wrist.roll, lerpT)
  }
}

// ─── Build bone map from scene ────────────────────────────────────────────────
function buildBoneMap(scene: THREE.Object3D): Record<string, THREE.Bone> {
  const map: Record<string, THREE.Bone> = {}
  scene.traverse((obj) => {
    if ((obj as THREE.Bone).isBone) {
      map[obj.name] = obj as THREE.Bone
    }
  })
  return map
}

// ─── Skin tone color overlay ──────────────────────────────────────────────────
const SKIN_OVERLAYS: Record<AvatarSkinTone, number | null> = {
  light:  null,            // use model's native colors
  medium: 0xC68642,
  dark:   0x5A3A1E,
  robot:  0x8BA4B8,
}

// ─── Main Avatar Model ────────────────────────────────────────────────────────
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
  const boneMapRef = useRef<Record<string, THREE.Bone>>({})
  const currentPoseRef = useRef<HandPose>(REST_POSE)
  const swayRef = useRef(0)
  const initDoneRef = useRef(false)
  const initialRightArmRef = useRef<{ x: number; y: number; z: number } | null>(null)
  const initialRightForeRef = useRef<{ x: number; y: number; z: number } | null>(null)

  // Load the Ready Player Me GLB
  const { scene } = useGLTF('/models/avatar.glb')

  // Clone scene so multiple instances don't conflict
  const clonedScene = useMemo(() => scene.clone(true), [scene])

  // Build bone map on mount
  useEffect(() => {
    if (initDoneRef.current) return
    initDoneRef.current = true

    const bMap = buildBoneMap(clonedScene)
    boneMapRef.current = bMap

    // Apply skin tone overlay
    const overlay = SKIN_OVERLAYS[skinTone]
    if (overlay !== null) {
      clonedScene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          mats.forEach((m: THREE.Material) => {
            if (m && (m as THREE.MeshStandardMaterial).color &&
                m.name?.toLowerCase().includes('skin')) {
              ;(m as THREE.MeshStandardMaterial).color.setHex(overlay)
            }
          })
        }
      })
    }

    // Make the model cast shadows
    clonedScene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })

    // Store initial arm pose so we can drive from it
    const rArm = bMap[ARM_BONES.rightArm]
    const rFore = bMap[ARM_BONES.rightForeArm]
    if (rArm) initialRightArmRef.current = { x: rArm.rotation.x, y: rArm.rotation.y, z: rArm.rotation.z }
    if (rFore) initialRightForeRef.current = { x: rFore.rotation.x, y: rFore.rotation.y, z: rFore.rotation.z }

  }, [clonedScene, skinTone])

  // Add cloned scene to group
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.add(clonedScene)
    }
    return () => {
      if (groupRef.current) groupRef.current.remove(clonedScene)
    }
  }, [clonedScene])

  useFrame((_, delta) => {
    const lerpT = Math.min(1, delta * 5)
    const lerp = THREE.MathUtils.lerp
    const bMap = boneMapRef.current

    // ── Raise/position right arm for signing ──
    const rArm = bMap[ARM_BONES.rightArm]
    const rFore = bMap[ARM_BONES.rightForeArm]
    if (rArm) {
      // Raise arm to signing position (forearm parallel to ground, ~90° elbow)
      rArm.rotation.x = lerp(rArm.rotation.x, -0.5, lerpT)
      rArm.rotation.z = lerp(rArm.rotation.z, -0.4, lerpT)
      rArm.rotation.y = lerp(rArm.rotation.y, 0.2, lerpT)
    }
    if (rFore) {
      // Forearm bent upward for signing at chest/face height
      rFore.rotation.x = lerp(rFore.rotation.x, -1.1, lerpT)
      rFore.rotation.z = lerp(rFore.rotation.z, 0.1, lerpT)
    }

    // ── Apply finger / wrist animations ──
    applyHandPoseToBones(handPose, bMap, lerpT)

    // ── Subtle idle body sway ──
    if (bodySwayEnabled) {
      swayRef.current += delta
      if (groupRef.current) {
        groupRef.current.rotation.y = Math.sin(swayRef.current * 0.4) * 0.02
      }
      const spine = bMap[ARM_BONES.spine]
      if (spine) {
        spine.rotation.z = Math.sin(swayRef.current * 0.5) * 0.012
      }
    }

    // ── Head micro-movements ──
    const head = bMap[ARM_BONES.head]
    if (head) {
      head.rotation.x = lerp(head.rotation.x, headTilt.x + Math.sin(swayRef.current * 1.2) * 0.008, lerpT)
      head.rotation.y = lerp(head.rotation.y, headTilt.y + Math.sin(swayRef.current * 0.9) * 0.012, lerpT)
      head.rotation.z = lerp(head.rotation.z, headTilt.z, lerpT)
    }
  })

  return <group ref={groupRef} />
}

// Preload the model
useGLTF.preload('/models/avatar.glb')
