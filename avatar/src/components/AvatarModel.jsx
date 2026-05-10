/**
 * ProceduralAvatarModel — v2
 *
 * A fully connected cartoon avatar built from Three.js primitives.
 * Body parts are sized and positioned so they visually *touch* each joint,
 * giving a single continuous character (no floating pieces).
 *
 * Bone names follow the Ready Player Me / Mixamo humanoid convention so
 * the existing poseDatabase.js + animationPlayer.js work without any changes.
 *
 * Initial pose: natural A-pose (arms ~35° down from horizontal).
 */

import { useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSignAnimation } from '../hooks/useSignAnimation'

// ─── Palette ──────────────────────────────────────────────────────────────────
const HEX = {
  skin    : 0xF5CBA7,
  skinDk  : 0xE59866,
  hair    : 0x2E1503,
  shirt   : 0x1C2833,   // dark navy
  pants   : 0x17202A,
  shoe    : 0x2C3E50,
  eye     : 0x1A1A2E,
  gogFrame: 0x1A1A1A,
  gogLens : 0x76D7EA,
  mouth   : 0xC0392B,
}

// ─── Material factory (cached) ────────────────────────────────────────────────
const cache = {}
function M(hex, rough = 0.75, metal = 0) {
  const key = `${hex}-${rough}-${metal}`
  if (!cache[key]) {
    cache[key] = new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal })
  }
  return cache[key]
}
const LENS_MAT = new THREE.MeshStandardMaterial({
  color: HEX.gogLens, roughness: 0.1, metalness: 0.1,
  transparent: true, opacity: 0.75,
})

// ─── Geometry helpers ─────────────────────────────────────────────────────────
const cap  = (r, h) => new THREE.CapsuleGeometry(r, h, 8, 16)
const sph  = (r)    => new THREE.SphereGeometry(r, 20, 16)
const cyl  = (rt, rb, h, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s)
const tor  = (r, t, rs = 6, ts = 16) => new THREE.TorusGeometry(r, t, rs, ts)
const circ = (r)    => new THREE.CircleGeometry(r, 16)

/** Attach a mesh to a parent group/bone */
function mesh(parent, geo, mat, px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat)
  m.position.set(px, py, pz)
  m.rotation.set(rx, ry, rz)
  m.castShadow = true
  m.receiveShadow = true
  parent.add(m)
  return m
}

/** Create a named Bone, register it, attach to parent */
function bone(name, parent, px, py, pz, bMap, bArr) {
  const b = new THREE.Bone()
  b.name = name
  b.position.set(px, py, pz)
  parent.add(b)
  bMap[name] = b
  bArr.push(b)
  return b
}

