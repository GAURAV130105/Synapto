/**
 * Sign Animation Player
 * Manages a queue of sign animations and smoothly interpolates
 * bone rotations on the 3D avatar each frame.
 */

import * as THREE from 'three'

export class SignAnimationPlayer {
  constructor(boneMap, onGlossChange, onComplete) {
    this.boneMap = boneMap
    this.onGlossChange = onGlossChange
    this.onComplete = onComplete
    this.queue = []
    this.isPlaying = false
    this.isPaused = false
    this.currentIndex = 0
    this.holdTimer = 0
    this.wordTimer = 0
    this.speed = 1
    this.lerpFactor = 0.12
    
    // Store initial bone rotations for reset
    this.initialPose = {}
    if (boneMap) {
      for (const [name, bone] of Object.entries(boneMap)) {
        this.initialPose[name] = {
          x: bone.rotation.x,
          y: bone.rotation.y,
          z: bone.rotation.z,
        }
      }
    }
  }

  enqueue(animations) {
    this.queue = animations
    this.currentIndex = 0
    this.isPlaying = true
    this.isPaused = false
    this.holdTimer = 0
    this.wordTimer = 0
    if (this.onGlossChange && animations.length > 0) {
      this.onGlossChange(0, animations[0])
    }
  }

  pause() { this.isPaused = true }
  resume() { this.isPaused = false }
  
  stop() {
    this.isPlaying = false
    this.isPaused = false
    this.currentIndex = 0
    this.holdTimer = 0
    this.wordTimer = 0
    this.resetToIdle()
  }

  setSpeed(speed) { this.speed = speed }

  resetToIdle() {
    if (!this.boneMap) return
    for (const [name, rot] of Object.entries(this.initialPose)) {
      const bone = this.boneMap[name]
      if (bone) {
        bone.rotation.x = rot.x
        bone.rotation.y = rot.y
        bone.rotation.z = rot.z
      }
    }
  }

  advanceToNext() {
    this.currentIndex++
    this.holdTimer = 0
    this.wordTimer = 0
    
    if (this.currentIndex >= this.queue.length) {
      this.isPlaying = false
      if (this.onComplete) this.onComplete()
      // Smoothly return to rest
      return false
    }
    
    if (this.onGlossChange) {
      this.onGlossChange(this.currentIndex, this.queue[this.currentIndex])
    }
    return true
  }

  // Called every frame from useFrame()
  update(delta) {
    if (!this.isPlaying || this.isPaused || !this.boneMap) return
    if (this.currentIndex >= this.queue.length) {
      this.isPlaying = false
      // Lerp back to rest pose
      this.lerpToRest(delta)
      return
    }

    const current = this.queue[this.currentIndex]
    const adjustedDelta = delta * this.speed

    if (current.type === 'letter') {
      this.playLetterPose(current, adjustedDelta)
    } else if (current.type === 'word') {
      this.playWordAnimation(current, adjustedDelta)
    }
  }

  playLetterPose(item, delta) {
    this.applyPose(item.data)
    this.holdTimer += delta
    if (this.holdTimer >= 0.6) {
      this.advanceToNext()
    }
  }

  playWordAnimation(item, delta) {
    const { frames, duration } = item.data
    this.wordTimer += delta

    if (this.wordTimer >= duration) {
      this.advanceToNext()
      return
    }

    // Find the two frames to interpolate between
    let frameA = frames[0]
    let frameB = frames[0]
    
    for (let i = 0; i < frames.length - 1; i++) {
      if (this.wordTimer >= frames[i].time && this.wordTimer < frames[i + 1].time) {
        frameA = frames[i]
        frameB = frames[i + 1]
        break
      }
    }
    // If past last frame, use last frame
    if (this.wordTimer >= frames[frames.length - 1].time) {
      frameA = frames[frames.length - 1]
      frameB = frameA
    }

    // Interpolation factor between frames
    const range = frameB.time - frameA.time
    const t = range > 0 ? (this.wordTimer - frameA.time) / range : 1

    // Interpolate bone rotations
    const allBones = new Set([...Object.keys(frameA.bones), ...Object.keys(frameB.bones)])
    for (const boneName of allBones) {
      const bone = this.boneMap[boneName]
      if (!bone) continue
      
      const rotA = frameA.bones[boneName] || { x: 0, y: 0, z: 0 }
      const rotB = frameB.bones[boneName] || rotA

      const targetX = THREE.MathUtils.lerp(rotA.x, rotB.x, t)
      const targetY = THREE.MathUtils.lerp(rotA.y, rotB.y, t)
      const targetZ = THREE.MathUtils.lerp(rotA.z, rotB.z, t)

      bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, targetX, this.lerpFactor)
      bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, targetY, this.lerpFactor)
      bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, targetZ, this.lerpFactor)
    }
  }

  applyPose(pose) {
    for (const [boneName, rotation] of Object.entries(pose)) {
      const bone = this.boneMap[boneName]
      if (bone) {
        bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, rotation.x, this.lerpFactor)
        bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, rotation.y, this.lerpFactor)
        bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, rotation.z, this.lerpFactor)
      }
    }
  }

  lerpToRest(delta) {
    let allAtRest = true
    for (const [name, rot] of Object.entries(this.initialPose)) {
      const bone = this.boneMap[name]
      if (!bone) continue
      
      bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, rot.x, 0.05)
      bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, rot.y, 0.05)
      bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, rot.z, 0.05)
      
      if (Math.abs(bone.rotation.x - rot.x) > 0.01 ||
          Math.abs(bone.rotation.y - rot.y) > 0.01 ||
          Math.abs(bone.rotation.z - rot.z) > 0.01) {
        allAtRest = false
      }
    }
    return allAtRest
  }
}
