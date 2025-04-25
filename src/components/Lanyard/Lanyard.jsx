/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import cardGLB from "./card.glb";
import lanyard from "./lanyard.png";
import mainHDR from './t2.hdr';

import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({ position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true }) {
  return (
    <div className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center">
      <Canvas
        camera={{ position: position, fov: fov }}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={0.5} />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band />
        </Physics>
        {/* Use the HDR file as the environment map */}
        <Environment
          files={mainHDR} // Path to the HDRI file
          background={false} // Hide HDRI as the background
          rotation={[0,0,0]} // Rotate the HDRI (Y-axis rotation in radians)
        />
        {/* Add Bloom Effect */}
        <EffectComposer>
          <Bloom
            intensity={0.7} // Bloom intensity
            luminanceThreshold={0.4} // Minimum luminance for bloom
            luminanceSmoothing={0.9} // Smoothing of the bloom effect
            height={500} // Resolution of the bloom effect
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
function Band({ maxSpeed = 50, minSpeed = 0 }) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyard);
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const [isSmall, setIsSmall] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 1024
  );

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.50, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (e.target.setPointerCapture(e.pointerId), drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation()))))}>
            <mesh geometry={nodes.card.geometry} material={materials.metal}>
              <meshPhysicalMaterial 
                map={materials.base.map} // Base color map
                displacementMap={materials.base.displacementMap} // Displacement map
                displacementScale={0.3} // Adjust the scale of displacement
                metalnessMap={materials.base.metallicMap} // Metallic map
                normalMap={materials.base.normalMap} // Normal map
                roughnessMap={materials.base.roughnessMap} // Roughness map
                clearcoat={1} // Add a glossy clear coat
                clearcoatRoughness={0.3} // Smooth clear coat
                metalness={1} // Fully metallic
                roughness={1} // Adjust roughness
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
            <mesh geometry={nodes.logo.geometry} material={materials.metal} >
              <meshPhysicalMaterial
                metalness={1} // Fully metallic
                roughness={0} // Perfectly smooth
                clearcoat={1} // Add a glossy clear coat
                clearcoatRoughness={0} // Smooth clear coat
                envMapIntensity={5} // Boost reflection intensity
                color="#181718" // Optional: Set a base color
              />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          material={materials.metal}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}