/**
 * Avatar3D Component
 * The 3D scene containing the avatar with lighting, camera, and controls.
 */

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Suspense, forwardRef } from 'react'
import AvatarModel from './AvatarModel'

function LoadingFallback() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <capsuleGeometry args={[0.2, 0.8, 8, 12]} />
      <meshStandardMaterial color="#6C63FF" wireframe />
    </mesh>
  )
}

const Avatar3D = forwardRef(function Avatar3D(props, ref) {
  return (
    <div className="avatar-canvas-wrapper">
      <Canvas
        camera={{ position: [0, 0.6, 3.2], fov: 38 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Key light */}
        <directionalLight
          position={[3, 6, 4]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* Fill light */}
        <directionalLight position={[-3, 3, -2]} intensity={0.5} color="#FFF3E0" />
        {/* Ambient */}
        <ambientLight intensity={0.55} />
        {/* Accent */}
        <pointLight position={[0, 2, 2.5]} intensity={0.25} color="#6C63FF" />

        <Suspense fallback={<LoadingFallback />}>
          <AvatarModel ref={ref} />
          <ContactShadows
            position={[0, -0.78, 0]}
            opacity={0.45}
            scale={4}
            blur={2.2}
            far={4}
          />
        </Suspense>

        <OrbitControls
          target={[0, 0.4, 0]}
          enablePan={false}
          minDistance={1.8}
          maxDistance={6}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={(Math.PI * 2) / 3}
        />

        <Environment preset="studio" />
      </Canvas>
    </div>
  )
})

export default Avatar3D