// ─── avatar builder ───────────────────────────────────────────────────────────
function buildAvatar() {
  const root = new THREE.Group()
  const bArr = []
  const bMap = {}
  const B = (name, parent, px, py, pz) => bone(name, parent, px, py, pz, bMap, bArr)

  /* ══════════════  SKELETON  ══════════════ */
  // Root sits at y = 0, we offset the whole group later
  const hips   = B('Hips',    root,   0,  0,    0)
  const spine  = B('Spine',   hips,   0,  0.20, 0)
  const spine1 = B('Spine1',  spine,  0,  0.20, 0)
  const neck   = B('Neck',    spine1, 0,  0.24, 0)
  const head   = B('Head',    neck,   0,  0.12, 0)

  // Right arm  (in local space of spine1; x > 0 is viewer's left / character's right)
  const rShou  = B('RightShoulder', spine1,  0.20,  0.18, 0)
  const rArm   = B('RightArm',      rShou,   0.18,  0,    0)
  const rFore  = B('RightForeArm',  rArm,    0.24,  0,    0)
  const rHand  = B('RightHand',     rFore,   0.22,  0,    0)
  // Thumb
  const rTh1   = B('RightHandThumb1',  rHand, 0.04, 0.00,  0.035)
  const rTh2   = B('RightHandThumb2',  rTh1,  0,    0.045, 0)
  B('RightHandThumb3',  rTh2,  0, 0.035, 0)
  // Index
  const rIn1   = B('RightHandIndex1',  rHand, 0.00, 0.075, 0.025)
  const rIn2   = B('RightHandIndex2',  rIn1,  0,    0.040, 0)
  B('RightHandIndex3',  rIn2,  0, 0.030, 0)
  // Middle
  const rMi1   = B('RightHandMiddle1', rHand, 0.00, 0.075, 0.000)
  const rMi2   = B('RightHandMiddle2', rMi1,  0,    0.040, 0)
  B('RightHandMiddle3', rMi2,  0, 0.030, 0)
  // Ring
  const rRi1   = B('RightHandRing1',   rHand, 0.00, 0.070, -0.025)
  const rRi2   = B('RightHandRing2',   rRi1,  0,    0.038, 0)
  B('RightHandRing3',   rRi2,  0, 0.028, 0)
  // Pinky
  const rPi1   = B('RightHandPinky1',  rHand, -0.01, 0.062, -0.040)
  const rPi2   = B('RightHandPinky2',  rPi1,  0,     0.032, 0)
  B('RightHandPinky3',  rPi2,  0, 0.024, 0)

  // Left arm (mirror on x)
  const lShou  = B('LeftShoulder', spine1, -0.20,  0.18, 0)
  const lArm   = B('LeftArm',      lShou,  -0.18,  0,    0)
  const lFore  = B('LeftForeArm',  lArm,   -0.24,  0,    0)
  const lHand  = B('LeftHand',     lFore,  -0.22,  0,    0)
  const lTh1   = B('LeftHandThumb1',  lHand, -0.04, 0.00,  0.035)
  const lTh2   = B('LeftHandThumb2',  lTh1,  0,    -0.045, 0)
  B('LeftHandThumb3',  lTh2,  0,-0.035,0)
  const lIn1   = B('LeftHandIndex1',  lHand,  0.00,-0.075, 0.025)
  const lIn2   = B('LeftHandIndex2',  lIn1,   0,   -0.040, 0)
  B('LeftHandIndex3',  lIn2,  0,-0.030,0)
  const lMi1   = B('LeftHandMiddle1', lHand,  0.00,-0.075, 0.000)
  const lMi2   = B('LeftHandMiddle2', lMi1,   0,   -0.040, 0)
  B('LeftHandMiddle3', lMi2,  0,-0.030,0)
  const lRi1   = B('LeftHandRing1',   lHand,  0.00,-0.070,-0.025)
  const lRi2   = B('LeftHandRing2',   lRi1,   0,   -0.038, 0)
  B('LeftHandRing3',   lRi2,  0,-0.028,0)
  const lPi1   = B('LeftHandPinky1',  lHand,  0.01,-0.062,-0.040)
  const lPi2   = B('LeftHandPinky2',  lPi1,   0,   -0.032, 0)
  B('LeftHandPinky3',  lPi2,  0,-0.024,0)

  // Legs
  const rUpLeg = B('RightUpLeg', hips,  0.11, -0.10, 0)
  const rLeg   = B('RightLeg',   rUpLeg, 0,   -0.32, 0)
  B('RightFoot', rLeg, 0, -0.28, 0)
  const lUpLeg = B('LeftUpLeg',  hips, -0.11, -0.10, 0)
  const lLeg   = B('LeftLeg',    lUpLeg, 0,   -0.32, 0)
  B('LeftFoot',  lLeg, 0, -0.28, 0)

  /* ══════════════  INITIAL POSE (A-pose)  ══════════════ */
  // Arms angled down ~35° so they rest at the sides, not horizontal
  rArm.rotation.z  =  0.60   //  tilt arm downward
  lArm.rotation.z  = -0.60
  // Shoulders rolled slightly inward
  rShou.rotation.z =  0.15
  lShou.rotation.z = -0.15

  /* ══════════════  GEOMETRY  ══════════════ */
  // ── Torso ──
  // Upper body (shirt)
  mesh(spine1, cap(0.155, 0.18), M(HEX.shirt), 0, 0.09, 0)
  // Abdomen
  mesh(spine,  cap(0.140, 0.08), M(HEX.shirt), 0, 0.04, 0)
  // Pelvis / waist
  mesh(hips,   cap(0.155, 0.08), M(HEX.shirt), 0, 0.05, 0)

  // ── Neck ──
  mesh(neck, cap(0.055, 0.06), M(HEX.skin), 0, 0.05, 0)

  // ── Head ──
  // Main head sphere
  mesh(head, sph(0.175),  M(HEX.skin), 0, 0.175, 0)
  // Hair dome (top half sphere)
  const hairGeo = new THREE.SphereGeometry(0.180, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.52)
  mesh(head, hairGeo, M(HEX.hair), 0, 0.175, 0)
  // Eyes
  mesh(head, sph(0.030), M(HEX.eye),   0.072, 0.20,  0.155)
  mesh(head, sph(0.030), M(HEX.eye),  -0.072, 0.20,  0.155)
  // Eye whites
  mesh(head, sph(0.042), M(0xFFFFFF),  0.072, 0.20,  0.145)
  mesh(head, sph(0.042), M(0xFFFFFF), -0.072, 0.20,  0.145)
  // Goggles frames
  mesh(head, tor(0.058, 0.012, 6, 12), M(HEX.gogFrame),  0.072, 0.20, 0.155)
  mesh(head, tor(0.058, 0.012, 6, 12), M(HEX.gogFrame), -0.072, 0.20, 0.155)
  // Goggle bridge bar
  mesh(head, new THREE.BoxGeometry(0.028, 0.014, 0.014), M(HEX.gogFrame), 0, 0.20, 0.162)
  // Goggle lenses (tinted circles)
  mesh(head, circ(0.048), LENS_MAT,  0.072, 0.20, 0.160)
  mesh(head, circ(0.048), LENS_MAT, -0.072, 0.20, 0.160)
  // Nose bump
  mesh(head, sph(0.022), M(HEX.skin),  0, 0.170, 0.168)
  // Mouth line
  mesh(head, new THREE.BoxGeometry(0.050, 0.008, 0.006), M(HEX.mouth), 0, 0.145, 0.165)

  // ── Shoulder caps ──
  mesh(rShou, sph(0.075), M(HEX.skin))
  mesh(lShou, sph(0.075), M(HEX.skin))

  // ── Arms — capsule runs from this bone toward the next ──
  // Upper arm: offset 0.12 along x in bone local space; length 0.22
  mesh(rArm,  cap(0.065, 0.18), M(HEX.skin), 0.12, 0, 0, 0, 0, Math.PI/2)
  mesh(lArm,  cap(0.065, 0.18), M(HEX.skin),-0.12, 0, 0, 0, 0, Math.PI/2)
  // Forearm
  mesh(rFore, cap(0.055, 0.15), M(HEX.skin), 0.11, 0, 0, 0, 0, Math.PI/2)
  mesh(lFore, cap(0.055, 0.15), M(HEX.skin),-0.11, 0, 0, 0, 0, Math.PI/2)

  // ── Hands ──
  mesh(rHand, new THREE.BoxGeometry(0.055, 0.085, 0.040), M(HEX.skin), 0.025, 0.035, 0)
  mesh(lHand, new THREE.BoxGeometry(0.055, 0.085, 0.040), M(HEX.skin),-0.025,-0.035, 0)

  // ── Right finger segments ──
  const fingerCap = (r, h) => cap(r, h)
  ;[
    [rTh1, rTh2, bMap['RightHandThumb3'],  0.015, 0.036, 0.030],
    [rIn1, rIn2, bMap['RightHandIndex3'],  0.014, 0.032, 0.026],
    [rMi1, rMi2, bMap['RightHandMiddle3'], 0.014, 0.032, 0.026],
    [rRi1, rRi2, bMap['RightHandRing3'],   0.012, 0.028, 0.022],
    [rPi1, rPi2, bMap['RightHandPinky3'],  0.010, 0.024, 0.018],
  ].forEach(([b1, b2, b3, r, h1, h2]) => {
    mesh(b1, fingerCap(r,   h1), M(HEX.skin), 0, h1/2, 0)
    mesh(b2, fingerCap(r,   h2), M(HEX.skin), 0, h2/2, 0)
    mesh(b3, fingerCap(r*0.9, h2*0.8), M(HEX.skin), 0, h2*0.4, 0)
  })

  // ── Left finger segments (mirrored) ──
  ;[
    [lTh1, lTh2, bMap['LeftHandThumb3'],  0.015, 0.036, 0.030],
    [lIn1, lIn2, bMap['LeftHandIndex3'],  0.014, 0.032, 0.026],
    [lMi1, lMi2, bMap['LeftHandMiddle3'], 0.014, 0.032, 0.026],
    [lRi1, lRi2, bMap['LeftHandRing3'],   0.012, 0.028, 0.022],
    [lPi1, lPi2, bMap['LeftHandPinky3'],  0.010, 0.024, 0.018],
  ].forEach(([b1, b2, b3, r, h1, h2]) => {
    mesh(b1, fingerCap(r,   h1), M(HEX.skin), 0,-h1/2, 0)
    mesh(b2, fingerCap(r,   h2), M(HEX.skin), 0,-h2/2, 0)
    mesh(b3, fingerCap(r*0.9,h2*0.8), M(HEX.skin), 0,-h2*0.4, 0)
  })

  // ── Legs ──
  mesh(rUpLeg, cap(0.090, 0.22), M(HEX.pants), 0,-0.11, 0)
  mesh(lUpLeg, cap(0.090, 0.22), M(HEX.pants), 0,-0.11, 0)
  // knee cap
  mesh(rLeg, sph(0.068), M(HEX.skin), 0, 0.01, 0)
  mesh(lLeg, sph(0.068), M(HEX.skin), 0, 0.01, 0)
  // Lower leg
  mesh(rLeg, cap(0.072, 0.20), M(HEX.skin), 0,-0.10, 0)
  mesh(lLeg, cap(0.072, 0.20), M(HEX.skin), 0,-0.10, 0)
  // Feet
  mesh(bMap['RightFoot'], cap(0.062, 0.06), M(HEX.shoe), 0, 0, 0.04, Math.PI/2, 0, 0)
  mesh(bMap['LeftFoot'],  cap(0.062, 0.06), M(HEX.shoe), 0, 0, 0.04, Math.PI/2, 0, 0)

  // Lift so feet touch y=0
  root.position.y = 0.80

  return { root, bMap }
}

// ─── React component ──────────────────────────────────────────────────────────
const AvatarModel = forwardRef(function AvatarModel(_, ref) {
  const groupRef = useRef()
  const breathT  = useRef(0)

  const { root, bMap } = useMemo(() => buildAvatar(), [])
  const { signText, pause, resume, stop } = useSignAnimation(bMap)

  useImperativeHandle(ref, () => ({ signText, pause, resume, stop, boneMap: bMap }), [signText, pause, resume, stop, bMap])

  useEffect(() => {
    if (groupRef.current) groupRef.current.add(root)
    return () => { if (groupRef.current) groupRef.current.remove(root) }
  }, [root])

  // Idle breathing
  useFrame((_, delta) => {
    breathT.current += delta * 0.8
    const b = Math.sin(breathT.current)
    if (bMap['Spine'])  bMap['Spine'].scale.y  = 1 + b * 0.006
    if (bMap['Spine1']) bMap['Spine1'].scale.y = 1 + b * 0.004
    if (bMap['Head'])   bMap['Head'].rotation.y = b * 0.03
  })

  return <group ref={groupRef} />
})

export default AvatarModel
