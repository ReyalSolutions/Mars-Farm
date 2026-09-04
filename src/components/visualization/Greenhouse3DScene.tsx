import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CropAllocation } from '../../types';
import { CROPS_DATA } from '../../data/cropsData';

interface Greenhouse3DSceneProps {
  allocations: CropAllocation[];
  cropGrowthProgress?: Record<string, number>;
  cropHealthStatus?: Record<string, number>;
  activeEventTitle?: string;
  solDay?: number;
  ledMode?: 'VEGGIE_MAGENTA' | 'INSPECTION_WHITE' | 'LOW_POWER_AMBER';
  mistActive?: boolean;
  selectedCropId?: string | null;
  onSelectCrop?: (cropId: string) => void;
  onResetCrop?: () => void;
  className?: string;
}

export const Greenhouse3DScene: React.FC<Greenhouse3DSceneProps> = ({
  allocations,
  cropGrowthProgress = {},
  cropHealthStatus = {},
  activeEventTitle,
  solDay = 1,
  ledMode = 'VEGGIE_MAGENTA',
  mistActive = false,
  selectedCropId = null,
  onSelectCrop,
  onResetCrop,
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredCrop, setHoveredCrop] = useState<string | null>(null);

  // References to dynamic Three.js objects
  const selectedCropIdRef = useRef<string | null>(selectedCropId);
  const activeEventTitleRef = useRef<string | undefined>(activeEventTitle);
  const solDayRef = useRef<number>(solDay);
  const trayPositionsRef = useRef<{ [cropId: string]: THREE.Vector3 }>({});
  const plantMeshesRef = useRef<{ [cropId: string]: THREE.Group[] }>({});
  const ledLightsRef = useRef<THREE.PointLight[]>([]);
  const alarmLightRef = useRef<THREE.PointLight | null>(null);
  const mistParticlesRef = useRef<THREE.Points | null>(null);
  const dustStormParticlesRef = useRef<THREE.Points | null>(null);
  const domeMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  const isMartianDay = solDay % 2 === 0;
  const isDustStorm = Boolean(activeEventTitle?.toLowerCase().includes('dust'));

  useEffect(() => {
    selectedCropIdRef.current = selectedCropId || null;
  }, [selectedCropId]);

  useEffect(() => {
    activeEventTitleRef.current = activeEventTitle;
  }, [activeEventTitle]);

  useEffect(() => {
    solDayRef.current = solDay;
  }, [solDay]);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 340;

    const isInitialDay = solDay % 2 === 0;
    const isInitialDust = activeEventTitle?.toLowerCase().includes('dust');

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isInitialDust ? 0x280803 : isInitialDay ? 0x1f0b07 : 0x030712);
    scene.fog = new THREE.FogExp2(isInitialDust ? 0x2c0b04 : isInitialDay ? 0x1a0907 : 0x050814, isInitialDust ? 0.065 : 0.022);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 6.5);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig: Martian Sun + Internal Hydroponic LEDs + Emergency Alarm Beacon
    const ambientLight = new THREE.AmbientLight(0xffffff, isInitialDust ? 0.2 : isInitialDay ? 0.45 : 0.12);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(isInitialDust ? 0xd97706 : isInitialDay ? 0xfff1e6 : 0x38bdf8, isInitialDust ? 0.45 : isInitialDay ? 2.2 : 0.3);
    sunLight.position.set(8, 12, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Emergency flashing alarm beacon on dome ceiling ring for hazards
    const alarmBeacon = new THREE.PointLight(0xef4444, 0, 14, 1.4);
    alarmBeacon.position.set(0, 3.4, 0);
    scene.add(alarmBeacon);
    alarmLightRef.current = alarmBeacon;

    // Internal LED strip lighting fixtures overhead
    const ledColor = ledMode === 'VEGGIE_MAGENTA' ? 0xd946ef : ledMode === 'INSPECTION_WHITE' ? 0x00f0ff : 0xf59e0b;
    const led1 = new THREE.PointLight(ledColor, 3.5, 9, 1.2);
    led1.position.set(-1.2, 2.4, 0);
    scene.add(led1);

    const led2 = new THREE.PointLight(ledColor, 3.5, 9, 1.2);
    led2.position.set(1.2, 2.4, 0);
    scene.add(led2);
    ledLightsRef.current = [led1, led2];

    // 3. Terrain & Environment
    const groundGeo = new THREE.PlaneGeometry(35, 35, 24, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x993d24,
      roughness: 0.95,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Distant Martian crater rim / mountains
    const ridgeGeo = new THREE.CylinderGeometry(14, 14, 2.5, 32, 1, true);
    const ridgeMat = new THREE.MeshBasicMaterial({ color: 0x5a180a, side: THREE.BackSide });
    const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridge.position.y = 1;
    scene.add(ridge);

    // 4. Geodesic Dome Structure
    const baseRingGeo = new THREE.CylinderGeometry(3.6, 3.65, 0.3, 32);
    const baseRingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRing.position.y = 0.1;
    scene.add(baseRing);

    const domeGeo = new THREE.SphereGeometry(3.6, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.28,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.45,
      side: THREE.DoubleSide
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.25;
    scene.add(dome);
    domeMaterialRef.current = domeMat;

    const wireframeGeo = new THREE.WireframeGeometry(domeGeo);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.3 });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    wireframe.position.y = 0.25;
    scene.add(wireframe);

    const floorGeo = new THREE.CircleGeometry(3.5, 32);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // ===== REALISTIC PROCEDURAL PLANT BUILDERS =====
    // Shared helpers
    const mkLeaf = (len: number, wid: number): THREE.BufferGeometry => {
      const s = new THREE.Shape();
      s.moveTo(0, 0);
      s.bezierCurveTo(wid * 1.1, len * 0.15, wid, len * 0.72, 0, len);
      s.bezierCurveTo(-wid, len * 0.72, -wid * 1.1, len * 0.15, 0, 0);
      return new THREE.ShapeGeometry(s, 6);
    };
    const dsMat = (col: number, rgh = 0.75): THREE.MeshStandardMaterial =>
      new THREE.MeshStandardMaterial({ color: col, roughness: rgh, metalness: 0, side: THREE.DoubleSide });
    const cylGeo = (h: number, rt = 0.007, rb = 0.011): THREE.BufferGeometry =>
      new THREE.CylinderGeometry(rt, rb, h, 5, 1);
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    // LETTUCE — layered rosette with bezier leaf shapes
    const buildLettuce = (v: number): THREE.Group => {
      const g = new THREE.Group();
      [
        { n: 6,  r: 0.014, tilt: 0.18, len: 0.052, w: 0.026, col: 0xcaec7e },
        { n: 9,  r: 0.046, tilt: 0.42, len: 0.082, w: 0.038, col: 0x90c650 },
        { n: 11, r: 0.086, tilt: 0.62, len: 0.108, w: 0.05,  col: 0x64a22a },
        { n: 12, r: 0.128, tilt: 0.78, len: 0.128, w: 0.06,  col: 0x4f8222 },
      ].forEach((l, li) => {
        const geo = mkLeaf(l.len, l.w);
        const mat = dsMat(l.col);
        for (let i = 0; i < l.n; i++) {
          const a = (i / l.n) * Math.PI * 2 + li * 0.43;
          const leaf = new THREE.Mesh(geo, mat);
          leaf.position.set(Math.cos(a) * l.r, 0.005 + li * 0.007, Math.sin(a) * l.r);
          leaf.rotation.order = 'YXZ';
          leaf.rotation.y = a;
          leaf.rotation.x = -(Math.PI * 0.5 - l.tilt);
          leaf.rotation.z = rnd(-0.22, 0.22);
          g.add(leaf);
        }
      });
      const bud = new THREE.Mesh(new THREE.SphereGeometry(0.022, 5, 4), dsMat(0xddf29e));
      bud.position.y = 0.028;
      g.add(bud);
      g.scale.setScalar(v);
      return g;
    };

    // POTATO — multi-stem compound pinnate leaves
    const buildPotato = (v: number): THREE.Group => {
      const g = new THREE.Group();
      const smMat = new THREE.MeshStandardMaterial({ color: 0x4a7c30, roughness: 0.8 });
      for (let s = 0; s < 3; s++) {
        const ba = (s / 3) * Math.PI * 2 + rnd(0, 0.4);
        const sH = rnd(0.24, 0.33);
        const stem = new THREE.Mesh(cylGeo(sH, 0.006, 0.011), smMat);
        stem.position.set(Math.cos(ba) * 0.024, sH / 2, Math.sin(ba) * 0.024);
        stem.rotation.z = Math.cos(ba) * 0.13;
        stem.rotation.x = Math.sin(ba) * 0.13;
        g.add(stem);
        for (let nd = 0; nd < 3; nd++) {
          const nh = sH * (0.32 + nd * 0.3);
          const nGrp = new THREE.Group();
          nGrp.position.set(Math.cos(ba) * 0.024, nh, Math.sin(ba) * 0.024);
          const lfN = nd === 2 ? 5 : 3;
          for (let lf = 0; lf < lfN; lf++) {
            const la = ba + (lf / lfN) * Math.PI * 2 + nd * 0.4;
            const ll = rnd(0.04, 0.062);
            const leaf = new THREE.Mesh(mkLeaf(ll, ll * 0.55), dsMat(nd % 2 === 0 ? 0x3a7a1e : 0x4d8a28));
            leaf.position.set(Math.cos(la) * 0.028, 0, Math.sin(la) * 0.028);
            leaf.rotation.y = la;
            leaf.rotation.x = -(Math.PI * 0.31 - nd * 0.06);
            nGrp.add(leaf);
          }
          g.add(nGrp);
        }
      }
      g.scale.setScalar(v);
      return g;
    };

    // TOMATO — arching stem, compound leaves, red fruit clusters with calyx
    const buildTomato = (v: number): THREE.Group => {
      const g = new THREE.Group();
      const smMat = new THREE.MeshStandardMaterial({ color: 0x3d6b1e, roughness: 0.8 });
      const mainH = 0.42;
      const mainStem = new THREE.Mesh(cylGeo(mainH, 0.009, 0.013), smMat);
      mainStem.position.y = mainH / 2;
      mainStem.rotation.z = rnd(-0.07, 0.07);
      g.add(mainStem);
      [0.12, 0.24, 0.36].forEach((h, idx) => {
        const baseA = idx * (Math.PI * 2 / 3) + 0.3;
        const pet = new THREE.Mesh(cylGeo(0.06, 0.003, 0.005), smMat);
        pet.position.set(Math.cos(baseA) * 0.03, h - 0.02, Math.sin(baseA) * 0.03);
        pet.rotation.z = Math.cos(baseA) * 0.5;
        g.add(pet);
        for (let lf = 0; lf < 5; lf++) {
          const isT = lf === 0;
          const ll = isT ? 0.074 : rnd(0.04, 0.054);
          const la = baseA + (isT ? 0 : (lf % 2 === 0 ? 0.84 : -0.84) * Math.ceil(lf / 2));
          const ofs = isT ? 0.064 : 0.026 + Math.ceil(lf / 2) * 0.036;
          const leaf = new THREE.Mesh(mkLeaf(ll, ll * 0.52), dsMat(0x2e6b12));
          leaf.position.set(Math.cos(la) * ofs, h, Math.sin(la) * ofs);
          leaf.rotation.y = la;
          leaf.rotation.x = -(Math.PI * 0.27 + idx * 0.04);
          g.add(leaf);
        }
      });
      const branch = new THREE.Mesh(cylGeo(0.14, 0.006, 0.009), smMat);
      branch.position.set(0.04, 0.2, 0.03);
      branch.rotation.z = 0.65;
      g.add(branch);
      const frMat = new THREE.MeshStandardMaterial({ color: 0xcc2820, roughness: 0.38, metalness: 0.04 });
      for (let f = 0; f < 4; f++) {
        const fa = (f / 4) * Math.PI * 2;
        const fruit = new THREE.Mesh(new THREE.SphereGeometry(rnd(0.022, 0.032), 8, 7), frMat);
        fruit.position.set(Math.cos(fa) * 0.054, 0.26 + rnd(0, 0.08), Math.sin(fa) * 0.054);
        fruit.scale.y = rnd(0.86, 0.96);
        g.add(fruit);
        for (let c = 0; c < 5; c++) {
          const calyx = new THREE.Mesh(mkLeaf(0.013, 0.004), dsMat(0x2d6b0e));
          calyx.position.copy(fruit.position);
          calyx.position.y += 0.026;
          calyx.rotation.y = (c / 5) * Math.PI * 2;
          calyx.rotation.x = -(Math.PI * 0.38);
          g.add(calyx);
        }
      }
      g.scale.setScalar(v);
      return g;
    };

    // WHEAT — hollow culm, strap leaves, realistic spike with awns
    const buildWheat = (v: number): THREE.Group => {
      const g = new THREE.Group();
      const sH = rnd(0.44, 0.52);
      const smMat = new THREE.MeshStandardMaterial({ color: 0x7a9a3c, roughness: 0.85 });
      const stem = new THREE.Mesh(cylGeo(sH, 0.005, 0.008), smMat);
      stem.position.y = sH / 2;
      stem.rotation.z = rnd(-0.06, 0.06);
      g.add(stem);
      ([[sH * 0.25, 0], [sH * 0.52, Math.PI]] as [number, number][]).forEach(([h, side]) => {
        const lShape = new THREE.Shape();
        lShape.moveTo(0, 0);
        lShape.bezierCurveTo(0.028, 0.04, 0.022, 0.11, 0, 0.19);
        lShape.bezierCurveTo(-0.018, 0.11, -0.022, 0.04, 0, 0);
        const leaf = new THREE.Mesh(new THREE.ShapeGeometry(lShape, 4), dsMat(0x7aaa38));
        leaf.position.set(0, h, 0);
        leaf.rotation.y = side;
        leaf.rotation.x = -0.38;
        g.add(leaf);
      });
      const eH = 0.13;
      const earMat = new THREE.MeshStandardMaterial({ color: 0xc8a847, roughness: 0.9 });
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.01, eH, 6), earMat);
      ear.position.y = sH + eH / 2;
      ear.rotation.z = rnd(-0.06, 0.06);
      g.add(ear);
      for (let i = 0; i < 9; i++) {
        const sA = (i / 9) * Math.PI * 2;
        const sY = sH + 0.015 + i * (eH / 9);
        const sp = new THREE.Mesh(new THREE.SphereGeometry(0.009, 5, 4), new THREE.MeshStandardMaterial({ color: 0xb49030, roughness: 0.9 }));
        sp.position.set(Math.cos(sA) * 0.012, sY, Math.sin(sA) * 0.012);
        sp.scale.y = 1.7;
        g.add(sp);
        const awn = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.001, 0.06, 3), new THREE.MeshStandardMaterial({ color: 0xa07820 }));
        awn.position.set(sp.position.x, sY + 0.038, sp.position.z);
        awn.rotation.z = sA > Math.PI ? 0.18 : -0.18;
        g.add(awn);
      }
      g.scale.setScalar(v);
      return g;
    };

    // SOYBEAN — branching stem, trifoliate leaves, oval pods
    const buildSoybean = (v: number): THREE.Group => {
      const g = new THREE.Group();
      const smMat = new THREE.MeshStandardMaterial({ color: 0x5a8028, roughness: 0.8 });
      const mainH = 0.34;
      const mainStem = new THREE.Mesh(cylGeo(mainH, 0.008, 0.012), smMat);
      mainStem.position.y = mainH / 2;
      g.add(mainStem);
      [0.09, 0.19, 0.3].forEach((h, ni) => {
        const na = ni * (Math.PI * 2 / 3) + 0.6;
        const pet = new THREE.Mesh(cylGeo(0.055, 0.003, 0.005), smMat);
        pet.position.set(Math.cos(na) * 0.022, h, Math.sin(na) * 0.022);
        pet.rotation.z = Math.cos(na) * 0.55;
        pet.rotation.x = Math.sin(na) * 0.55;
        g.add(pet);
        for (let lf = 0; lf < 3; lf++) {
          const la = na + (lf === 0 ? 0 : lf === 1 ? 0.72 : -0.72);
          const ll = lf === 0 ? rnd(0.058, 0.068) : rnd(0.046, 0.056);
          const leaf = new THREE.Mesh(mkLeaf(ll, ll * 0.65), dsMat(ni % 2 === 0 ? 0x3d7a1c : 0x4c8f24));
          leaf.position.set(Math.cos(la) * (lf === 0 ? 0.06 : 0.05), h + 0.032, Math.sin(la) * (lf === 0 ? 0.06 : 0.05));
          leaf.rotation.y = la;
          leaf.rotation.x = -(Math.PI * 0.26);
          g.add(leaf);
        }
        if (ni > 0) {
          for (let p = 0; p < 2; p++) {
            const pa = na + p * 1.2 + 1.0;
            // Pod: elongated sphere (no CapsuleGeometry needed)
            const podMesh = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 5), new THREE.MeshStandardMaterial({ color: 0x8aba42, roughness: 0.7 }));
            podMesh.position.set(Math.cos(pa) * 0.04, h + rnd(-0.01, 0.01), Math.sin(pa) * 0.04);
            podMesh.scale.set(0.7, 3.2, 0.7);
            podMesh.rotation.z = pa * 0.4;
            g.add(podMesh);
          }
        }
      });
      g.scale.setScalar(v);
      return g;
    };

    // CARROT — feathery pinnate fronds with white umbel flowers
    const buildCarrot = (v: number): THREE.Group => {
      const g = new THREE.Group();
      const petMat = new THREE.MeshStandardMaterial({ color: 0x6aaa2a, roughness: 0.82 });
      for (let f = 0; f < 7; f++) {
        const ba = (f / 7) * Math.PI * 2 + rnd(0, 0.35);
        const fH = rnd(0.22, 0.32);
        const pet = new THREE.Mesh(cylGeo(fH * 0.48, 0.003, 0.005), petMat);
        pet.position.set(Math.cos(ba) * 0.015, fH * 0.24, Math.sin(ba) * 0.015);
        pet.rotation.z = Math.cos(ba) * 0.62;
        pet.rotation.x = Math.sin(ba) * 0.62;
        g.add(pet);
        for (let lf = 0; lf < 6; lf++) {
          const side = lf % 2 === 0 ? 1 : -1;
          const la = ba + side * (Math.PI * 0.42 + rnd(0, 0.1));
          const lfH = (lf / 6) * fH * 0.82;
          const ll = rnd(0.026, 0.04) * (1 - lf * 0.07);
          const leaf = new THREE.Mesh(mkLeaf(ll, ll * 0.38), dsMat(0x5aaa22));
          leaf.position.set(
            Math.cos(ba) * (0.015 + lfH * 0.28) + Math.cos(la) * 0.018,
            lfH,
            Math.sin(ba) * (0.015 + lfH * 0.28) + Math.sin(la) * 0.018
          );
          leaf.rotation.y = la;
          leaf.rotation.x = -(Math.PI * 0.33);
          leaf.scale.setScalar(rnd(0.7, 1.1));
          g.add(leaf);
        }
        if (rnd(0, 1) > 0.45) {
          const flower = new THREE.Mesh(new THREE.SphereGeometry(0.013, 5, 4), new THREE.MeshStandardMaterial({ color: 0xf0f4e0, roughness: 0.5, emissive: 0x888800, emissiveIntensity: 0.06 }));
          flower.position.set(Math.cos(ba) * (0.015 + fH * 0.26), fH + 0.018, Math.sin(ba) * (0.015 + fH * 0.26));
          g.add(flower);
        }
      }
      g.scale.setScalar(v);
      return g;
    };

    const buildRealisticPlant = (cropId: string, growth: number): THREE.Group => {
      switch (cropId) {
        case 'lettuce': return buildLettuce(growth);
        case 'potato':  return buildPotato(growth);
        case 'tomato':  return buildTomato(growth);
        case 'wheat':   return buildWheat(growth);
        case 'soybean': return buildSoybean(growth);
        case 'carrot':  return buildCarrot(growth);
        default:        return buildLettuce(growth);
      }
    };

    // 5. Build 6 Interactive Hydroponic Grow Trays
    const raycastObjects: THREE.Object3D[] = [];
    plantMeshesRef.current = {};

    const trayLayout = [
      { id: 'potato', x: -1.8, z: -0.9, color: 0x854d0e },
      { id: 'lettuce', x: 0, z: -0.9, color: 0x16a34a },
      { id: 'tomato', x: 1.8, z: -0.9, color: 0xdc2626 },
      { id: 'wheat', x: -1.8, z: 1.1, color: 0xeab308 },
      { id: 'soybean', x: 0, z: 1.1, color: 0x15803d },
      { id: 'carrot', x: 1.8, z: 1.1, color: 0xea580c },
    ];

    trayLayout.forEach((trayInfo) => {
      const cropDef = CROPS_DATA.find(c => c.id === trayInfo.id);
      const isAllocated = allocations.some(a => a.cropId === trayInfo.id && a.areaM2 > 0);

      // Save tray center position for camera focus and zoom
      trayPositionsRef.current[trayInfo.id] = new THREE.Vector3(trayInfo.x, 0.35, trayInfo.z);

      const trayGroup = new THREE.Group();
      trayGroup.position.set(trayInfo.x, 0.05, trayInfo.z);
      trayGroup.userData = { cropId: trayInfo.id, cropName: cropDef?.name || trayInfo.id };

      // Tray Basin
      const basinGeo = new THREE.BoxGeometry(1.2, 0.25, 1.4);
      const basinMat = new THREE.MeshStandardMaterial({
        color: isAllocated ? 0x1e293b : 0x0b1120,
        metalness: 0.6,
        roughness: 0.3
      });
      const basin = new THREE.Mesh(basinGeo, basinMat);
      basin.position.y = 0.125;
      basin.castShadow = true;
      basin.receiveShadow = true;
      trayGroup.add(basin);

      const lidGeo = new THREE.BoxGeometry(1.12, 0.04, 1.32);
      const lidMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        roughness: 0.8
      });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.y = 0.26;
      trayGroup.add(lid);

      const ledStripGeo = new THREE.BoxGeometry(1.22, 0.04, 0.04);
      const ledStripMat = new THREE.MeshBasicMaterial({
        color: isAllocated ? 0x10b981 : 0x475569
      });
      const ledStrip = new THREE.Mesh(ledStripGeo, ledStripMat);
      ledStrip.position.set(0, 0.2, 0.71);
      trayGroup.add(ledStrip);

      const plants: THREE.Group[] = [];
      const growth = isAllocated ? Math.max(0.15, (cropGrowthProgress[trayInfo.id] || 10) / 100) : 0.08;

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const px = (c - 1) * 0.34;
          const pz = (r - 1) * 0.38;
          const plant = buildRealisticPlant(trayInfo.id, growth);
          plant.position.set(px, 0.3, pz);
          // Randomise rotation so each plant looks unique
          plant.rotation.y = Math.random() * Math.PI * 2;
          trayGroup.add(plant);
          plants.push(plant);
        }
      }

      plantMeshesRef.current[trayInfo.id] = plants;
      scene.add(trayGroup);

      // Enable raycasting on all meshes in trayGroup
      trayGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.userData = { cropId: trayInfo.id, cropName: cropDef?.name || trayInfo.id };
          raycastObjects.push(child);
        }
      });
    });

    // 6. Ultrasonic Mist Particle Cloud
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 5;
      positions[i + 1] = 0.3 + Math.random() * 1.5;
      positions[i + 2] = (Math.random() - 0.5) * 4;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xa5f3fc,
      size: 0.08,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    const mistParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(mistParticles);
    mistParticlesRef.current = mistParticles;

    // 6b. Exterior Martian Dust Storm Swirling Particle Vortex (650 particles)
    const dustCount = 650;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      const rad = 3.8 + Math.random() * 5.2;
      const ang = Math.random() * Math.PI * 2;
      dustPositions[i] = Math.cos(ang) * rad;
      dustPositions[i + 1] = -0.2 + Math.random() * 5.8;
      dustPositions[i + 2] = Math.sin(ang) * rad;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xd97706, // Martian terracotta dust
      size: 0.16,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    dustParticles.visible = Boolean(isInitialDust);
    scene.add(dustParticles);
    dustStormParticlesRef.current = dustParticles;

    // 7. Mouse & Touch Orbit & Raycasting
    // FIX: Use separate isMouseDown + hasDragged flags.
    // isDragging=true on mousedown previously blocked ALL click detection.
    let isMouseDown = false;
    let hasDragged = false;
    let mouseDownX = 0;
    let mouseDownY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0.22;

    const getNDC = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * 2 - 1,
        y: -((clientY - rect.top) / rect.height) * 2 + 1,
      };
    };

    const findCropId = (clientX: number, clientY: number): string | null => {
      const { x, y } = getNDC(clientX, clientY);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObjects(raycastObjects, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj) {
          if (obj.userData?.cropId) return obj.userData.cropId as string;
          obj = obj.parent;
        }
      }
      return null;
    };

    const findCropName = (clientX: number, clientY: number): string | null => {
      const { x, y } = getNDC(clientX, clientY);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObjects(raycastObjects, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj) {
          if (obj.userData?.cropName) return obj.userData.cropName as string;
          obj = obj.parent;
        }
      }
      return null;
    };

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      hasDragged = false;
      mouseDownX = e.clientX;
      mouseDownY = e.clientY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      container.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isMouseDown) {
        const totalDx = e.clientX - mouseDownX;
        const totalDy = e.clientY - mouseDownY;
        // Only start orbiting after 4px threshold so pure clicks never orbit
        if (!hasDragged && Math.abs(totalDx) < 4 && Math.abs(totalDy) < 4) return;
        hasDragged = true;
        targetRotationY += (e.clientX - prevMouseX) * 0.006;
        targetRotationX = Math.max(0.05, Math.min(0.72, targetRotationX + (e.clientY - prevMouseY) * 0.005));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Hover highlight when not pressing
        const name = findCropName(e.clientX, e.clientY);
        setHoveredCrop(name);
        container.style.cursor = name ? 'pointer' : 'grab';
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      const wasClick = isMouseDown && !hasDragged;
      isMouseDown = false;
      hasDragged = false;
      container.style.cursor = 'grab';

      if (wasClick) {
        // Always raycast on a true click regardless of any state
        const hitId = findCropId(e.clientX, e.clientY);
        if (hitId && onSelectCrop) {
          onSelectCrop(hitId);
        } else if (!hitId && onResetCrop) {
          onResetCrop();
        }
      }
    };

    // Mobile touch gestures
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isMouseDown = true;
        hasDragged = false;
        mouseDownX = e.touches[0].clientX;
        mouseDownY = e.touches[0].clientY;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const totalDx = e.touches[0].clientX - mouseDownX;
        const totalDy = e.touches[0].clientY - mouseDownY;
        if (!hasDragged && Math.abs(totalDx) < 6 && Math.abs(totalDy) < 6) return;
        hasDragged = true;
        targetRotationY += (e.touches[0].clientX - prevMouseX) * 0.008;
        targetRotationX = Math.max(0.05, Math.min(0.72, targetRotationX + (e.touches[0].clientY - prevMouseY) * 0.006));
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const wasClick = isMouseDown && !hasDragged;
      isMouseDown = false;
      hasDragged = false;
      if (wasClick && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const hitId = findCropId(touch.clientX, touch.clientY);
        if (hitId && onSelectCrop) {
          onSelectCrop(hitId);
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    // 8. Animation Loop with Dynamic Camera Zoom & Atmospheric Hazards
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const defaultLookAt = new THREE.Vector3(0, 0.4, 0);
    const currentLookAt = new THREE.Vector3(0, 0.4, 0);
    const targetLookAt = new THREE.Vector3();
    const targetCamPos = new THREE.Vector3();

    const targetBgColor = new THREE.Color();
    const targetFogColor = new THREE.Color();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Dynamic check of active environmental events (real-time response)
      const currentActiveTitle = activeEventTitleRef.current;
      const isStormActive = Boolean(currentActiveTitle?.toLowerCase().includes('dust'));
      const isDayNow = (solDayRef.current % 2 === 0);

      // 1. Dynamic Atmospheric Lighting & Skybox Response to Hazards
      if (isStormActive) {
        // Global Dust Storm Active: Dark churning ochre-red storm sky & dense particulate fog
        targetBgColor.setHex(0x280803);
        targetFogColor.setHex(0x2d0b04);
        scene.background = (scene.background as THREE.Color).lerp(targetBgColor, 0.06);
        if (scene.fog) {
          (scene.fog as THREE.FogExp2).color.lerp(targetFogColor, 0.06);
          (scene.fog as THREE.FogExp2).density = THREE.MathUtils.lerp((scene.fog as THREE.FogExp2).density, 0.065, 0.05);
        }

        // Sunlight heavily degraded: -65% irradiance (tau 3.2)
        if (sunLightRef.current) {
          sunLightRef.current.intensity = THREE.MathUtils.lerp(sunLightRef.current.intensity, 0.45, 0.05);
          sunLightRef.current.color.lerp(new THREE.Color(0xd97706), 0.05);
        }
        if (ambientLightRef.current) {
          ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, 0.18, 0.05);
        }

        // Emergency Ceiling Ring Strobe Beacon Flashes Warning Amber/Red
        if (alarmLightRef.current) {
          const alarmStrobe = Math.sin(elapsedTime * 7) > 0 ? 3.6 : 0.3;
          alarmLightRef.current.intensity = alarmStrobe;
        }

        // High-Speed Exterior Dust Storm Particle Squall Swirling around the Bio-Dome
        if (dustStormParticlesRef.current) {
          dustStormParticlesRef.current.visible = true;
          dustStormParticlesRef.current.rotation.y += 0.038;
          const dPos = dustStormParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 1; i < dPos.length; i += 3) {
            dPos[i] += (Math.random() - 0.48) * 0.02;
            if (dPos[i] > 5.5) dPos[i] = 0.1;
            if (dPos[i] < 0) dPos[i] = 5.2;
          }
          dustStormParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // Dome Glass pane gathers fine reddish electrostatic dust layer
        if (domeMaterialRef.current) {
          domeMaterialRef.current.opacity = THREE.MathUtils.lerp(domeMaterialRef.current.opacity, 0.52, 0.05);
          domeMaterialRef.current.transmission = THREE.MathUtils.lerp(domeMaterialRef.current.transmission, 0.5, 0.05);
          domeMaterialRef.current.color.lerp(new THREE.Color(0xb45309), 0.05);
        }
      } else {
        // Nominal Mars Atmosphere (Clear Sol)
        targetBgColor.setHex(isDayNow ? 0x1f0b07 : 0x030712);
        targetFogColor.setHex(isDayNow ? 0x1a0907 : 0x050814);
        scene.background = (scene.background as THREE.Color).lerp(targetBgColor, 0.06);
        if (scene.fog) {
          (scene.fog as THREE.FogExp2).color.lerp(targetFogColor, 0.06);
          (scene.fog as THREE.FogExp2).density = THREE.MathUtils.lerp((scene.fog as THREE.FogExp2).density, 0.022, 0.05);
        }

        if (sunLightRef.current) {
          sunLightRef.current.intensity = THREE.MathUtils.lerp(sunLightRef.current.intensity, isDayNow ? 2.2 : 0.3, 0.05);
          sunLightRef.current.color.lerp(new THREE.Color(isDayNow ? 0xfff1e6 : 0x38bdf8), 0.05);
        }
        if (ambientLightRef.current) {
          ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, isDayNow ? 0.45 : 0.12, 0.05);
        }

        if (alarmLightRef.current) {
          alarmLightRef.current.intensity = 0;
        }

        if (dustStormParticlesRef.current) {
          dustStormParticlesRef.current.visible = false;
        }

        if (domeMaterialRef.current) {
          domeMaterialRef.current.opacity = THREE.MathUtils.lerp(domeMaterialRef.current.opacity, 0.28, 0.05);
          domeMaterialRef.current.transmission = THREE.MathUtils.lerp(domeMaterialRef.current.transmission, 0.85, 0.05);
          domeMaterialRef.current.color.lerp(new THREE.Color(0x93c5fd), 0.05);
        }
      }

      // Dynamic Camera Focusing: Zoom in on selected tray or orbit full dome
      const selectedId = selectedCropIdRef.current;
      if (selectedId && trayPositionsRef.current[selectedId]) {
        const tPos = trayPositionsRef.current[selectedId];
        targetLookAt.set(tPos.x, tPos.y + 0.1, tPos.z);

        // Macro zoomed close-up (distance ~2.3m) with interactive orbit offset
        const zoomDist = 2.4;
        targetCamPos.set(
          tPos.x + zoomDist * Math.sin(targetRotationY) * Math.cos(targetRotationX),
          Math.max(0.6, tPos.y + zoomDist * Math.sin(targetRotationX) + 0.6),
          tPos.z + zoomDist * Math.cos(targetRotationY) * Math.cos(targetRotationX)
        );
      } else {
        // Overview dome perspective
        targetLookAt.copy(defaultLookAt);
        const radius = 7.5;
        targetCamPos.set(
          radius * Math.sin(targetRotationY) * Math.cos(targetRotationX),
          radius * Math.sin(targetRotationX) + 1.2,
          radius * Math.cos(targetRotationY) * Math.cos(targetRotationX)
        );
      }

      // Smooth cinematic lerp
      camera.position.lerp(targetCamPos, 0.08);
      currentLookAt.lerp(targetLookAt, 0.08);
      camera.lookAt(currentLookAt);

      // Animate mist particles
      if (mistParticlesRef.current) {
        const pos = mistParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < pos.length; i += 3) {
          pos[i] += 0.003;
          if (pos[i] > 2.8) pos[i] = 0.3;
        }
        mistParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        mistParticlesRef.current.visible = mistActive || Math.sin(elapsedTime * 2) > 0;
      }

      // Animate gentle plant swaying (slightly faster during dust storm wind buffeting)
      const swaySpeed = isStormActive ? 3.2 : 2.0;
      const swayAmp = isStormActive ? 0.045 : 0.03;
      Object.keys(plantMeshesRef.current).forEach((cropId) => {
        const plantArray = plantMeshesRef.current[cropId] || [];
        plantArray.forEach((p, idx) => {
          p.rotation.z = Math.sin(elapsedTime * swaySpeed + idx) * swayAmp;
          p.rotation.x = Math.cos(elapsedTime * (swaySpeed * 0.75) + idx) * (swayAmp * 0.65);
        });
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update dynamic plants scale when cropGrowthProgress changes
  useEffect(() => {
    Object.keys(plantMeshesRef.current).forEach((cropId) => {
      const isAllocated = allocations.some(a => a.cropId === cropId && a.areaM2 > 0);
      const growthPct = cropGrowthProgress[cropId] || 0;
      const plantArray = plantMeshesRef.current[cropId] || [];

      // Scale between 0.15 (sprout) and 1.25 (full mature harvest)
      const scale = isAllocated ? Math.max(0.15, (growthPct / 100) * 1.25) : 0.05;

      plantArray.forEach((plant) => {
        plant.scale.set(scale, scale, scale);
      });
    });
  }, [cropGrowthProgress, allocations]);

  // Update LED Lights when spectrum mode changes
  useEffect(() => {
    const ledColor = ledMode === 'VEGGIE_MAGENTA' ? 0xd946ef : ledMode === 'INSPECTION_WHITE' ? 0x00f0ff : 0xf59e0b;
    ledLightsRef.current.forEach((light) => {
      light.color.setHex(ledColor);
    });
  }, [ledMode]);

  return (
    <div className={`relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden bg-space-950 select-none ${className}`}>
      <div ref={mountRef} className="w-full h-full min-h-[340px]" />

      {/* 3D Camera & Zoom Controls Overlay */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-space-950/85 backdrop-blur-sm border border-cyan-500/40 px-2.5 py-1.5 rounded-xl text-[10px] font-mono text-cyan-300 pointer-events-auto shadow-md">
        <span className="w-2 h-2 rounded-full bg-bio-400 animate-ping" />
        <span>
          {selectedCropId
            ? `🔬 ZOOMED: ${CROPS_DATA.find(c => c.id === selectedCropId)?.name || selectedCropId}`
            : '3D BIOSPHERE · CLICK TRAY TO ZOOM'}
        </span>
        {selectedCropId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onResetCrop) onResetCrop();
            }}
            className="ml-1.5 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 font-bold transition-all text-[9px] shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <span>🔭 Zoom Out</span>
          </button>
        )}
      </div>

      {hoveredCrop && (
        <div className="absolute top-3 right-3 bg-space-950/90 border border-bio-400 px-3 py-1.5 rounded-xl text-xs font-mono text-bio-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] pointer-events-none animate-in fade-in">
          🔍 Inspecting: {hoveredCrop}
        </div>
      )}

      {/* Atmospheric Day/Night Sol Badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-space-950/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 pointer-events-none">
        <span>{isMartianDay ? '☀️ Sol Daytime (Warm Ambient)' : '🌙 Sol Nighttime (LED Photosynthesis Mode)'}</span>
        {isDustStorm && <span className="text-amber-400 font-bold">⚠️ High Dust Opacity (τ 3.4)</span>}
      </div>
    </div>
  );
};
