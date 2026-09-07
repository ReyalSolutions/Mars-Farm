import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MarsSurfaceDetail } from '../../data/marsSurfaceData';
import { Sun, Moon, Wind, Eye, Compass, Sparkles } from 'lucide-react';

interface MarsSurfaceSceneProps {
  surfaceData: MarsSurfaceDetail;
  className?: string;
  isDescending?: boolean;
  onSceneReady?: () => void;
  onDescentComplete?: () => void;
}

// ── Soft Organic Dust & Smoke Puff Canvas Textures (Eliminates Box Pixels) ─────

const createSoftDustTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 230, 195, 0.95)');
  grad.addColorStop(0.2, 'rgba(235, 140, 85, 0.75)');
  grad.addColorStop(0.45, 'rgba(195, 95, 50, 0.38)');
  grad.addColorStop(0.75, 'rgba(145, 55, 28, 0.10)');
  grad.addColorStop(1, 'rgba(95, 30, 15, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
};

const createSandGrainTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 245, 220, 1.0)');
  grad.addColorStop(0.35, 'rgba(225, 140, 90, 0.8)');
  grad.addColorStop(0.75, 'rgba(175, 75, 40, 0.25)');
  grad.addColorStop(1, 'rgba(120, 45, 20, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
};

export const MarsSurfaceScene: React.FC<MarsSurfaceSceneProps> = ({
  surfaceData,
  className = '',
  isDescending = false,
  onSceneReady,
  onDescentComplete,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [timeOfSol, setTimeOfSol] = useState<'day' | 'sunset' | 'night'>('day');
  const [isDustStormActive, setIsDustStormActive] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'firstPerson'>('orbit');
  const [descentNotification, setDescentNotification] = useState<boolean>(isDescending);

  // References to keep Three.js animation cycle updated without recreating WebGL context
  const timeOfSolRef = useRef<'day' | 'sunset' | 'night'>('day');
  const isDustStormRef = useRef<boolean>(false);
  const cameraModeRef = useRef<'orbit' | 'firstPerson'>('orbit');
  const isDescendingRef = useRef<boolean>(isDescending);
  const descentStartTimeRef = useRef<number>(performance.now());

  const sceneElementsRef = useRef<{
    sunLight?: THREE.DirectionalLight;
    ambientLight?: THREE.AmbientLight;
    skyMesh?: THREE.Mesh;
    fog?: THREE.FogExp2;
    domeLights?: THREE.PointLight[];
    dustParticles?: THREE.Points;
    saltationParticles?: THREE.Points;
    dustDevilGroup?: THREE.Group;
    dustDevilParticles?: THREE.Points;
    dustSheets?: THREE.Mesh[];
    strobeLights?: THREE.PointLight[];
    commsGroup?: THREE.Group;
    phobosMesh?: THREE.Mesh;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    shockwaveRing?: THREE.Mesh;
  }>({});

  useEffect(() => {
    timeOfSolRef.current = timeOfSol;
    updateLightingAndAtmosphere();
  }, [timeOfSol]);

  useEffect(() => {
    isDustStormRef.current = isDustStormActive;
    updateDustStormState();
  }, [isDustStormActive]);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
    updateCameraPosition();
  }, [cameraMode]);

  const updateLightingAndAtmosphere = () => {
    const { sunLight, ambientLight, fog, skyMesh, domeLights, phobosMesh } = sceneElementsRef.current;
    if (!sunLight || !ambientLight || !fog || !skyMesh) return;

    const isStorm = isDustStormRef.current;
    const currentSolTime = timeOfSolRef.current;

    if (currentSolTime === 'day') {
      // Midday: High Sun, warm salmon-tan Martian sky
      sunLight.position.set(40, 60, 30);
      sunLight.color.setHex(isStorm ? 0xdf7840 : 0xffecd0);
      sunLight.intensity = isStorm ? 0.35 : 2.2;
      ambientLight.color.setHex(isStorm ? 0x6e2c18 : 0xab5838);
      ambientLight.intensity = isStorm ? 0.65 : 0.85;

      fog.color.setHex(isStorm ? 0x7a2c16 : surfaceData.terrain3DConfig.skyColorHex);
      fog.density = isStorm ? 0.046 : (surfaceData.terrain3DConfig.fogDensity || 0.012);

      (skyMesh.material as THREE.MeshBasicMaterial).color.setHex(
        isStorm ? 0x6e2412 : surfaceData.terrain3DConfig.skyColorHex
      );

      if (domeLights) domeLights.forEach(l => (l.intensity = isStorm ? 2.2 : 0.8));
      if (phobosMesh) phobosMesh.visible = false;
    } else if (currentSolTime === 'sunset') {
      // Martian Blue Sunset: Low sun with iconic blue halo around disk
      sunLight.position.set(80, 5, -20);
      sunLight.color.setHex(isStorm ? 0x5a88c0 : 0x70b8ff);
      sunLight.intensity = isStorm ? 0.20 : 1.6;
      ambientLight.color.setHex(isStorm ? 0x4a1e16 : 0x5c2b22);
      ambientLight.intensity = 0.55;

      fog.color.setHex(isStorm ? 0x542016 : 0x6b3026);
      fog.density = isStorm ? 0.052 : 0.016;

      (skyMesh.material as THREE.MeshBasicMaterial).color.setHex(isStorm ? 0x3d1410 : 0x4a221d);

      if (domeLights) domeLights.forEach(l => (l.intensity = 2.8));
      if (phobosMesh) phobosMesh.visible = !isStorm;
    } else {
      // Frigid Martian Night: Deep cosmos, Phobos & stars, warm habitat interior
      sunLight.position.set(-30, -20, 20);
      sunLight.intensity = 0.02;
      ambientLight.color.setHex(isStorm ? 0x220c06 : 0x1a1224);
      ambientLight.intensity = 0.35;

      fog.color.setHex(isStorm ? 0x180806 : 0x060814);
      fog.density = isStorm ? 0.040 : 0.008;

      (skyMesh.material as THREE.MeshBasicMaterial).color.setHex(0x02040c);

      if (domeLights) domeLights.forEach(l => (l.intensity = 4.5));
      if (phobosMesh) phobosMesh.visible = !isStorm;
    }
  };

  const updateDustStormState = () => {
    const { dustParticles, saltationParticles, dustDevilGroup, dustSheets, strobeLights } = sceneElementsRef.current;
    const isStorm = isDustStormRef.current;

    if (dustParticles) dustParticles.visible = isStorm;
    if (saltationParticles) saltationParticles.visible = isStorm;
    if (dustDevilGroup) dustDevilGroup.visible = isStorm;
    if (dustSheets) dustSheets.forEach(s => (s.visible = isStorm));
    if (strobeLights) strobeLights.forEach(l => (l.visible = isStorm));

    updateLightingAndAtmosphere();
  };

  const updateCameraPosition = () => {
    const { camera, controls } = sceneElementsRef.current;
    if (!camera || !controls) return;

    if (cameraModeRef.current === 'firstPerson') {
      // Astronaut helmet eye level (1.8m above Martian surface, looking at habitat and horizon)
      camera.position.set(0, 1.8, 14);
      controls.target.set(0, 2.5, 0);
      controls.maxPolarAngle = Math.PI / 2 - 0.02; // Cannot look underground
      controls.minDistance = 2;
      controls.maxDistance = 25;
    } else {
      // Drone/Orbital survey vantage point
      camera.position.set(16, 12, 22);
      controls.target.set(0, 2, 0);
      controls.maxPolarAngle = Math.PI / 2 - 0.05;
      controls.minDistance = 6;
      controls.maxDistance = 65;
    }
    controls.update();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── 1. Scene, Camera, Renderer ─────────────────────────────────────────────
    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 900);
    if (isDescendingRef.current) {
      camera.position.set(0, 32, 38);
    } else {
      camera.position.set(16, 12, 22);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 2, 0);
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 5;
    controls.maxDistance = 75;

    // ── 2. Atmosphere & Sky Dome ───────────────────────────────────────────────
    const skyGeo = new THREE.SphereGeometry(400, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: surfaceData.terrain3DConfig.skyColorHex,
      side: THREE.BackSide,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // Exponential atmospheric distance haze
    const fog = new THREE.FogExp2(surfaceData.terrain3DConfig.skyColorHex, surfaceData.terrain3DConfig.fogDensity);
    scene.fog = fog;

    // ── 3. Lighting: Martian Sun & Ambient Scattering ───────────────────────────
    const sunLight = new THREE.DirectionalLight(0xffecd0, 2.2);
    sunLight.position.set(40, 60, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 160;
    sunLight.shadow.camera.left = -35;
    sunLight.shadow.camera.right = 35;
    sunLight.shadow.camera.top = 35;
    sunLight.shadow.camera.bottom = -35;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xab5838, 0.85);
    scene.add(ambientLight);

    // ── 4. Celestial Objects: Sun Disk & Phobos Moon ───────────────────────────
    const sunDiskMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sunDisk = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 16), sunDiskMat);
    sunDisk.position.set(120, 180, 90);
    scene.add(sunDisk);

    // Martian moon Phobos (irregular cratered potato)
    const phobosMat = new THREE.MeshStandardMaterial({ color: 0x888280, roughness: 0.95 });
    const phobosGeo = new THREE.SphereGeometry(2.8, 16, 12);
    const pPos = phobosGeo.attributes.position;
    for (let i = 0; i < pPos.count; i++) {
      const vx = pPos.getX(i);
      const vy = pPos.getY(i);
      const vz = pPos.getZ(i);
      pPos.setXYZ(i, vx * 1.35, vy * 0.9, vz * 1.1);
    }
    phobosGeo.computeVertexNormals();
    const phobosMesh = new THREE.Mesh(phobosGeo, phobosMat);
    phobosMesh.position.set(-140, 90, -80);
    phobosMesh.visible = false;
    scene.add(phobosMesh);

    // Starfield for night view
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 350;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) + 10;
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ── 5. Photorealistic Procedural Martian Terrain with Sand Ripples ─────────
    const terrainSize = 150;
    const terrainSegments = 140;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
    terrainGeo.rotateX(-Math.PI / 2);

    const positions = terrainGeo.attributes.position;
    const rimScale = surfaceData.terrain3DConfig.craterRimScale || 1.0;
    const isCanyon = surfaceData.terrain3DConfig.hasCanyonWalls;
    const isLavaTubes = surfaceData.terrain3DConfig.hasLavaTubes;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const distFromCenter = Math.sqrt(x * x + z * z);

      // Multi-octave natural Martian elevation displacement
      let elevation =
        Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.3 +
        Math.sin(x * 0.18 + 1.2) * Math.cos(z * 0.14) * 0.6 +
        Math.sin(x * 0.35) * Math.sin(z * 0.35) * 0.25;

      // Eolian sand ripple waves across the terrain (wavelength ~1.4m)
      const ripples = Math.sin(x * 1.6 + z * 0.8) * 0.08 + Math.cos(x * 0.8 - z * 1.4) * 0.05;
      elevation += ripples * (distFromCenter > 9 ? 1 : distFromCenter / 9);

      // Flatten the central clearing for the colony bio-dome (r < 14 meters)
      if (distFromCenter < 14) {
        const flatFactor = Math.max(0, (distFromCenter - 4) / 10);
        elevation *= flatFactor * 0.15;
      } else {
        if (isCanyon) {
          const wallDist = Math.abs(x);
          if (wallDist > 20) {
            elevation += Math.pow((wallDist - 20) * 0.45, 1.7) * 0.6;
          }
        } else if (isLavaTubes) {
          elevation += Math.sin(x * 0.12) * 2.8 * (distFromCenter / 40);
        } else {
          if (distFromCenter > 25) {
            elevation += Math.pow((distFromCenter - 25) * 0.12, 1.5) * rimScale;
          }
        }
      }

      positions.setY(i, elevation);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: surfaceData.terrain3DConfig.groundColorHex,
      roughness: surfaceData.terrain3DConfig.roughness || 0.92,
      metalness: 0.04,
      flatShading: false,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // ── 5B. Distant Perimeter Mountain Ridge & Crater Rim ─────────────────────
    const mountainRingGeo = new THREE.CylinderGeometry(155, 170, 52, 64, 4, true);
    const mPos = mountainRingGeo.attributes.position;
    for (let i = 0; i < mPos.count; i++) {
      const my = mPos.getY(i);
      const mx = mPos.getX(i);
      const mz = mPos.getZ(i);
      const angle = Math.atan2(mz, mx);
      const peakDeform =
        Math.sin(angle * 6) * 9 +
        Math.cos(angle * 13 + 1.2) * 6 +
        Math.sin(angle * 26) * 2.5;
      if (my > 0) {
        mPos.setY(i, my + peakDeform);
      }
    }
    mountainRingGeo.computeVertexNormals();
    const mountainMat = new THREE.MeshStandardMaterial({
      color: surfaceData.terrain3DConfig.groundColorHex,
      roughness: 0.95,
      metalness: 0.05,
      side: THREE.BackSide,
    });
    const mountainMesh = new THREE.Mesh(mountainRingGeo, mountainMat);
    mountainMesh.position.set(0, 14, 0);
    scene.add(mountainMesh);

    // ── 6. Natural Basalt Boulders Scattered on Terrain ───────────────────────
    const boulderCount =
      surfaceData.terrain3DConfig.boulderDensity === 'heavy' ? 75 : surfaceData.terrain3DConfig.boulderDensity === 'sparse' ? 24 : 45;
    const boulderGroup = new THREE.Group();

    for (let b = 0; b < boulderCount; b++) {
      const bRad = 0.35 + Math.random() * 0.95;
      const bGeo = new THREE.DodecahedronGeometry(bRad, 1);

      const bPos = bGeo.attributes.position;
      for (let j = 0; j < bPos.count; j++) {
        const noise = 1 + (Math.random() - 0.5) * 0.4;
        bPos.setXYZ(j, bPos.getX(j) * noise, bPos.getY(j) * noise * 0.8, bPos.getZ(j) * noise);
      }
      bGeo.computeVertexNormals();

      const bMat = new THREE.MeshStandardMaterial({
        color: surfaceData.terrain3DConfig.hasIceFrost && Math.random() > 0.6 ? 0x9e5f52 : 0x48241d,
        roughness: 0.95,
      });

      const boulder = new THREE.Mesh(bGeo, bMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 50;
      const bx = radius * Math.cos(angle);
      const bz = radius * Math.sin(angle);
      boulder.position.set(bx, 0.4, bz);
      boulder.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      boulder.castShadow = true;
      boulder.receiveShadow = true;
      boulderGroup.add(boulder);
    }
    scene.add(boulderGroup);

    // ── 7. Mars Farm Colony Bio-Dome Habitat Model ────────────────────────────
    const habitatGroup = new THREE.Group();

    // Main Geodesic Bio-Dome
    const domeRadius = 4.8;
    const domeGeo = new THREE.SphereGeometry(domeRadius, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0x90e8ff,
      transmission: 0.82,
      opacity: 0.92,
      transparent: true,
      roughness: 0.12,
      metalness: 0.05,
      ior: 1.48,
    });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.position.set(0, 0, 0);
    domeMesh.castShadow = true;
    habitatGroup.add(domeMesh);

    // Base Foundation Ring
    const ringGeo = new THREE.CylinderGeometry(domeRadius * 1.02, domeRadius * 1.05, 0.6, 24);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 0.3, 0);
    habitatGroup.add(ringMesh);

    // Glowing Hydroponic Crop Beds Inside Dome
    const cropBedGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.3, 16);
    const cropBedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const cropBed = new THREE.Mesh(cropBedGeo, cropBedMat);
    cropBed.position.set(0, 0.25, 0);
    habitatGroup.add(cropBed);

    // Glowing Crop Plants
    const plantCount = 28;
    const plantMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    for (let p = 0; p < plantCount; p++) {
      const pRad = 0.22 + Math.random() * 0.15;
      const plant = new THREE.Mesh(new THREE.DodecahedronGeometry(pRad, 0), plantMat);
      const theta = Math.random() * Math.PI * 2;
      const r = 0.8 + Math.random() * 2.4;
      plant.position.set(r * Math.cos(theta), 0.5, r * Math.sin(theta));
      habitatGroup.add(plant);
    }

    // Interior Lighting
    const interiorDomeLight = new THREE.PointLight(0x00ff9d, 1.8, 25);
    interiorDomeLight.position.set(0, 2.8, 0);
    habitatGroup.add(interiorDomeLight);

    const warmHabitatLight = new THREE.PointLight(0xffeedd, 1.2, 18);
    warmHabitatLight.position.set(0, 1.2, 0);
    habitatGroup.add(warmHabitatLight);

    // Airlock Pressurized Corridor
    const airlockGeo = new THREE.CylinderGeometry(1.1, 1.1, 3.2, 16);
    airlockGeo.rotateZ(Math.PI / 2);
    const airlockMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.3 });
    const airlock = new THREE.Mesh(airlockGeo, airlockMat);
    airlock.position.set(domeRadius + 0.8, 1.1, 0);
    airlock.castShadow = true;
    habitatGroup.add(airlock);

    // Outer Airlock Hatch Door
    const hatchGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.2, 16);
    hatchGeo.rotateZ(Math.PI / 2);
    const hatchMat = new THREE.MeshStandardMaterial({ color: 0xff4d2e, roughness: 0.4 });
    const hatch = new THREE.Mesh(hatchGeo, hatchMat);
    hatch.position.set(domeRadius + 2.4, 1.1, 0);
    habitatGroup.add(hatch);

    // Dual Solar Arrays
    const createSolarArray = (x: number, z: number, angle: number) => {
      const arrayGroup = new THREE.Group();
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 2.8, 12);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(0, 1.4, 0);
      pole.castShadow = true;
      arrayGroup.add(pole);

      const panelGeo = new THREE.BoxGeometry(4.2, 0.08, 2.2);
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x002244,
        roughness: 0.2,
        metalness: 0.9,
      });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(0, 2.8, 0);
      panel.rotation.set(0.35, angle, 0);
      panel.castShadow = true;
      arrayGroup.add(panel);

      arrayGroup.position.set(x, 0, z);
      return arrayGroup;
    };
    habitatGroup.add(createSolarArray(-9, 4, 0.2));
    habitatGroup.add(createSolarArray(-8, -6, -0.3));

    // Moisture Condenser Tower
    const towerGeo = new THREE.CylinderGeometry(0.6, 0.7, 4.5, 16);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(6, 2.25, -7);
    tower.castShadow = true;
    habitatGroup.add(tower);

    const coilGeo = new THREE.TorusGeometry(0.75, 0.08, 8, 24);
    coilGeo.rotateX(Math.PI / 2);
    const coilMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    for (let c = 0; c < 4; c++) {
      const coil = new THREE.Mesh(coilGeo, coilMat);
      coil.position.set(6, 1.5 + c * 0.7, -7);
      habitatGroup.add(coil);
    }

    scene.add(habitatGroup);

    // ── 7B. High-Gain Communications Satellite Dish ───────────────────────────
    const commsGroup = new THREE.Group();
    const mastGeo = new THREE.CylinderGeometry(0.12, 0.22, 5.2, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, 2.6, 0);
    commsGroup.add(mast);

    const dishGeo = new THREE.SphereGeometry(1.6, 24, 16, 0, Math.PI * 2, 0, Math.PI / 3);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.6,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.rotation.x = -Math.PI / 3;
    dish.position.set(0, 5.2, 0);
    commsGroup.add(dish);

    const hornGeo = new THREE.CylinderGeometry(0.04, 0.08, 1.1, 8);
    hornGeo.rotateX(Math.PI / 2);
    const hornMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.set(0, 5.4, 0.7);
    commsGroup.add(horn);

    commsGroup.position.set(-12, 0, -10);
    scene.add(commsGroup);

    // ── 7C. 6-Wheeled Martian Pressurized Exploration Rover ───────────────────
    const roverGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(2.4, 1.1, 3.4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 1.3, 0);
    body.castShadow = true;
    roverGroup.add(body);

    const roofGeo = new THREE.BoxGeometry(2.2, 0.08, 3.0);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.9, 0);
    roverGroup.add(roof);

    // 6 Rocker-Bogie Traction Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.4, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const wheelCoords = [
      [-1.4, 0.45, -1.2], [1.4, 0.45, -1.2],
      [-1.4, 0.45, 0.0],  [1.4, 0.45, 0.0],
      [-1.4, 0.45, 1.2],  [1.4, 0.45, 1.2],
    ];
    wheelCoords.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      wheel.castShadow = true;
      roverGroup.add(wheel);
    });

    // Dual Forward Searchlights
    const lightGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 12);
    lightGeo.rotateX(Math.PI / 2);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.7, 0.7].forEach(lx => {
      const headlight = new THREE.Mesh(lightGeo, lightMat);
      headlight.position.set(lx, 1.3, 1.75);
      roverGroup.add(headlight);
    });

    roverGroup.position.set(12, 0, 7.5);
    roverGroup.rotation.y = -Math.PI / 3.5;
    scene.add(roverGroup);

    // ── 7D. Life-Support Utility Conduits on Ground ───────────────────────────
    const conduitMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });

    const conduitCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(5.0, 0.12, 0),
      new THREE.Vector3(5.6, 0.12, -3.5),
      new THREE.Vector3(6.0, 0.12, -7.0),
    ]);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(conduitCurve1, 24, 0.14, 8, false), conduitMat));

    const conduitCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.8, 0.12, 1.0),
      new THREE.Vector3(-6.8, 0.12, 2.4),
      new THREE.Vector3(-9.0, 0.12, 4.0),
    ]);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(conduitCurve2, 24, 0.14, 8, false), conduitMat));

    // ── 7E. Authentic Martian Rover Twin Tire Tracks ─────────────────────────
    const trackGroup = new THREE.Group();
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x3d1711,
      roughness: 0.95,
      transparent: true,
      opacity: 0.72,
    });
    [-0.9, 0.9].forEach((offsetZ) => {
      const trackGeo = new THREE.PlaneGeometry(36, 0.35, 16);
      trackGeo.rotateX(-Math.PI / 2);
      const trackMesh = new THREE.Mesh(trackGeo, trackMat);
      trackMesh.position.set(20, 0.04, offsetZ);
      trackMesh.rotation.y = 0.08;
      trackGroup.add(trackMesh);
    });
    scene.add(trackGroup);

    // ── 7F. Horizon Atmospheric Dust Haze Ring (Mie Scattering) ───────────────
    const hazeGeo = new THREE.CylinderGeometry(70, 70, 18, 36, 1, true);
    const hazeMat = new THREE.MeshBasicMaterial({
      color: surfaceData.terrain3DConfig.skyColorHex,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const hazeMesh = new THREE.Mesh(hazeGeo, hazeMat);
    hazeMesh.position.set(0, 8, 0);
    scene.add(hazeMesh);

    // ── 7G. Touchdown Shockwave Reticle Ring ──────────────────────────────────
    const shockwaveGeo = new THREE.RingGeometry(0.8, 1.4, 32);
    shockwaveGeo.rotateX(-Math.PI / 2);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isDescendingRef.current ? 0.9 : 0.4,
    });
    const shockwaveRing = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveRing.position.set(0, 0.08, 0);
    scene.add(shockwaveRing);

    // ── 7H. Habitat Dust-Storm Warning Strobe Beacons ─────────────────────────
    const strobe1 = new THREE.PointLight(0xff6600, 0, 40);
    strobe1.position.set(0, domeRadius + 0.6, 0);
    strobe1.visible = false;
    scene.add(strobe1);

    const strobe2 = new THREE.PointLight(0xffaa00, 0, 30);
    strobe2.position.set(domeRadius + 2.4, 2.4, 0);
    strobe2.visible = false;
    scene.add(strobe2);

    // ── 8. Real Volumetric Organic Dust Storm (No Box Pixels) ──────────────────
    const softDustTexture = createSoftDustTexture();
    const sandGrainTexture = createSandGrainTexture();

    // 8A. Atmospheric Billowing Dust Cloud Plumes
    const dustCount = 2200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustVel: { x: number; y: number; z: number }[] = [];

    for (let d = 0; d < dustCount; d++) {
      dustPos[d * 3] = (Math.random() - 0.5) * 110;
      dustPos[d * 3 + 1] = 0.5 + Math.random() * 32;
      dustPos[d * 3 + 2] = (Math.random() - 0.5) * 110;
      dustVel.push({
        x: -0.65 - Math.random() * 0.9, // High-velocity Martian westward gale
        y: (Math.random() - 0.5) * 0.06,
        z: (Math.random() - 0.5) * 0.25,
      });
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      map: softDustTexture,
      color: surfaceData.terrain3DConfig.dustStormColorHex,
      size: 4.8,
      transparent: true,
      opacity: 0.56,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    dustParticles.visible = false;
    scene.add(dustParticles);

    // 8B. Ground-Level Saltation Sand Drift (Fast surface sand particles)
    const saltationCount = 1400;
    const saltGeo = new THREE.BufferGeometry();
    const saltPos = new Float32Array(saltationCount * 3);
    const saltVel: { x: number; y: number; z: number }[] = [];

    for (let s = 0; s < saltationCount; s++) {
      saltPos[s * 3] = (Math.random() - 0.5) * 90;
      saltPos[s * 3 + 1] = 0.1 + Math.random() * 2.4;
      saltPos[s * 3 + 2] = (Math.random() - 0.5) * 90;
      saltVel.push({
        x: -1.2 - Math.random() * 1.0,
        y: (Math.random() - 0.5) * 0.03,
        z: (Math.random() - 0.5) * 0.15,
      });
    }
    saltGeo.setAttribute('position', new THREE.BufferAttribute(saltPos, 3));
    const saltMat = new THREE.PointsMaterial({
      map: sandGrainTexture,
      color: 0xc86438,
      size: 1.4,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const saltationParticles = new THREE.Points(saltGeo, saltMat);
    saltationParticles.visible = false;
    scene.add(saltationParticles);

    // 8C. Swirling Martian Dust Devil (Vortex Funnel in background)
    const devilGroup = new THREE.Group();
    devilGroup.position.set(-28, 0, 24);
    const devilCount = 450;
    const devilGeo = new THREE.BufferGeometry();
    const devilPos = new Float32Array(devilCount * 3);
    const devilMeta: { y: number; baseAngle: number; speed: number }[] = [];

    for (let v = 0; v < devilCount; v++) {
      const y = Math.random() * 18;
      const baseAngle = Math.random() * Math.PI * 2;
      const radius = 0.6 + y * 0.35; // Expands outward as height increases
      devilPos[v * 3] = radius * Math.cos(baseAngle);
      devilPos[v * 3 + 1] = y;
      devilPos[v * 3 + 2] = radius * Math.sin(baseAngle);
      devilMeta.push({ y, baseAngle, speed: 2.2 + Math.random() * 1.5 });
    }
    devilGeo.setAttribute('position', new THREE.BufferAttribute(devilPos, 3));
    const devilMat = new THREE.PointsMaterial({
      map: softDustTexture,
      color: 0xba5432,
      size: 3.4,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    });
    const devilParticles = new THREE.Points(devilGeo, devilMat);
    devilGroup.add(devilParticles);
    devilGroup.visible = false;
    scene.add(devilGroup);

    // 8D. Drifting Volumetric Wind Sheets
    const dustSheets: THREE.Mesh[] = [];
    const sheetGeo = new THREE.PlaneGeometry(35, 12);
    sheetGeo.rotateY(Math.PI / 2);
    const sheetMat = new THREE.MeshBasicMaterial({
      map: softDustTexture,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    for (let sh = 0; sh < 3; sh++) {
      const sheet = new THREE.Mesh(sheetGeo, sheetMat);
      sheet.position.set((sh - 1) * 25, 4 + sh * 1.5, (Math.random() - 0.5) * 30);
      sheet.visible = false;
      scene.add(sheet);
      dustSheets.push(sheet);
    }

    // Store references for runtime reactive updates
    sceneElementsRef.current = {
      sunLight,
      ambientLight,
      skyMesh,
      fog,
      domeLights: [interiorDomeLight, warmHabitatLight],
      dustParticles,
      saltationParticles,
      dustDevilGroup: devilGroup,
      dustDevilParticles: devilParticles,
      dustSheets,
      strobeLights: [strobe1, strobe2],
      commsGroup,
      phobosMesh,
      camera,
      controls,
      shockwaveRing,
    };

    onSceneReady?.();

    // ── 9. Animation Render Loop ──────────────────────────────────────────────
    let rafId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Slowly orbit Phobos across the sky
      if (phobosMesh && phobosMesh.visible) {
        phobosMesh.position.x = 140 * Math.cos(elapsed * 0.04);
        phobosMesh.position.y = 85 + 25 * Math.sin(elapsed * 0.04);
        phobosMesh.position.z = 140 * Math.sin(elapsed * 0.04);
      }

      // Slowly steer communications satellite dish
      if (commsGroup) {
        commsGroup.rotation.y = Math.sin(elapsed * 0.12) * 0.35;
      }

      // Animate Realistic Volumetric Dust Storm
      if (isDustStormRef.current) {
        // Pulse safety warning strobes
        if (strobe1 && strobe2) {
          const isStrobeOn = Math.sin(elapsed * 9) > 0.35;
          const strobeIntensity = isStrobeOn ? 5.0 : 0;
          strobe1.intensity = strobeIntensity;
          strobe2.intensity = strobeIntensity;
        }

        // A. Atmospheric billows
        if (dustParticles) {
          const posAttr = dustParticles.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < dustCount; i++) {
            let x = posAttr.getX(i) + dustVel[i].x;
            let y = posAttr.getY(i) + dustVel[i].y + Math.sin(x * 0.2 + elapsed * 2) * 0.04;
            let z = posAttr.getZ(i) + dustVel[i].z;

            if (x < -55) x = 55;
            if (y < 0.3) y = 28;
            if (y > 32) y = 0.5;
            if (z < -55) z = 55;
            if (z > 55) z = -55;

            posAttr.setXYZ(i, x, y, z);
          }
          posAttr.needsUpdate = true;
        }

        // B. Ground saltation sand drift
        if (saltationParticles) {
          const saltAttr = saltationParticles.geometry.attributes.position as THREE.BufferAttribute;
          for (let s = 0; s < saltationCount; s++) {
            let x = saltAttr.getX(s) + saltVel[s].x;
            let y = saltAttr.getY(s) + saltVel[s].y;
            let z = saltAttr.getZ(s) + saltVel[s].z;

            if (x < -45) x = 45;
            if (y < 0.08) y = 2.2;
            if (y > 2.5) y = 0.1;
            if (z < -45) z = 45;
            if (z > 45) z = -45;

            saltAttr.setXYZ(s, x, y, z);
          }
          saltAttr.needsUpdate = true;
        }

        // C. Swirling Dust Devil
        if (devilParticles && devilGroup) {
          devilGroup.rotation.y += 0.06;
          const dAttr = devilParticles.geometry.attributes.position as THREE.BufferAttribute;
          for (let v = 0; v < devilCount; v++) {
            const meta = devilMeta[v];
            const currentAngle = meta.baseAngle + elapsed * meta.speed;
            const r = 0.6 + meta.y * 0.35;
            dAttr.setXYZ(v, r * Math.cos(currentAngle), meta.y, r * Math.sin(currentAngle));
          }
          dAttr.needsUpdate = true;
        }

        // D. Drifting dust sheets
        dustSheets.forEach((sheet, idx) => {
          sheet.position.x -= (0.5 + idx * 0.2);
          if (sheet.position.x < -60) sheet.position.x = 60;
        });
      }

      // Smooth descent camera transition when entering from orbit
      if (isDescendingRef.current) {
        const elapsedDescent = performance.now() - descentStartTimeRef.current;
        const dur = 2400;
        const rawT = Math.min(1, elapsedDescent / dur);
        const easeOutT = 1 - Math.pow(1 - rawT, 3);

        const startPos = new THREE.Vector3(0, 32, 38);
        const endPos = new THREE.Vector3(16, 12, 22);
        camera.position.lerpVectors(startPos, endPos, easeOutT);
        controls.target.set(0, 2, 0);

        if (shockwaveRing) {
          const sScale = 1 + easeOutT * 10;
          shockwaveRing.scale.set(sScale, sScale, sScale);
          (shockwaveRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 * (1 - easeOutT));
        }

        if (rawT >= 1) {
          isDescendingRef.current = false;
          onDescentComplete?.();
          setTimeout(() => setDescentNotification(false), 3500);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [surfaceData]);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Touchdown EDL Confirmed Banner */}
      {descentNotification && (
        <div className="absolute top-4 left-4 z-20 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="px-4 py-2.5 rounded-xl bg-black/90 backdrop-blur-md border border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                EDL SEQUENCE COMPLETE // TOUCHDOWN CONFIRMED
              </p>
              <p className="text-xs font-bold font-display text-white">
                {surfaceData.name.toUpperCase()} · SOL 1 EXPLORATION ACTIVE
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Surface Controls Floating Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Time of Sol (Day / Sunset / Night) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-space-950/85 backdrop-blur-md border border-slate-800 shadow-xl">
          <button
            onClick={() => setTimeOfSol('day')}
            className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              timeOfSol === 'day'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Martian Midday (Sol 12:00) · 175 W/m²"
          >
            <Sun className="w-4 h-4" />
            <span className="hidden sm:inline">Midday</span>
          </button>
          <button
            onClick={() => setTimeOfSol('sunset')}
            className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              timeOfSol === 'sunset'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Martian Blue Sunset (Sol 18:30) · Authentic NASA blue halo"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Sunset</span>
          </button>
          <button
            onClick={() => setTimeOfSol('night')}
            className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              timeOfSol === 'night'
                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Frigid Martian Night (Sol 23:00) · -88°C, Phobos rising"
          >
            <Moon className="w-4 h-4" />
            <span className="hidden sm:inline">Night</span>
          </button>
        </div>

        {/* Dust Storm Simulation Toggle */}
        <button
          onClick={() => setIsDustStormActive(!isDustStormActive)}
          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono backdrop-blur-md border transition-all ${
            isDustStormActive
              ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.35)] animate-pulse'
              : 'bg-space-950/85 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
          title="Simulate active Martian global dust squall (Optical Depth Tau > 3.0)"
        >
          <div className="flex items-center gap-2">
            <Wind className={`w-4 h-4 ${isDustStormActive ? 'text-red-400 animate-spin' : 'text-slate-400'}`} />
            <span>Dust Storm</span>
          </div>
          <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-black/50 font-bold">
            {isDustStormActive ? 'TAU 3.2' : 'CLEAR'}
          </span>
        </button>

        {/* Camera Perspective Mode (Drone Orbit vs First-Person Astronaut) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-space-950/85 backdrop-blur-md border border-slate-800 shadow-xl">
          <button
            onClick={() => setCameraMode('orbit')}
            className={`flex-1 p-2 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
              cameraMode === 'orbit'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Drone Survey View (Orbit around colony)"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Drone Orbit</span>
          </button>
          <button
            onClick={() => setCameraMode('firstPerson')}
            className={`flex-1 p-2 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
              cameraMode === 'firstPerson'
                ? 'bg-mars-950/80 text-mars-300 border border-mars-500/50 shadow-[0_0_10px_rgba(255,77,46,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Astronaut Eye Level (1.8m surface perspective)"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Astronaut POV</span>
          </button>
        </div>
      </div>

      {/* Bottom Surface Telemetry HUD Banner */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none max-w-[90vw]">
        <div className="px-3.5 py-2 rounded-xl bg-space-950/90 backdrop-blur-md border border-slate-800/90 text-xs font-mono text-slate-300 shadow-xl flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bio-400 animate-ping" />
            <span className="text-white font-bold">{surfaceData.name}</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300">{surfaceData.coordinates}</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-300">{surfaceData.elevation}</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Pressure: <strong className="text-slate-200">{surfaceData.atmosphericPressureKpa} kPa</strong>
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">
            Ice Table: <strong className="text-blue-300">{surfaceData.waterIceDepthMeters}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
