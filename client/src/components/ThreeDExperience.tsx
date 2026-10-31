import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Eye } from 'lucide-react';

interface ThreeDExperienceProps {
  className?: string;
  height?: string;
  interactive?: boolean;
}

export const ThreeDExperience: React.FC<ThreeDExperienceProps> = ({
  className = '',
  height = '480px',
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [activeNode, setActiveNode] = useState<string>('Neural Core: Active');

  // Three.js instances refs for controls
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(true);

  // Interaction tracking
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const techNodes = [
    { title: 'AI Engineering', color: '#00f0ff' },
    { title: 'Full-Stack Architecture', color: '#8b5cf6' },
    { title: 'Cloud Infrastructure', color: '#38bdf8' },
    { title: 'Cybersecurity Shield', color: '#10b981' },
    { title: 'Data Science & LLMs', color: '#ec4899' },
  ];

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const heightPx = container.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 1000);
    camera.position.set(0, 0, 18);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 2.5, 50);
    pointLight.position.set(10, 15, 15);
    scene.add(pointLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 2.5, 50);
    violetLight.position.set(-10, -15, -15);
    scene.add(violetLight);

    // 5. Globe & Neural Structure
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Inner Wireframe Sphere
    const sphereGeo = new THREE.IcosahedronGeometry(5.2, 3);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireframeSphere = new THREE.Mesh(sphereGeo, wireframeMat);
    globeGroup.add(wireframeSphere);

    // Neural Nodes (Particles on sphere surface)
    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const colorCyan = new THREE.Color(0x00f0ff);
    const colorPurple = new THREE.Color(0xa855f7);

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      const radius = 5.25;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const mixedColor = colorCyan.clone().lerp(colorPurple, Math.random());
      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particles);

    // Outer Orbital Rings
    const ringGeo1 = new THREE.RingGeometry(6.6, 6.7, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    globeGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(7.2, 7.3, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    globeGroup.add(ring2);

    // Glowing Career Major Hubs
    techNodes.forEach((node, idx) => {
      const angle = (idx / techNodes.length) * Math.PI * 2;
      const hubGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const hubMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.color),
        emissive: new THREE.Color(node.color),
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const hubMesh = new THREE.Mesh(hubGeo, hubMat);
      const x = Math.cos(angle) * 5.25;
      const y = Math.sin(angle) * 3.5;
      const z = Math.sin(angle) * 3.8;
      hubMesh.position.set(x, y, z);
      globeGroup.add(hubMesh);
    });

    // 6. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (isPlayingRef.current && globeGroupRef.current) {
        globeGroupRef.current.rotation.y += delta * 0.25;
        globeGroupRef.current.rotation.x += delta * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Mouse Drag Interactions
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !globeGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      globeGroupRef.current.rotation.y += deltaX * 0.005;
      globeGroupRef.current.rotation.x += deltaY * 0.005;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.min(Math.max(cameraRef.current.position.z + e.deltaY * 0.015, 10), 28);
    };

    if (interactive) {
      container.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      container.addEventListener('wheel', onWheel, { passive: true });
    }

    // 8. Resize Handler
    const onResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', onResize);
      if (interactive) {
        container.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        container.removeEventListener('wheel', onWheel);
      }
      renderer.dispose();
      sphereGeo.dispose();
      wireframeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
    };
  }, [interactive]);

  // UI Control Handlers
  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    isPlayingRef.current = nextState;
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(cameraRef.current.position.z - 2.5, 10);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(cameraRef.current.position.z + 2.5, 28);
    }
  };

  const resetCamera = () => {
    if (cameraRef.current && globeGroupRef.current) {
      cameraRef.current.position.set(0, 0, 18);
      globeGroupRef.current.rotation.set(0, 0, 0);
      setIsPlaying(true);
      isPlayingRef.current = true;
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl cyber-card ${className}`}>
      {/* 3D Canvas Mount Point */}
      {hasWebGL ? (
        <div
          ref={mountRef}
          style={{ height }}
          className="w-full cursor-grab active:cursor-grabbing select-none"
        />
      ) : (
        /* WebGL Fallback */
        <div style={{ height }} className="flex flex-col items-center justify-center p-8 text-center bg-cyber-surface">
          <div className="h-20 w-20 rounded-full border-2 border-dashed border-electric-500 animate-spin flex items-center justify-center mb-4">
            <Eye className="h-8 w-8 text-electric-400" />
          </div>
          <h4 className="text-base font-bold text-white">Neural Career Visualization</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Accelerated 3D mode fallback active. Career nodes and pathway projections are operational.
          </p>
        </div>
      )}

      {/* Floating Status & Role Indicator */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-electric-500/30 bg-cyber-bg/80 px-3 py-1.5 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-500"></span>
        </span>
        <span className="text-[11px] font-mono tracking-wide text-electric-400">
          {activeNode}
        </span>
      </div>

      {/* Interactive Controls Overlay */}
      {interactive && hasWebGL && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-2xl border border-electric-500/20 bg-cyber-bg/85 p-1.5 backdrop-blur-md shadow-glow-sm">
          <button
            onClick={togglePlay}
            title={isPlaying ? 'Pause Rotation' : 'Resume Rotation'}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:bg-electric-500/20 hover:text-electric-400 transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={zoomIn}
            title="Zoom In"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:bg-electric-500/20 hover:text-electric-400 transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:bg-electric-500/20 hover:text-electric-400 transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={resetCamera}
            title="Reset Angle & Zoom"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:bg-electric-500/20 hover:text-electric-400 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Legend / Key Path Badges */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2">
        {techNodes.slice(0, 3).map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveNode(`Node: ${item.title}`)}
            className="rounded-lg border border-slate-700/50 bg-cyber-bg/70 px-2.5 py-1 text-[10px] font-mono text-slate-300 backdrop-blur-xs hover:border-electric-500/40 transition-colors"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
};
