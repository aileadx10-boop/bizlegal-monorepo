'use client'

import { useRef, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function RegulatoryGlobe() {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.y -= 0.003
      ringsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <group>
      {/* Main sphere */}
      {/* @types/three vs @react-three/drei type drift — drei's Sphere ref expects
          Mesh<BufferGeometry<…, BufferGeometryEventMap>>, but THREE.Mesh widens to
          BufferGeometry<NormalBufferAttributes>. Cast through unknown. */}
      <Sphere ref={meshRef as unknown as RefObject<never>} args={[1.8, 64, 64]}>
        <MeshDistortMaterial
          color="#1a4d99"
          emissive="#0066ff"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
          distort={0.15}
          speed={1.5}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[1.82, 32, 32]}>
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.08}
        />
      </Sphere>

      {/* Orbit rings — @ts-ignore directive on the IMMEDIATELY adjacent
          line below suppresses @types/three vs @react-three/fiber drift
          that Vercel's next build catches but local tsc --noEmit doesn't.
          Don't insert any non-blank line between @ts-ignore and the JSX
          tag or the suppression chain breaks (Vercel 502 reproduced on
          2026-05-09 with a multi-line comment in between). */}
      {/* @ts-ignore */}
      <group ref={ringsRef}>
        {/* Ring 1 — horizontal */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.4, 0.01, 16, 100]} />
          <meshBasicMaterial color="#a5b4fc" transparent opacity={0.3} />
        </mesh>
        {/* Ring 2 — tilted */}
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[2.1, 0.008, 16, 100]} />
          <meshBasicMaterial color="#d4a853" transparent opacity={0.25} />
        </mesh>
        {/* Ring 3 — reverse tilt */}
        <mesh rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
          <torusGeometry args={[2.7, 0.006, 16, 100]} />
          <meshBasicMaterial color="#00FF94" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* Pulsing nodes on globe */}
      {[...Array(6)].map((_, i) => {
        const phi = Math.acos(-1 + (2 * i) / 6)
        const theta = Math.sqrt(6 * Math.PI) * phi
        const x = 1.85 * Math.cos(theta) * Math.sin(phi)
        const y = 1.85 * Math.sin(theta) * Math.sin(phi)
        const z = 1.85 * Math.cos(phi)
        const colors = ['#a5b4fc', '#d4a853', '#00FF94', '#f87171', '#60a5fa', '#c084fc']
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={colors[i]} />
          </mesh>
        )
      })}
    </group>
  )
}

export default function Globe() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#a5b4fc" />
        <pointLight position={[-3, -3, 2]} intensity={0.4} color="#d4a853" />
        <RegulatoryGlobe />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  )
}