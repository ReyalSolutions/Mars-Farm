import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { MarsLocation } from '../../types';
import { MARS_LOCATIONS } from '../../data/marsLocations';
import { useAudio } from '../../context/AudioContext';
import { Maximize2 } from 'lucide-react';

interface MarsGlobeProps {
  selectedLocationId?: string;
  onSelectLocation?: (location: MarsLocation) => void;
  interactive?: boolean;
  className?: string;
  showFullscreenButton?: boolean;
}

export const MarsGlobe: React.FC<MarsGlobeProps> = ({
  selectedLocationId = 'jezero-crater',
  onSelectLocation,
  interactive = true,
  className = '',
  showFullscreenButton = true
}) => {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);
  const { playClick } = useAudio();
  const [activeLocationId, setActiveLocationId] = useState<string | null>(selectedLocationId || null);
  const [isZoomedIn, setIsZoomedIn] = useState<boolean>(false);
  const [hoveredLocation, setHoveredLocation] = useState<MarsLocation | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  const activeLocationIdRef = useRef<string | null>(selectedLocationId || null);
  const isZoomedInRef = useRef<boolean>(false);
  const pinMeshesRef = useRef<{ [locId: string]: THREE.Mesh }>({});

  useEffect(() => {
    if (selectedLocationId) {
      activeLocationIdRef.current = selectedLocationId;
      setActiveLocationId(selectedLocationId);
    }
  }, [selectedLocationId]);

  const activeLocation = MARS_LOCATIONS.find(loc => loc.id === (activeLocationId || selectedLocationId)) || null;

  const handleZoomOut = () => {
    playClick();
    isZoomedInRef.current = false;
    setIsZoomedIn(false);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const container = mountRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Realistic NASA Satellite Mars Texture Loader
    const textureLoader = new THREE.TextureLoader();
    
    // Quick procedural fallback canvas in case texture is loading
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#991B1B');
      grad.addColorStop(0.5, '#C2410C');
      grad.addColorStop(1, '#7F1D1D');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);
    }
    const fallbackTexture = new THREE.CanvasTexture(canvas);

    const marsGeometry = new THREE.SphereGeometry(1, 64, 64);
    const marsMaterial = new THREE.MeshStandardMaterial({
      map: fallbackTexture,
      roughness: 0.92,
      metalness: 0.04,
    });

    // Load authentic NASA satellite photographic mosaic
    const realTexture = textureLoader.load(
      '/textures/mars_realistic.jpg',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        marsMaterial.map = tex;
        marsMaterial.bumpMap = tex;
        marsMaterial.bumpScale = 0.024; // Photorealistic topographic depth for Olympus Mons & Valles Marineris
        marsMaterial.needsUpdate = true;
      }
    );

    const marsMesh = new THREE.Mesh(marsGeometry, marsMaterial);
    // Real Martian axial tilt: 25.19° (0.439 radians)
    marsMesh.rotation.z = -0.439;
    scene.add(marsMesh);

    // Realistic Thin Martian Atmosphere (Outer Halo & Inner Limb Glow)
    const atmosphereGeometry = new THREE.SphereGeometry(1.026, 64, 64);
    const atmosphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xeb7746,
      transparent: true,
      opacity: 0.22,
      roughness: 0.9,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    marsMesh.add(atmosphereMesh);

    // Atmospheric limb Fresnel glow
    const rimGeometry = new THREE.SphereGeometry(1.012, 48, 48);
    const rimMaterial = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.14,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
    });
    const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
    marsMesh.add(rimMesh);

    // Starfield particles in background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 16;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xa5f3fc, size: 0.022, transparent: true, opacity: 0.65 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Realistic Planetary Sunlight Rig: Strong solar key light + subtle deep-space fill
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    sunLight.position.set(6, 3, 5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x1a0f0d, 0.45);
    scene.add(ambientLight);

    // Location markers (Lat/Long to 3D Cartesian coordinates on sphere)
    const markerGroup = new THREE.Group();
    marsMesh.add(markerGroup);

    const hitTargets: THREE.Mesh[] = [];
    const markerMeshes: { mesh: THREE.Mesh; ringMesh: THREE.Mesh; location: MarsLocation }[] = [];

    MARS_LOCATIONS.forEach((loc) => {
      const phi = (90 - loc.latitude) * (Math.PI / 180);
      const theta = (loc.longitude + 180) * (Math.PI / 180);
      const x = -(1.02 * Math.sin(phi) * Math.cos(theta));
      const z = 1.02 * Math.sin(phi) * Math.sin(theta);
      const y = 1.02 * Math.cos(phi);

      const isSelected = loc.id === (activeLocationIdRef.current || selectedLocationId);

      // Pin center glowing sphere
      const pinGeo = new THREE.SphereGeometry(isSelected ? 0.038 : 0.025, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x00f0ff : 0xff4d2e,
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(x, y, z);
      markerGroup.add(pinMesh);

      // Holographic concentric ring around landing site
      const ringGeo = new THREE.RingGeometry(0.045, 0.055, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x00f0ff : 0xff4d2e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(x * 1.002, y * 1.002, z * 1.002);
      ringMesh.lookAt(new THREE.Vector3(x * 2, y * 2, z * 2));
      markerGroup.add(ringMesh);

      // Invisible generous hit-target sphere for effortless clicking/tapping
      const hitGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(x, y, z);
      hitMesh.userData = { location: loc };
      markerGroup.add(hitMesh);
      hitTargets.push(hitMesh);

      markerMeshes.push({ mesh: pinMesh, ringMesh, location: loc });
      pinMeshesRef.current[loc.id] = pinMesh;
    });

    // Raycasting Helper
    const raycaster = new THREE.Raycaster();
    const getIntersectedLocation = (clientX: number, clientY: number): MarsLocation | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hitTargets, false);
      if (intersects.length > 0) {
        return (intersects[0].object.userData?.location as MarsLocation) || null;
      }
      return null;
    };

    // Mouse & Touch Drag Rotation Controls
    let isMouseDown = false;
    let hasDragged = false;
    let mouseDownX = 0;
    let mouseDownY = 0;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      if (!interactive) return;
      isMouseDown = true;
      hasDragged = false;
      mouseDownX = e.clientX;
      mouseDownY = e.clientY;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isMouseDown && interactive) {
        const totalDx = e.clientX - mouseDownX;
        const totalDy = e.clientY - mouseDownY;
        if (!hasDragged && Math.abs(totalDx) < 4 && Math.abs(totalDy) < 4) return;
        hasDragged = true;

        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        marsMesh.rotation.y += deltaX * 0.005;
        marsMesh.rotation.x = Math.max(-0.65, Math.min(0.65, marsMesh.rotation.x + deltaY * 0.004));
        prevMousePos = { x: e.clientX, y: e.clientY };
      } else if (!isMouseDown && interactive) {
        // Hover raycast for desktop cursor styling & tooltip
        const hitLoc = getIntersectedLocation(e.clientX, e.clientY);
        setHoveredLocation(hitLoc);
        renderer.domElement.style.cursor = hitLoc ? 'pointer' : 'grab';
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      const wasClick = isMouseDown && !hasDragged;
      isMouseDown = false;
      hasDragged = false;
      renderer.domElement.style.cursor = 'grab';

      if (wasClick && interactive) {
        const hitLoc = getIntersectedLocation(e.clientX, e.clientY);
        if (hitLoc) {
          playClick();
          activeLocationIdRef.current = hitLoc.id;
          isZoomedInRef.current = true;
          setActiveLocationId(hitLoc.id);
          setIsZoomedIn(true);
          onSelectLocation?.(hitLoc);
        } else if (isZoomedInRef.current) {
          // Clicking empty space zooms back out smoothly
          playClick();
          isZoomedInRef.current = false;
          setIsZoomedIn(false);
        }
      }
    };

    // Touch support for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      if (!interactive || e.touches.length !== 1) return;
      isMouseDown = true;
      hasDragged = false;
      mouseDownX = e.touches[0].clientX;
      mouseDownY = e.touches[0].clientY;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isMouseDown || !interactive || e.touches.length !== 1) return;
      const totalDx = e.touches[0].clientX - mouseDownX;
      const totalDy = e.touches[0].clientY - mouseDownY;
      if (!hasDragged && Math.abs(totalDx) < 6 && Math.abs(totalDy) < 6) return;
      hasDragged = true;

      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;
      marsMesh.rotation.y += deltaX * 0.006;
      marsMesh.rotation.x = Math.max(-0.65, Math.min(0.65, marsMesh.rotation.x + deltaY * 0.005));
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      const wasClick = isMouseDown && !hasDragged;
      isMouseDown = false;
      hasDragged = false;

      if (wasClick && interactive && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const hitLoc = getIntersectedLocation(touch.clientX, touch.clientY);
        if (hitLoc) {
          playClick();
          activeLocationIdRef.current = hitLoc.id;
          isZoomedInRef.current = true;
          setActiveLocationId(hitLoc.id);
          setIsZoomedIn(true);
          onSelectLocation?.(hitLoc);
        } else if (isZoomedInRef.current) {
          playClick();
          isZoomedInRef.current = false;
          setIsZoomedIn(false);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    // Smooth Cinematic Camera Zoom & Targeting Loop
    let animationFrameId: number;
    const defaultCamPos = new THREE.Vector3(0, 0, 2.8);
    const defaultLookAt = new THREE.Vector3(0, 0, 0);
    const targetCamPos = new THREE.Vector3(0, 0, 2.8);
    const targetLookAt = new THREE.Vector3(0, 0, 0);
    const currentLookAt = new THREE.Vector3(0, 0, 0);
    const pinWorldPos = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const activeId = activeLocationIdRef.current;
      const zoomed = isZoomedInRef.current;

      // When zoomed in on a landing site: Camera swoops to low orbital recon altitude directly above the site
      if (zoomed && activeId && pinMeshesRef.current[activeId]) {
        const pin = pinMeshesRef.current[activeId];
        pin.getWorldPosition(pinWorldPos);

        const normal = pinWorldPos.clone().normalize();
        // Camera positioned at altitude 1.44 units (close-up surface inspection)
        targetCamPos.copy(normal).multiplyScalar(1.44);
        targetLookAt.copy(pinWorldPos).multiplyScalar(0.72);
      } else {
        // Overview global perspective
        targetCamPos.copy(defaultCamPos);
        targetLookAt.copy(defaultLookAt);

        // Constant cinematic planetary rotation when in global orbit
        if (!isMouseDown) {
          marsMesh.rotation.y += 0.0018;
        }
      }

      // Smooth cinematic camera lerp
      camera.position.lerp(targetCamPos, 0.065);
      currentLookAt.lerp(targetLookAt, 0.065);
      camera.lookAt(currentLookAt);

      // Pulse selected marker & animate target rings
      const time = Date.now() * 0.005;
      markerMeshes.forEach(({ mesh, ringMesh, location }) => {
        const isCurrentActive = location.id === activeLocationIdRef.current;
        if (isCurrentActive) {
          const pulse = 1 + Math.sin(time * 1.5) * 0.3;
          mesh.scale.set(pulse, pulse, pulse);
          ringMesh.scale.set(pulse, pulse, pulse);
          (ringMesh.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(time * 2) * 0.35;
        } else {
          mesh.scale.set(1, 1, 1);
          ringMesh.scale.set(1, 1, 1);
          (ringMesh.material as THREE.MeshBasicMaterial).opacity = 0.45;
        }
      });

      starField.rotation.y += 0.0002;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('touchstart', onTouchStart);
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <div className={`relative w-full h-full min-h-[340px] flex items-center justify-center select-none overflow-hidden ${className}`}>
      {webglSupported ? (
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center" />
      ) : (
        /* 2D High-Res Fallback */
        <div className="relative w-72 h-72 rounded-full bg-gradient-to-br from-mars-600 via-mars-800 to-space-950 border-2 border-mars-500 shadow-[0_0_50px_rgba(255,77,46,0.3)] flex items-center justify-center">
          <div className="text-center p-4">
            <span className="text-4xl">🔴</span>
            <p className="text-xs font-mono text-cyan-300 mt-2">Mars Orbital View</p>
          </div>
        </div>
      )}

      {/* Floating Orbital Recon HUD Card when Zoomed into a Landing Site */}
      {isZoomedIn && activeLocation ? (
        <div className="absolute top-3 left-3 right-3 z-20 pointer-events-auto p-3 rounded-xl bg-space-950/90 border border-cyan-500/80 backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.35)] space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                ORBITAL SCOUT RECON // {activeLocation.type.toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleZoomOut}
              className="px-2 py-0.5 rounded bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-[10px] font-mono font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <span>🔭 Overview</span>
            </button>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <h4 className="text-sm font-bold font-display text-white truncate">
              {activeLocation.name}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
              {activeLocation.latitude}°N · {activeLocation.longitude}°E
            </span>
          </div>

          <p className="text-[11px] font-mono text-slate-300 leading-snug line-clamp-2">
            {activeLocation.description}
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-0.5 text-[10px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-300">
              Elev: <strong className="text-white">{activeLocation.elevationKm} km</strong>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-space-900 border border-cyan-800 text-cyan-300">
              Solar: <strong className="text-cyan-200">{activeLocation.solarPotentialScore}/100</strong>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-space-900 border border-bio-800 text-bio-300">
              Ice: <strong className="text-bio-200">{activeLocation.waterPotentialScore}/100</strong>
            </span>
          </div>
        </div>
      ) : (
        /* Default Instructions Badge */
        <div className="absolute top-3 right-3 bg-space-950/80 border border-slate-800/80 px-2.5 py-1 rounded text-[10px] font-mono text-slate-400 pointer-events-none flex items-center gap-1.5">
          <span className="text-cyan-400">📍</span>
          <span>Click any landing site to zoom in</span>
        </div>
      )}

      {/* Fullscreen / Solar System View Button */}
      {showFullscreenButton && !isZoomedIn && (
        <button
          onClick={() => {
            playClick();
            navigate('/solar-system');
          }}
          className="absolute top-3 left-3 z-20 pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-space-950/90 hover:bg-space-900 border border-mars-500/60 hover:border-mars-400 text-mars-300 hover:text-white text-[10px] font-mono font-bold transition-all shadow-[0_0_14px_rgba(255,77,46,0.35)] backdrop-blur-md cursor-pointer group"
          title="Open Realistic 3D Solar System View"
        >
          <Maximize2 className="w-3 h-3 text-mars-400 group-hover:scale-110 group-hover:text-mars-200 transition-transform" />
          <span>FULL SCREEN // SOLAR SYSTEM</span>
        </button>
      )}

      {/* Hover Tooltip when moving cursor over a site */}
      {!isZoomedIn && hoveredLocation && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-space-950/90 border border-cyan-400 text-cyan-300 text-[11px] font-mono font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] pointer-events-none animate-in fade-in">
          🔭 Scout: {hoveredLocation.name} (Click to Zoom)
        </div>
      )}

      {/* Futuristic HUD overlay pinpoints on bottom-left */}
      <div className="absolute bottom-3 left-3 bg-space-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded text-[11px] font-mono text-slate-400 pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>3D MARS ORBITAL TELEMETRY</span>
      </div>
    </div>
  );
};
