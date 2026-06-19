// CoinCanvas.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CoinCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 8;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const goldDirectional1 = new THREE.DirectionalLight(0xf5e6a3, 3);
    goldDirectional1.position.set(5, 5, 5);
    scene.add(goldDirectional1);

    const goldDirectional2 = new THREE.DirectionalLight(0xd4af37, 2);
    goldDirectional2.position.set(-5, -5, 5);
    scene.add(goldDirectional2);

    const pointLight = new THREE.PointLight(0xffffff, 1, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // 5. Build 3D Coin (Cylinder Geometry for disc)
    const coinGroup = new THREE.Group();
    scene.add(coinGroup);

    // Coin geometry (radiusTop, radiusBottom, height, radialSegments)
    const coinGeometry = new THREE.CylinderGeometry(2, 2, 0.25, 64);
    coinGeometry.rotateX(Math.PI / 2); // align face to front camera

    // Luxury metallic gold physical material
    const coinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.8,
    });

    const coinBody = new THREE.Mesh(coinGeometry, coinMaterial);
    coinGroup.add(coinBody);

    // Coin Face Borders (Ring geometry to create a premium outer edge rim on the face)
    const rimGeom = new THREE.TorusGeometry(1.85, 0.08, 16, 100);
    const rimMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5e6a3,
      metalness: 1.0,
      roughness: 0.1,
    });
    const rim1 = new THREE.Mesh(rimGeom, rimMaterial);
    rim1.position.z = 0.13;
    coinGroup.add(rim1);

    const rim2 = rim1.clone();
    rim2.position.z = -0.13;
    coinGroup.add(rim2);

    // Center Bell Engraving (procedural visual via a small bell structure inside or a decorative shape)
    // We will build a decorative central shield (octagonal or circular) to simulate a coin stamp
    const stampGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.05, 8);
    stampGeom.rotateX(Math.PI / 2);
    const stampMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5e6a3,
      metalness: 1.0,
      roughness: 0.2,
    });
    const stamp1 = new THREE.Mesh(stampGeom, stampMaterial);
    stamp1.position.z = 0.135;
    coinGroup.add(stamp1);

    const stamp2 = stamp1.clone();
    stamp2.position.z = -0.135;
    coinGroup.add(stamp2);

    // 6. Particles Field
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // spread in a sphere area around the coin
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 8 - 2;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Warm gold points material
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xf5e6a3,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 7. Mouse Parallax event listeners
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (event.clientX - windowHalfX) / windowHalfX;
      mouseY = (event.clientY - windowHalfY) / windowHalfY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Animation Loop
    let animationFrameId: number;

    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Auto rotation
      coinGroup.rotation.y = elapsedTime * 0.7;
      coinGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15;

      // Parallax smooth interpolation
      targetX = mouseX * 0.5;
      targetY = mouseY * 0.5;

      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Particle movements (subtle drifting)
      const particlePositions = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        particlePositions[i] -= 0.005; // fall down
        if (particlePositions[i] < -6) {
          particlePositions[i] = 6; // reset at top
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      coinGeometry.dispose();
      coinMaterial.dispose();
      rimGeom.dispose();
      rimMaterial.dispose();
      stampGeom.dispose();
      stampMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[300px] md:min-h-[450px]" />;
}
