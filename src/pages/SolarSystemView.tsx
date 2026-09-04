import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { nasaService, PlanetData } from '../services/nasaService';
import { MARS_LOCATIONS } from '../data/marsLocations';
import {
  NOTABLE_ASTEROIDS, FAMOUS_COMETS, DETAILED_MOONS, HISTORIC_SPACECRAFT,
  MinorBodyData, CometData, DetailedMoonData, SpacecraftData
} from '../data/solarSystemObjects';
import { TIMELINE_MILESTONES, KEY_TIMELINE_PRESETS, TimelineEvent } from '../data/timelineEvents';
import { MarsLocation } from '../types';
import {
  X, ArrowLeft, Globe, Thermometer, Wind, Zap, ChevronRight, ChevronLeft,
  ChevronDown, ChevronUp, ExternalLink, Rocket, Compass, Play, Pause, ZoomIn, ZoomOut,
  Move, Focus, Sparkles, Navigation, Layers, Shield, Radio, Flame, Eye,
  RotateCcw, FastForward, Rewind, Calendar, Clock, History, AlertCircle
} from 'lucide-react';

// ─── Scales & Constants ────────────────────────────────────────────────────────

const AU_SCALE = 6; // 6 Three.js units per Astronomical Unit (AU)

// Visual radii of planets
const PLANET_VISUAL_RADII: Record<string, number> = {
  mercury: 0.10,
  venus:   0.18,
  earth:   0.20,
  mars:    0.22,
  jupiter: 0.72,
  saturn:  0.58,
  uranus:  0.38,
  neptune: 0.36,
};

// Target close-up zoom distances per body
const PLANET_CLOSEUP_DISTANCES: Record<string, number> = {
  sun:     6.0,
  mercury: 0.65,
  venus:   0.85,
  earth:   0.90,
  mars:    0.80,
  jupiter: 2.50,
  saturn:  2.80,
  uranus:  1.60,
  neptune: 1.50,
};

// Authentic NASA & Planetary Mosaic Textures
const PLANET_TEXTURES: Record<string, string> = {
  mercury: '/textures/mercury_realistic.jpg',
  venus:   '/textures/venus_realistic.jpg',
  earth:   '/textures/earth_realistic.jpg',
  mars:    '/textures/mars_realistic.jpg',
  jupiter: '/textures/jupiter_realistic.jpg',
  saturn:  '/textures/saturn_realistic.jpg',
  uranus:  '/textures/uranus_realistic.jpg',
  neptune: '/textures/neptune_realistic.jpg',
};

// Authentic NASA Minor Body & Asteroid Photographic Textures (Dawn, OSIRIS-REx, New Horizons)
const MINOR_BODY_TEXTURES: Record<string, string> = {
  ceres: '/textures/ceres_realistic.jpg',
  vesta: '/textures/vesta_realistic.jpg',
  bennu: '/textures/bennu_realistic.png',
  pluto: '/textures/pluto_realistic.jpg',
};

// Authentic Comet Nucleus Textures (ESA Rosetta NavCam / NASA)
const COMET_TEXTURES: Record<string, string> = {
  '67p': '/textures/comet67p_realistic.jpg',
};

// Authentic Planetary Moons Photographic Textures (Galileo, Cassini, Voyager 2, LRO, HiRISE)
const MOON_TEXTURES: Record<string, string> = {
  moon:      '/textures/moon_realistic.jpg',
  phobos:    '/textures/phobos_realistic.jpg',
  deimos:    '/textures/deimos_realistic.jpg',
  io:        '/textures/io_realistic.jpg',
  europa:    '/textures/europa_realistic.jpg',
  ganymede:  '/textures/ganymede_realistic.jpg',
  callisto:  '/textures/callisto_realistic.jpg',
  titan:     '/textures/titan_realistic.jpg',
  enceladus: '/textures/enceladus_realistic.jpg',
  triton:    '/textures/triton_realistic.jpg',
};

// ─── Procedural Asteroid & Dust Particle Textures ──────────────────────────────

// Circular anti-aliased sprite texture with soft luminous falloff so particle points are NEVER square pixels
function createAsteroidSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.28, 'rgba(240, 235, 225, 0.92)');
  grad.addColorStop(0.65, 'rgba(180, 175, 170, 0.42)');
  grad.addColorStop(0.90, 'rgba(120, 115, 110, 0.08)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Procedural high-definition rock & regolith bump texture for 3D asteroids & space boulders
function createProceduralRockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base basalt / chondrite grey
  ctx.fillStyle = '#635e58';
  ctx.fillRect(0, 0, 512, 512);

  // Surface regolith granularity
  for (let i = 0; i < 7000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2.2 + 0.5;
    const shade = Math.floor(40 + Math.random() * 140);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Micro-craters with raised rims and shaded cavities
  for (let c = 0; c < 70; c++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const cr = 3 + Math.random() * 12;

    // Ejecta blanket & raised rim
    ctx.fillStyle = '#9e968a';
    ctx.beginPath();
    ctx.arc(cx - 1.5, cy - 1.5, cr + 2.0, 0, Math.PI * 2);
    ctx.fill();

    // Crater depression interior
    ctx.fillStyle = '#262422';
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

// ─── Procedural Topographic Asteroid / Minor Body Geometry ──────────────────────
// Generates authentic non-spherical triaxial shapes, diamond equatorial rubble ridges (Bennu),
// crater depression basins, and bilobate contact-binaries (67P) while preserving UV mappings
function createRealisticAsteroidGeometry(
  radius: number,
  type: 'rubble-pile' | 'elongated' | 'dwarf' | 'contact-binary' | 'boulder' = 'rubble-pile',
  seed: number = 1
): THREE.BufferGeometry {
  const segments = type === 'dwarf' ? 64 : 40;
  const geo = new THREE.SphereGeometry(radius, segments, segments);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  // Pseudo-random harmonic noise function based on seed
  const pNoise = (x: number, y: number, z: number) => {
    return Math.sin(x * 4.5 + seed * 1.7) * Math.cos(y * 4.5 + seed * 2.3) * Math.sin(z * 4.5 + seed * 0.9);
  };
  const craterNoise = (x: number, y: number, z: number) => {
    return Math.sin(x * 9.2 + seed * 3.1) * Math.sin(z * 9.2 + seed * 1.7) * 0.5 + 0.5;
  };

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const len = v.length();
    const dir = v.clone().normalize();

    let scaleFactor = 1.0;

    if (type === 'dwarf') {
      // Hydrostatic equilibrium (mostly spherical, slight oblateness + impact basins)
      const oblateness = 1.0 - 0.035 * (dir.y * dir.y);
      const basin = pNoise(dir.x, dir.y, dir.z) * 0.025;
      scaleFactor = oblateness + basin;
    } else if (type === 'rubble-pile') {
      // Bennu / Ryugu diamond spinning-top equatorial ridge profile with boulder facets
      const equatorialDist = Math.sqrt(dir.x * dir.x + dir.z * dir.z);
      const diamondProfile = 1.0 + 0.22 * (1.0 - Math.abs(dir.y)) * equatorialDist;
      const noise = pNoise(dir.x, dir.y, dir.z) * 0.12 + craterNoise(dir.x, dir.y, dir.z) * 0.06;
      scaleFactor = diamondProfile + noise;
    } else if (type === 'elongated') {
      // Phobos / Deimos / Vesta triaxial potato shape
      const triaxial = Math.sqrt((dir.x * 1.35) ** 2 + (dir.y * 0.95) ** 2 + (dir.z * 0.78) ** 2);
      const impactCraters = pNoise(dir.x * 1.5, dir.y * 1.5, dir.z * 1.5) * 0.16;
      scaleFactor = (1.0 / triaxial) + impactCraters;
    } else if (type === 'contact-binary') {
      // 67P / Arrokoth style bilobate contact binary shape
      const lobeShift = dir.x > 0 ? 0.22 : -0.22;
      const waist = Math.abs(dir.x) < 0.25 ? 0.76 : 1.0;
      const noise = pNoise(dir.x * 1.2, dir.y * 1.2, dir.z * 1.2) * 0.14;
      scaleFactor = (1.0 + lobeShift * dir.x) * waist + noise;
    } else {
      // General rocky boulder / irregular fragment
      const noise = pNoise(dir.x, dir.y, dir.z) * 0.2 + craterNoise(dir.x, dir.y, dir.z) * 0.09;
      scaleFactor = 1.0 + noise;
    }

    v.copy(dir).multiplyScalar(len * scaleFactor);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

// ─── Saturn Rings Geometry ─────────────────────────────────────────────────────

function createSaturnRings(planetMesh: THREE.Mesh, textureLoader: THREE.TextureLoader): void {
  const innerR = 0.76;
  const outerR = 1.55;
  const ringGeo = new THREE.RingGeometry(innerR, outerR, 120);

  // Radial UV mapping for realistic concentric ring bands
  const pos = ringGeo.attributes.position;
  const v3 = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i);
    const normalizedR = (v3.length() - innerR) / (outerR - innerR);
    ringGeo.attributes.uv.setXY(i, normalizedR, 0.5);
  }

  const ringTex = textureLoader.load('/textures/saturn_ring.jpg');
  ringTex.colorSpace = THREE.SRGBColorSpace;
  const ringMat = new THREE.MeshStandardMaterial({
    map: ringTex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.90,
    roughness: 0.75,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2.35;
  planetMesh.add(ringMesh);
}

// ─── Uranus Rings Geometry ─────────────────────────────────────────────────────

function createUranusRings(planetMesh: THREE.Mesh): void {
  const ringGeo = new THREE.RingGeometry(0.48, 0.62, 60);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x8ceeee,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2.0; // Tilted on side
  planetMesh.add(ringMesh);
}

// ─── Orbit Line ───────────────────────────────────────────────────────────────

function createOrbitLine(semiMajorAxisAU: number, eccentricity: number, color: number, opacity: number): THREE.Line {
  const points: THREE.Vector3[] = [];
  const segments = 220;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const b = semiMajorAxisAU * Math.sqrt(1 - eccentricity ** 2);
    const x = semiMajorAxisAU * Math.cos(theta) * AU_SCALE;
    const z = b * Math.sin(theta) * AU_SCALE;
    points.push(new THREE.Vector3(x, 0, z));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Line(geo, mat);
}

// ─── High-Definition Procedural Spacecraft & Satellites ─────────────────────────

function createJWSTModel(): THREE.Group {
  const group = new THREE.Group();

  // 1. Five-layer Sunshield (rhombus/kite shape)
  const sunshieldShape = new THREE.Shape();
  sunshieldShape.moveTo(0, -0.24);
  sunshieldShape.lineTo(0.13, 0);
  sunshieldShape.lineTo(0, 0.24);
  sunshieldShape.lineTo(-0.13, 0);
  sunshieldShape.closePath();

  const sunshieldGeo = new THREE.ShapeGeometry(sunshieldShape);
  const sunshieldMat = new THREE.MeshStandardMaterial({
    color: 0x9333ea,
    metalness: 0.85,
    roughness: 0.25,
    side: THREE.DoubleSide,
  });
  const sunshieldMesh = new THREE.Mesh(sunshieldGeo, sunshieldMat);
  sunshieldMesh.rotation.x = Math.PI / 2;
  group.add(sunshieldMesh);

  // Top Kapton sunshield layer (silvery reflective)
  const topShieldMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.1,
    side: THREE.DoubleSide,
  });
  const topShieldMesh = new THREE.Mesh(sunshieldGeo, topShieldMat);
  topShieldMesh.rotation.x = Math.PI / 2;
  topShieldMesh.position.y = 0.015;
  group.add(topShieldMesh);

  // 2. Primary Mirror Assembly (18 gold hexagonal segments arranged in honeycomb)
  const mirrorGroup = new THREE.Group();
  mirrorGroup.position.set(0, 0.045, 0);
  mirrorGroup.rotation.x = -Math.PI / 6;

  const hexRadius = 0.02;
  const hexGeo = new THREE.CylinderGeometry(hexRadius, hexRadius, 0.003, 6);
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.96,
    roughness: 0.08,
    emissive: 0x553300,
  });

  const d = hexRadius * Math.sqrt(3);
  const hexOffsets: [number, number][] = [
    // Inner ring (6 hexes)
    [d, 0], [-d, 0], [d / 2, (d * Math.sqrt(3)) / 2], [-d / 2, (d * Math.sqrt(3)) / 2],
    [d / 2, -(d * Math.sqrt(3)) / 2], [-d / 2, -(d * Math.sqrt(3)) / 2],
    // Outer ring (12 hexes)
    [2 * d, 0], [-2 * d, 0],
    [1.5 * d, (d * Math.sqrt(3)) / 2], [-1.5 * d, (d * Math.sqrt(3)) / 2],
    [1.5 * d, -(d * Math.sqrt(3)) / 2], [-1.5 * d, -(d * Math.sqrt(3)) / 2],
    [d, d * Math.sqrt(3)], [-d, d * Math.sqrt(3)],
    [d, -d * Math.sqrt(3)], [-d, -d * Math.sqrt(3)],
    [0, d * Math.sqrt(3)], [0, -d * Math.sqrt(3)]
  ];

  hexOffsets.forEach(([hx, hz]) => {
    const hexMesh = new THREE.Mesh(hexGeo, goldMat);
    hexMesh.position.set(hx, 0, hz);
    mirrorGroup.add(hexMesh);
  });
  group.add(mirrorGroup);

  // 3. Secondary Mirror and Tripod Struts
  const smGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.003, 6);
  const smMesh = new THREE.Mesh(smGeo, goldMat);
  smMesh.position.set(0, 0.09, 0.04);
  mirrorGroup.add(smMesh);

  const strutMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.6 });
  const strutGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.11, 4);
  const strut1 = new THREE.Mesh(strutGeo, strutMat);
  strut1.position.set(0, 0.045, -0.02);
  strut1.rotation.x = Math.PI / 4;
  mirrorGroup.add(strut1);

  const strut2 = new THREE.Mesh(strutGeo, strutMat);
  strut2.position.set(0.035, 0.045, 0.05);
  strut2.rotation.z = Math.PI / 5;
  strut2.rotation.x = -Math.PI / 5;
  mirrorGroup.add(strut2);

  const strut3 = new THREE.Mesh(strutGeo, strutMat);
  strut3.position.set(-0.035, 0.045, 0.05);
  strut3.rotation.z = -Math.PI / 5;
  strut3.rotation.x = -Math.PI / 5;
  mirrorGroup.add(strut3);

  // 4. Spacecraft Bus & Solar Array beneath sunshield
  const busGeo = new THREE.BoxGeometry(0.045, 0.025, 0.055);
  const busMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
  const busMesh = new THREE.Mesh(busGeo, busMat);
  busMesh.position.set(0, -0.02, 0);
  group.add(busMesh);

  const solarGeo = new THREE.BoxGeometry(0.07, 0.002, 0.035);
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 });
  const solarMesh = new THREE.Mesh(solarGeo, solarMat);
  solarMesh.position.set(0, -0.03, -0.07);
  group.add(solarMesh);

  return group;
}

function createVoyagerModel(): THREE.Group {
  const group = new THREE.Group();

  // 1. High-Gain Antenna Parabolic Dish (3.7m diameter white dish)
  const dishGeo = new THREE.SphereGeometry(0.09, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3);
  const dishMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.35,
    metalness: 0.15,
    side: THREE.DoubleSide,
  });
  const dishMesh = new THREE.Mesh(dishGeo, dishMat);
  dishMesh.rotation.x = Math.PI / 2;
  group.add(dishMesh);

  // Antenna Feed Horn
  const hornGeo = new THREE.ConeGeometry(0.012, 0.03, 8);
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
  const hornMesh = new THREE.Mesh(hornGeo, hornMat);
  hornMesh.position.set(0, 0, 0.05);
  hornMesh.rotation.x = Math.PI;
  group.add(hornMesh);

  // 2. 10-Sided Bus Chassis (Gold foil blanketed decagon)
  const busGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 10);
  const busMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.88,
    roughness: 0.22,
  });
  const busMesh = new THREE.Mesh(busGeo, busMat);
  busMesh.position.set(0, 0, -0.035);
  busMesh.rotation.x = Math.PI / 2;
  group.add(busMesh);

  // 3. RTG Boom & 3 Plutonium Heat Generator Cylinders
  const boomMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
  const rtgBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.12, 4), boomMat);
  rtgBoom.position.set(0.065, 0, -0.04);
  rtgBoom.rotation.z = Math.PI / 2.3;
  group.add(rtgBoom);

  for (let i = 0; i < 3; i++) {
    const rtgGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.022, 12);
    const rtgMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const rtgMesh = new THREE.Mesh(rtgGeo, rtgMat);
    rtgMesh.position.set(0.11 + i * 0.018, 0.015, -0.04);
    rtgMesh.rotation.x = Math.PI / 2;
    group.add(rtgMesh);
  }

  // 4. Science Instrument Scan Platform Boom
  const sciBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.11, 4), boomMat);
  sciBoom.position.set(-0.06, 0.02, -0.04);
  sciBoom.rotation.z = -Math.PI / 2.4;
  group.add(sciBoom);

  const cameraGeo = new THREE.BoxGeometry(0.02, 0.02, 0.03);
  const cameraMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
  const cameraMesh = new THREE.Mesh(cameraGeo, cameraMat);
  cameraMesh.position.set(-0.11, 0.035, -0.04);
  group.add(cameraMesh);

  // 5. Magnetometer lattice mast extending backward
  const magBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.22, 3), boomMat);
  magBoom.position.set(0, -0.09, -0.09);
  magBoom.rotation.x = Math.PI / 3;
  group.add(magBoom);

  return group;
}

function createISSModel(): THREE.Group {
  const group = new THREE.Group();

  // 1. Integrated Truss Structure (Main metallic spine)
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
  const trussGeo = new THREE.BoxGeometry(0.38, 0.014, 0.014);
  const trussMesh = new THREE.Mesh(trussGeo, trussMat);
  group.add(trussMesh);

  // 2. Pressurized Habitation / Lab Modules (Destiny, Kibo, Columbus, Harmony, Zarya, Zvezda)
  const moduleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.5, roughness: 0.3 });
  const moduleGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.13, 16);
  const moduleMesh = new THREE.Mesh(moduleGeo, moduleMat);
  moduleMesh.position.set(0, 0, 0.02);
  moduleMesh.rotation.x = Math.PI / 2;
  group.add(moduleMesh);

  // Russian segment cross module
  const rusGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08, 16);
  const rusMesh = new THREE.Mesh(rusGeo, moduleMat);
  rusMesh.position.set(0, 0, -0.05);
  rusMesh.rotation.x = Math.PI / 2;
  group.add(rusMesh);

  // 3. Eight Giant Solar Array Wings (Photovoltaic golden-copper panels)
  const solarMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.92,
    roughness: 0.12,
    emissive: 0x3d1a04,
  });

  [-0.14, 0.14].forEach(sideX => {
    [-0.05, 0.05].forEach(offsetZ => {
      [-0.045, 0.045].forEach(offsetY => {
        const wingGeo = new THREE.BoxGeometry(0.035, 0.002, 0.075);
        const wingMesh = new THREE.Mesh(wingGeo, solarMat);
        wingMesh.position.set(sideX + (sideX > 0 ? 0.022 : -0.022), offsetY, offsetZ);
        group.add(wingMesh);
      });
    });
  });

  // 4. White Thermal Radiator Panels
  const radMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, side: THREE.DoubleSide });
  const rad1 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.06, 0.002), radMat);
  rad1.position.set(0.06, 0, -0.04);
  group.add(rad1);

  const rad2 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.06, 0.002), radMat);
  rad2.position.set(-0.06, 0, -0.04);
  group.add(rad2);

  return group;
}

function createHubbleModel(): THREE.Group {
  const group = new THREE.Group();

  // 1. Dual-Cylinder Telescope Body (Silver reflective MLI blanket)
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.12 });
  const mainTube = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.11, 24), bodyMat);
  mainTube.rotation.z = Math.PI / 2;
  group.add(mainTube);

  // Aft shroud (wider equipment section)
  const aftTube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.045, 24), bodyMat);
  aftTube.position.set(-0.06, 0, 0);
  aftTube.rotation.z = Math.PI / 2;
  group.add(aftTube);

  // 2. Aperture Door (Open angled lid)
  const doorGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.003, 24);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
  const doorMesh = new THREE.Mesh(doorGeo, doorMat);
  doorMesh.position.set(0.056, 0.015, 0);
  doorMesh.rotation.z = Math.PI / 3;
  group.add(doorMesh);

  // 3. Twin Solar Arrays (Cyan-blue photovoltaic panels with gold frame)
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.88, roughness: 0.15 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });

  [-0.075, 0.075].forEach(sideZ => {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.04, 6), frameMat);
    strut.position.set(-0.01, 0, sideZ * 0.4);
    strut.rotation.x = Math.PI / 2;
    group.add(strut);

    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.003, 0.03), solarMat);
    panel.position.set(-0.01, 0, sideZ);
    group.add(panel);
  });

  return group;
}

function createMROModel(): THREE.Group {
  const group = new THREE.Group();

  // 1. Central Bus (Hexagonal gold-blanketed chassis)
  const busMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.2 });
  const busMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.04, 6), busMat);
  group.add(busMesh);

  // 2. 3-meter High Gain Communications Antenna Dish
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.3, roughness: 0.3, side: THREE.DoubleSide });
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3), dishMat);
  dish.position.set(0, 0.035, 0.02);
  dish.rotation.x = -Math.PI / 3;
  group.add(dish);

  // 3. HiRISE Telescope Camera Barrel (pointing towards Mars)
  const hiriseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 });
  const hirise = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.045, 16), hiriseMat);
  hirise.position.set(0, -0.035, 0);
  group.add(hirise);

  // 4. Twin Solar Array Wings (blue-black photovoltaic cells)
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 });
  [-0.08, 0.08].forEach(sideX => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.002, 0.035), solarMat);
    wing.position.set(sideX, 0, 0);
    group.add(wing);
  });

  return group;
}

function createCassiniModel(): THREE.Group {
  const group = new THREE.Group();

  // 1. High Gain Antenna (4-meter white parabolic dish)
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.2, roughness: 0.4, side: THREE.DoubleSide });
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.065, 20, 10, 0, Math.PI * 2, 0, Math.PI / 3), dishMat);
  dish.rotation.x = Math.PI / 2;
  group.add(dish);

  // 2. Cylindrical Gold Body
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.07, 16), bodyMat);
  body.position.set(0, 0, -0.045);
  body.rotation.x = Math.PI / 2;
  group.add(body);

  // 3. Huygens Probe Saucer attached on the side
  const probeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });
  const huygens = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.016, 16), probeMat);
  huygens.position.set(0.032, 0, -0.04);
  huygens.rotation.z = -Math.PI / 2;
  group.add(huygens);

  // 4. Magnetometer Boom
  const boomMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5, roughness: 0.5 });
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.14, 4), boomMat);
  boom.position.set(-0.06, 0.02, -0.05);
  boom.rotation.z = -Math.PI / 3;
  group.add(boom);

  return group;
}

function createNewHorizonsModel(): THREE.Group {
  const group = new THREE.Group();

  // 1. Triangular Gold Foil Chassis
  const triShape = new THREE.Shape();
  triShape.moveTo(0, 0.04);
  triShape.lineTo(0.035, -0.03);
  triShape.lineTo(-0.035, -0.03);
  triShape.closePath();

  const triExtrude = new THREE.ExtrudeGeometry(triShape, { depth: 0.025, bevelEnabled: false });
  const busMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.18 });
  const bus = new THREE.Mesh(triExtrude, busMat);
  bus.position.set(0, 0, -0.012);
  group.add(bus);

  // 2. 2.1-meter High Gain Antenna Dish (tan/golden)
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide });
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3), dishMat);
  dish.position.set(0, 0.01, 0.02);
  dish.rotation.x = Math.PI / 2;
  group.add(dish);

  // 3. Cylindrical Black RTG
  const rtgMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
  const rtg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.035, 12), rtgMat);
  rtg.position.set(-0.038, -0.025, 0);
  rtg.rotation.z = Math.PI / 4;
  group.add(rtg);

  // 4. LORRI Camera Barrel
  const lorriMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
  const lorri = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.025, 12), lorriMat);
  lorri.position.set(0.025, -0.02, 0.02);
  lorri.rotation.x = Math.PI / 2;
  group.add(lorri);

  return group;
}

function createDetailedSpacecraftModel(probe: SpacecraftData): THREE.Group {
  if (probe.id === 'jwst') return createJWSTModel();
  if (probe.id === 'voyager-1') return createVoyagerModel();
  if (probe.id === 'iss') return createISSModel();
  if (probe.id === 'hubble') return createHubbleModel();
  if (probe.id === 'mro') return createMROModel();
  if (probe.id === 'cassini') return createCassiniModel();
  if (probe.id === 'new-horizons') return createNewHorizonsModel();

  // Fallback high-definition satellite bus
  const group = new THREE.Group();
  const busMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
  group.add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.04), busMat));
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 });
  [-0.065, 0.065].forEach(sx => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.002, 0.025), solarMat);
    wing.position.set(sx, 0, 0);
    group.add(wing);
  });
  return group;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SolarSystemView: React.FC = () => {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Focus & Selection States
  const [focusedBodyId, setFocusedBodyId] = useState<string | null>('mars');
  const focusedBodyIdRef = useRef<string | null>('mars');

  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [selectedMarsLocation, setSelectedMarsLocation] = useState<MarsLocation | null>(null);
  const [hoveredMarsLocation, setHoveredMarsLocation] = useState<MarsLocation | null>(null);
  const [selectedMinorBody, setSelectedMinorBody] = useState<MinorBodyData | null>(null);
  const [selectedComet, setSelectedComet] = useState<CometData | null>(null);
  const [selectedMoon, setSelectedMoon] = useState<DetailedMoonData | null>(null);
  const [selectedSpacecraft, setSelectedSpacecraft] = useState<SpacecraftData | null>(null);
  const [isSunSelected, setIsSunSelected] = useState<boolean>(false);

  // Layer Visibility Toggles
  const [layers, setLayers] = useState({
    asteroids: true,
    comets: true,
    moons: true,
    probes: true,
    debris: true,
  });

  const [planets, setPlanets] = useState<PlanetData[]>([]);
  const [dataStatus, setDataStatus] = useState<'loading' | 'keplerian' | 'live'>('loading');
  const [isOrbitPaused, setIsOrbitPaused] = useState<boolean>(false);
  const isOrbitPausedRef = useRef<boolean>(false);

  // ── Timeline Simulation Engine State ───────────────────────────────────────
  const [simulatedYear, setSimulatedYear] = useState<number>(2026.68);
  const simulatedYearRef = useRef<number>(2026.68);
  const [displayYear, setDisplayYear] = useState<number>(2026.68);
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(false);
  const isSimPlayingRef = useRef<boolean>(false);
  const [simSpeedSecPerYear, setSimSpeedSecPerYear] = useState<number>(5); // 1, 3, 5, 10, 30 sec/yr
  const simSpeedSecPerYearRef = useRef<number>(5);
  const [strictTimelineMode, setStrictTimelineMode] = useState<boolean>(true);
  const strictTimelineModeRef = useRef<boolean>(true);
  const [activeMilestone, setActiveMilestone] = useState<TimelineEvent | null>(null);
  const lastTriggeredMilestoneIdRef = useRef<string | null>(null);
  const frameCountRef = useRef<number>(0);
  // Tracks the last time a UI panel was interacted with (prevents the canvas
  // raycaster from re-selecting an object immediately after a panel is closed).
  const panelInteractionTimeRef = useRef<number>(0);

  // UI Panels visibility toggles (Focus sidebar & Simulation timeline)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  // References for Three.js objects
  const planetMeshesRef = useRef<{ mesh: THREE.Mesh; data: PlanetData; hitMesh: THREE.Mesh }[]>([]);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const sunChromosphereRef = useRef<THREE.Mesh | null>(null);
  const sunProminencesRef = useRef<THREE.Group | null>(null);
  const sunCoronaGroupRef = useRef<THREE.Group | null>(null);
  const sunHitMeshRef = useRef<THREE.Mesh | null>(null);
  const marsMeshRef = useRef<THREE.Mesh | null>(null);
  const marsLocationHitTargetsRef = useRef<{ mesh: THREE.Mesh; location: MarsLocation }[]>([]);
  const flightTargetPosRef = useRef<THREE.Vector3 | null>(null);
  const flightTargetDistRef = useRef<number | null>(null);

  // Layer groups for toggles
  const asteroidGroupRef = useRef<THREE.Group | null>(null);
  const cometGroupRef = useRef<THREE.Group | null>(null);
  const moonGroupRef = useRef<THREE.Group | null>(null);
  const probeGroupRef = useRef<THREE.Group | null>(null);
  const debrisGroupRef = useRef<THREE.Group | null>(null);
  const instancedAsteroidsRef = useRef<THREE.InstancedMesh[]>([]);
  const earthDebrisMeshRef = useRef<THREE.Points | null>(null);

  // Interactive targets for comets, asteroids, moons, spacecraft
  const minorBodyHitTargetsRef = useRef<{ mesh: THREE.Mesh; data: MinorBodyData }[]>([]);
  const notableAsteroidMeshesRef = useRef<{ mesh: THREE.Mesh; data: MinorBodyData; hitMesh: THREE.Mesh; initialAngle: number }[]>([]);
  const cometMeshesRef = useRef<{ mesh: THREE.Group; ionTail: THREE.Mesh; dustTail: THREE.Mesh; data: CometData; hitMesh: THREE.Mesh; initialAngle: number }[]>([]);
  const moonMeshesRef = useRef<{ mesh: THREE.Mesh; parentMesh: THREE.Mesh; data: DetailedMoonData; hitMesh: THREE.Mesh }[]>([]);
  const spacecraftMeshesRef = useRef<{ mesh: THREE.Group; data: SpacecraftData; hitMesh: THREE.Mesh }[]>([]);

  // ── Load NASA ephemeris data ────────────────────────────────────────────────
  useEffect(() => {
    nasaService.getPlanetaryEphemeris().then(({ planets: p, isLive }) => {
      setPlanets(p);
      setDataStatus(isLive ? 'live' : 'keplerian');
      const mars = p.find(item => item.id === 'mars') || null;
      setSelectedPlanet(mars);
    });
  }, []);

  // ── Focus Helper function ───────────────────────────────────────────────────
  const focusOnBody = useCallback((bodyId: string | null) => {
    focusedBodyIdRef.current = bodyId;
    setFocusedBodyId(bodyId);

    // Reset other inspection panels
    setSelectedMarsLocation(null);
    setSelectedMinorBody(null);
    setSelectedComet(null);
    setSelectedMoon(null);
    setSelectedSpacecraft(null);
    setIsSunSelected(false);

    if (bodyId === 'mars') {
      const mars = planets.find(p => p.id === 'mars') || null;
      setSelectedPlanet(mars);
    } else if (bodyId === 'sun') {
      setSelectedPlanet(null);
      setIsSunSelected(true);
      if (controlsRef.current) {
        flightTargetPosRef.current = new THREE.Vector3(0, 0, 0);
        flightTargetDistRef.current = PLANET_CLOSEUP_DISTANCES['sun'] || 5.8;
      }
    } else if (bodyId) {
      // Check if it's a planet
      const foundPlanet = planets.find(p => p.id === bodyId) || null;
      if (foundPlanet) {
        setSelectedPlanet(foundPlanet);
        const entry = planetMeshesRef.current.find(p => p.data.id === bodyId);
        if (entry && controlsRef.current) {
          flightTargetPosRef.current = entry.mesh.position.clone();
          flightTargetDistRef.current = PLANET_CLOSEUP_DISTANCES[bodyId] || 1.5;
        }
        return;
      }

      // Check if it's a minor body / asteroid
      const foundAsteroid = NOTABLE_ASTEROIDS.find(a => a.id === bodyId);
      if (foundAsteroid) {
        setSelectedPlanet(null);
        setSelectedMinorBody(foundAsteroid);
        const entry = minorBodyHitTargetsRef.current.find(t => t.data.id === bodyId);
        if (entry && controlsRef.current) {
          flightTargetPosRef.current = entry.mesh.position.clone();
          flightTargetDistRef.current = 0.55;
        }
        return;
      }

      // Check if it's a comet
      const foundComet = FAMOUS_COMETS.find(c => c.id === bodyId);
      if (foundComet) {
        setSelectedPlanet(null);
        setSelectedComet(foundComet);
        const entry = cometMeshesRef.current.find(c => c.data.id === bodyId);
        if (entry && controlsRef.current) {
          flightTargetPosRef.current = entry.mesh.position.clone();
          flightTargetDistRef.current = 0.8;
        }
        return;
      }

      // Check if it's a moon
      const foundMoon = DETAILED_MOONS.find(m => m.id === bodyId);
      if (foundMoon) {
        setSelectedPlanet(null);
        setSelectedMoon(foundMoon);
        const entry = moonMeshesRef.current.find(m => m.data.id === bodyId);
        if (entry && controlsRef.current) {
          const worldPos = new THREE.Vector3();
          entry.mesh.getWorldPosition(worldPos);
          flightTargetPosRef.current = worldPos;
          flightTargetDistRef.current = 0.35;
        }
        return;
      }

      // Check if it's a spacecraft
      const foundProbe = HISTORIC_SPACECRAFT.find(s => s.id === bodyId);
      if (foundProbe) {
        setSelectedPlanet(null);
        setSelectedSpacecraft(foundProbe);
        const entry = spacecraftMeshesRef.current.find(s => s.data.id === bodyId);
        if (entry && controlsRef.current) {
          const worldPos = new THREE.Vector3();
          entry.mesh.getWorldPosition(worldPos);
          flightTargetPosRef.current = worldPos;
          flightTargetDistRef.current = 0.35;
        }
        return;
      }
    }
  }, [planets]);

  // ── Sync Layer Visibility ───────────────────────────────────────────────────
  useEffect(() => {
    if (asteroidGroupRef.current) asteroidGroupRef.current.visible = layers.asteroids;
    if (cometGroupRef.current) cometGroupRef.current.visible = layers.comets;
    if (moonGroupRef.current) moonGroupRef.current.visible = layers.moons;
    if (probeGroupRef.current) probeGroupRef.current.visible = layers.probes;
    if (debrisGroupRef.current) debrisGroupRef.current.visible = layers.debris;
  }, [layers]);

  // ── Main Three.js Scene Setup ───────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current || planets.length === 0) return;

    const container = mountRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    // Scene & Deep Space Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010207);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.05, 8000);
    camera.position.set(10, 8, 12);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    // OrbitControls: Allows free scanning, rotating, zooming anywhere
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 0.20;   // Skim over any moon/planet/asteroid surface
    controls.maxDistance = 2500;   // Deep space out past Voyager 1
    controls.maxPolarAngle = Math.PI * 0.98;
    controls.minPolarAngle = 0.02;
    controlsRef.current = controls;

    // ── Lighting ─────────────────────────────────────────────────────────────
    const sunLight = new THREE.PointLight(0xfff7e8, 9.5, 4800, 0.85);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Ambient space illumination
    scene.add(new THREE.AmbientLight(0x0e1424, 1.4));

    // Directional rim fill for planetary relief
    const spaceKeyLight = new THREE.DirectionalLight(0xffeedd, 1.6);
    spaceKeyLight.position.set(20, 15, 20);
    scene.add(spaceKeyLight);

    // Procedural sprite & rock bump textures for HD space rocks & anti-aliased particles
    const asteroidSpriteTex = createAsteroidSpriteTexture();
    const proceduralRockTex = createProceduralRockTexture();

    // ── Starfield (6,500 Stars) ───────────────────────────────────────────────
    const starCount = 6500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 900 + Math.random() * 600;
      starPositions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.45;
      starPositions[i * 3 + 2] = r * Math.cos(phi);
      const t = Math.random();
      starColors[i * 3 + 0] = t < 0.6 ? 1.0 : t < 0.8 ? 0.88 : 0.95;
      starColors[i * 3 + 1] = t < 0.6 ? 1.0 : t < 0.8 ? 0.92 : 0.88;
      starColors[i * 3 + 2] = t < 0.6 ? 1.0 : t < 0.8 ? 1.00 : 0.72;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
      size: 0.85,
      map: asteroidSpriteTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    })));

    // ── Sun (Ultra-HD 4K Photosphere, Living Chromosphere, & Prominences) ─────
    const sunGeo = new THREE.SphereGeometry(2.2, 96, 96);
    const sunTex = textureLoader.load('/textures/sun_realistic.jpg');
    sunTex.colorSpace = THREE.SRGBColorSpace;
    sunTex.anisotropy = 16;
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = { bodyId: 'sun' };
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // 2. Convective Turbulent Chromosphere Plasma Shell
    // Pulsating, semi-transparent layer counter-rotating over the photosphere
    const chromoGeo = new THREE.SphereGeometry(2.215, 64, 64);
    const chromoMat = new THREE.MeshBasicMaterial({
      map: sunTex,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      color: 0xffa033,
      depthWrite: false,
    });
    const chromoMesh = new THREE.Mesh(chromoGeo, chromoMat);
    sunMesh.add(chromoMesh);
    sunChromosphereRef.current = chromoMesh;

    // 3. Magnetic Solar Prominence Eruption Loops
    const prominenceGroup = new THREE.Group();
    const loopMat = new THREE.MeshBasicMaterial({
      color: 0xff3b14,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const prominenceConfigs = [
      { r: 0.36, rotX: 0.25, rotY: 0.85, rotZ: 0.15 },
      { r: 0.44, rotX: 1.45, rotY: 2.15, rotZ: 0.45 },
      { r: 0.38, rotX: -0.95, rotY: 3.65, rotZ: -0.35 },
      { r: 0.48, rotX: 2.45, rotY: 5.25, rotZ: 0.65 },
    ];
    prominenceConfigs.forEach(({ r, rotX, rotY, rotZ }) => {
      const loopGeo = new THREE.TorusGeometry(r, 0.024, 12, 32, Math.PI);
      const loopMesh = new THREE.Mesh(loopGeo, loopMat);
      loopMesh.position.set(0, 0, 2.18);
      const pivot = new THREE.Group();
      pivot.rotation.set(rotX, rotY, rotZ);
      pivot.add(loopMesh);
      prominenceGroup.add(pivot);
    });
    sunMesh.add(prominenceGroup);
    sunProminencesRef.current = prominenceGroup;

    // 4. Multi-layer Volumetric Coronal Flare Atmospheres
    const coronaGroup = new THREE.Group();

    // Core white-hot inner corona
    const innerCorona = new THREE.Mesh(
      new THREE.SphereGeometry(2.36, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0xfff7cc,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      })
    );
    coronaGroup.add(innerCorona);

    // Mid chromosphere fiery halo
    const midCorona = new THREE.Mesh(
      new THREE.SphereGeometry(2.75, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff9900,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      })
    );
    coronaGroup.add(midCorona);

    // Outer coronal streamer haze
    const outerCorona = new THREE.Mesh(
      new THREE.SphereGeometry(3.50, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff4500,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      })
    );
    coronaGroup.add(outerCorona);

    // Deep solar wind atmosphere
    const solarWindGlow = new THREE.Mesh(
      new THREE.SphereGeometry(4.80, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff2200,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      })
    );
    coronaGroup.add(solarWindGlow);
    scene.add(coronaGroup);
    sunCoronaGroupRef.current = coronaGroup;

    // Sun hit target
    const sunHitGeo = new THREE.SphereGeometry(3.2, 16, 16);
    const sunHit = new THREE.Mesh(sunHitGeo, new THREE.MeshBasicMaterial({ visible: false }));
    sunHit.userData = { bodyId: 'sun' };
    scene.add(sunHit);
    sunHitMeshRef.current = sunHit;

    // ── Groups for Toggling Layers ────────────────────────────────────────────
    const asteroidGroup = new THREE.Group();
    scene.add(asteroidGroup);
    asteroidGroupRef.current = asteroidGroup;

    const cometGroup = new THREE.Group();
    scene.add(cometGroup);
    cometGroupRef.current = cometGroup;

    const moonGroup = new THREE.Group();
    scene.add(moonGroup);
    moonGroupRef.current = moonGroup;

    const probeGroup = new THREE.Group();
    scene.add(probeGroup);
    probeGroupRef.current = probeGroup;

    const debrisGroup = new THREE.Group();
    scene.add(debrisGroup);
    debrisGroupRef.current = debrisGroup;

    // ── Main Asteroid Belt (2.1 – 3.3 AU) with Kirkwood Gaps ──────────────────
    // ── Main Asteroid Belt (2.1 – 3.3 AU) with Kirkwood Gaps & NASA Taxonomy ────
    const asteroidCount = 3500;
    const asteroidPos = new Float32Array(asteroidCount * 3);
    const asteroidColors = new Float32Array(asteroidCount * 3);

    // NASA Spectral Taxonomy: C-type (75% dark carbonaceous), S-type (17% silicate tan), M-type (8% metallic)
    const cTypeColor = new THREE.Color(0x4a4a4e);
    const sTypeColor = new THREE.Color(0xc29b7a);
    const mTypeColor = new THREE.Color(0xb0bcc2);

    for (let i = 0; i < asteroidCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      let auDist = 2.1 + Math.random() * 1.2;

      // Realistic Kirkwood Gaps (mean-motion orbital resonances with Jupiter)
      // 3:1 resonance at 2.50 AU, 5:2 resonance at 2.82 AU, 7:3 resonance at 2.95 AU
      if (Math.abs(auDist - 2.50) < 0.06) auDist += (Math.random() > 0.5 ? 0.09 : -0.09);
      if (Math.abs(auDist - 2.82) < 0.05) auDist += (Math.random() > 0.5 ? 0.08 : -0.08);
      if (Math.abs(auDist - 2.95) < 0.04) auDist += (Math.random() > 0.5 ? 0.07 : -0.07);

      const r = auDist * AU_SCALE;
      asteroidPos[i * 3 + 0] = r * Math.cos(angle);
      asteroidPos[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
      asteroidPos[i * 3 + 2] = r * Math.sin(angle);

      // Color distribution based on heliocentric distance (S-type inner, C-type outer)
      const rand = Math.random();
      let col = cTypeColor;
      if (auDist < 2.6 && rand < 0.65) {
        col = sTypeColor;
      } else if (rand > 0.90) {
        col = mTypeColor;
      }
      asteroidColors[i * 3 + 0] = col.r;
      asteroidColors[i * 3 + 1] = col.g;
      asteroidColors[i * 3 + 2] = col.b;
    }
    const asteroidGeo = new THREE.BufferGeometry();
    asteroidGeo.setAttribute('position', new THREE.BufferAttribute(asteroidPos, 3));
    asteroidGeo.setAttribute('color', new THREE.BufferAttribute(asteroidColors, 3));
    // Use soft circular sprite so particles are round stones, not square pixels
    asteroidGroup.add(new THREE.Points(asteroidGeo, new THREE.PointsMaterial({
      map: asteroidSpriteTex,
      vertexColors: true,
      size: 0.28,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      sizeAttenuation: true,
    })));

    // ── Individual 3D HD Tumbling Asteroids in the Main Belt ───────────────────
    // 60 instanced 3D irregular boulders with high-res procedural basalt surface
    instancedAsteroidsRef.current = [];
    const instancedRockCount = 60;
    const dummyMatrix = new THREE.Matrix4();
    const dummyPos = new THREE.Vector3();
    const dummyRot = new THREE.Euler();
    const dummyScale = new THREE.Vector3();

    // Spawn multiple rock types for visual variety
    const rockTypes: Array<{ type: 'boulder'|'rubble-pile'|'elongated'; count: number; seed: number }> = [
      { type: 'boulder',     count: 25, seed: 77  },
      { type: 'rubble-pile', count: 22, seed: 143 },
      { type: 'elongated',   count: 13, seed: 211 },
    ];

    let rockIdx = 0;
    rockTypes.forEach(({ type, count, seed }) => {
      const rockGeo = createRealisticAsteroidGeometry(0.038, type, seed);
      const rockMat = new THREE.MeshStandardMaterial({
        map: proceduralRockTex,
        bumpMap: proceduralRockTex,
        bumpScale: 0.012,
        roughnessMap: proceduralRockTex,
        color: type === 'elongated' ? 0xa8998a : type === 'rubble-pile' ? 0x7e7468 : 0x8c8278,
        roughness: 0.94,
        metalness: type === 'elongated' ? 0.12 : 0.04,
      });
      const instanced = new THREE.InstancedMesh(rockGeo, rockMat, count);
      instanced.castShadow = false;

      for (let i = 0; i < count; i++) {
        const angle = ((rockIdx + i) / instancedRockCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const auDist = 2.15 + Math.random() * 1.1;
        const r = auDist * AU_SCALE;
        dummyPos.set(r * Math.cos(angle), (Math.random() - 0.5) * 0.85, r * Math.sin(angle));
        dummyRot.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        const s = 0.55 + Math.random() * 0.9;
        dummyScale.set(s, s * (0.7 + Math.random() * 0.6), s * (0.75 + Math.random() * 0.5));
        dummyMatrix.compose(dummyPos, new THREE.Quaternion().setFromEuler(dummyRot), dummyScale);
        instanced.setMatrixAt(i, dummyMatrix);
      }
      instanced.instanceMatrix.needsUpdate = true;
      asteroidGroup.add(instanced);
      instancedAsteroidsRef.current.push(instanced);
      rockIdx += count;
    });

    // ── Jupiter Trojan Asteroid Swarms (L4 Greeks & L5 Trojans at ±60°) ────────
    const trojanCount = 800;
    const trojanPos = new Float32Array(trojanCount * 3);
    const jupiterOrbitR = 5.20 * AU_SCALE;
    for (let i = 0; i < trojanCount; i++) {
      const baseAngle = i < trojanCount / 2 ? 1.047 : -1.047;
      const angle = baseAngle + (Math.random() - 0.5) * 0.45;
      const r = jupiterOrbitR + (Math.random() - 0.5) * 2.5;
      trojanPos[i * 3 + 0] = r * Math.cos(angle);
      trojanPos[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
      trojanPos[i * 3 + 2] = r * Math.sin(angle);
    }
    const trojanGeo = new THREE.BufferGeometry();
    trojanGeo.setAttribute('position', new THREE.BufferAttribute(trojanPos, 3));
    asteroidGroup.add(new THREE.Points(trojanGeo, new THREE.PointsMaterial({
      map: asteroidSpriteTex,
      color: 0xd4a96a,
      size: 0.30,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      sizeAttenuation: true,
    })));

    // ── Kuiper Belt (30 – 50 AU) ──────────────────────────────────────────────
    const kuiperCount = 1800;
    const kuiperPos = new Float32Array(kuiperCount * 3);
    for (let i = 0; i < kuiperCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = (30 + Math.random() * 20) * AU_SCALE;
      kuiperPos[i * 3 + 0] = r * Math.cos(angle);
      kuiperPos[i * 3 + 1] = (Math.random() - 0.5) * 8.5;
      kuiperPos[i * 3 + 2] = r * Math.sin(angle);
    }
    const kuiperGeo = new THREE.BufferGeometry();
    kuiperGeo.setAttribute('position', new THREE.BufferAttribute(kuiperPos, 3));
    asteroidGroup.add(new THREE.Points(kuiperGeo, new THREE.PointsMaterial({
      map: asteroidSpriteTex,
      color: 0x7aa8c0,
      size: 0.45,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      sizeAttenuation: true,
    })));

    // ── Named Asteroids & Dwarf Planets (Ceres, Vesta, Bennu, Apophis, Pluto) ──
    minorBodyHitTargetsRef.current = [];
    notableAsteroidMeshesRef.current = [];
    NOTABLE_ASTEROIDS.forEach(ast => {
      // Orbit Line
      asteroidGroup.add(createOrbitLine(ast.semiMajorAxisAU, ast.eccentricity, ast.colorHex, 0.25));

      // Determine authentic geometry type & radius scale
      const rScale = ast.type === 'dwarf-planet' ? (ast.id === 'pluto' ? 0.15 : 0.13) : (ast.id === 'vesta' || ast.id === 'pallas' ? 0.085 : 0.055);
      const geoType = ast.id === 'ceres' || ast.id === 'pluto'
        ? 'dwarf'
        : ast.id === 'vesta' || ast.id === 'apophis'
        ? 'elongated'
        : 'rubble-pile';

      const astGeo = createRealisticAsteroidGeometry(rScale, geoType, ast.name.charCodeAt(0));
      const astMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.90,
        metalness: 0.05,
      });

      // Load authentic NASA photographic texture if available (Dawn, OSIRIS-REx, New Horizons)
      const texPath = MINOR_BODY_TEXTURES[ast.id];
      if (texPath) {
        textureLoader.load(texPath, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          astMat.map = tex;
          astMat.bumpMap = tex;
          astMat.bumpScale = ast.id === 'bennu' ? 0.035 : 0.02;
          astMat.needsUpdate = true;
        });
      } else {
        astMat.color.setHex(ast.colorHex);
      }

      const astMesh = new THREE.Mesh(astGeo, astMat);
      const posDist = ast.semiMajorAxisAU * AU_SCALE;
      const initialAngle = (ast.name.charCodeAt(0) * 1.3) % (Math.PI * 2);
      astMesh.position.set(posDist * Math.cos(initialAngle), (ast.inclinationDeg * 0.05), posDist * Math.sin(initialAngle));
      astMesh.userData = { minorBodyId: ast.id, data: ast };
      asteroidGroup.add(astMesh);

      // For Pluto, add its binary companion Charon
      if (ast.id === 'pluto') {
        const charonGeo = createRealisticAsteroidGeometry(0.065, 'dwarf', 99);
        const charonMat = new THREE.MeshStandardMaterial({ color: 0x9e9282, roughness: 0.92 });
        const charonMesh = new THREE.Mesh(charonGeo, charonMat);
        charonMesh.position.set(0.38, 0.08, 0);
        astMesh.add(charonMesh);
      }

      // Clickable Hit Target
      const hitTarget = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(rScale * 3.5, 0.6), 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitTarget.position.copy(astMesh.position);
      hitTarget.userData = { minorBodyId: ast.id, data: ast };
      asteroidGroup.add(hitTarget);
      minorBodyHitTargetsRef.current.push({ mesh: hitTarget, data: ast });
      notableAsteroidMeshesRef.current.push({ mesh: astMesh, data: ast, hitMesh: hitTarget, initialAngle });
    });

    // ── Comets with Dynamic Solar Wind Tails ───────────────────────────────────
    cometMeshesRef.current = [];
    FAMOUS_COMETS.forEach(comet => {
      // Draw elliptical orbit line
      cometGroup.add(createOrbitLine(Math.min(comet.semiMajorAxisAU, 40), comet.eccentricity, comet.colorHex, 0.3));

      const cometRoot = new THREE.Group();
      const cDist = Math.max(1.2, comet.perihelionAU * 1.8) * AU_SCALE;
      const cAngle = (comet.id.charCodeAt(0) * 1.7) % (Math.PI * 2);
      cometRoot.position.set(cDist * Math.cos(cAngle), 0.8, cDist * Math.sin(cAngle));

      // Authentic Nucleus: contact-binary for 67P, elongated cigar for 'Oumuamua, rubble-pile for Halley/NEOWISE
      const nucType = comet.id === '67p' ? 'contact-binary' : comet.id === 'oumuamua' ? 'elongated' : 'rubble-pile';
      const nucGeo = createRealisticAsteroidGeometry(0.048, nucType, comet.id.charCodeAt(0));
      const nucMat = new THREE.MeshStandardMaterial({
        color: comet.id === 'oumuamua' ? 0xa84838 : 0x242426,
        roughness: 0.95,
      });

      // Authentic ESA Rosetta NavCam photographic texture on 67P
      const texPath = COMET_TEXTURES[comet.id];
      if (texPath) {
        textureLoader.load(texPath, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          nucMat.color.setHex(0xffffff);
          nucMat.map = tex;
          nucMat.bumpMap = tex;
          nucMat.bumpScale = 0.025;
          nucMat.needsUpdate = true;
        });
      }

      const nucleus = new THREE.Mesh(nucGeo, nucMat);
      if (comet.id === 'oumuamua') {
        // Authentic 10:1 cigar/needle aspect ratio confirmed by light curve variations
        nucleus.scale.set(3.8, 0.7, 0.5);
      }
      cometRoot.add(nucleus);

      // Hit target for clicking comet
      const cometHit = new THREE.Mesh(
        new THREE.SphereGeometry(0.9, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      cometHit.position.copy(cometRoot.position);
      cometHit.userData = { cometId: comet.id, data: comet };
      cometGroup.add(cometHit);

      // Coma & Tails - 'Oumuamua was inactive with no visible dust tail
      if (comet.id !== 'oumuamua') {
        const comaGeo = new THREE.SphereGeometry(0.16, 24, 24);
        const comaMat = new THREE.MeshBasicMaterial({
          color: comet.colorHex,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
        });
        cometRoot.add(new THREE.Mesh(comaGeo, comaMat));

        // Ion Tail (Narrow, glowing cyan/blue, points directly away from Sun)
        const ionTailGeo = new THREE.ConeGeometry(0.12, comet.tailLengthScale * 1.5, 24, 1, true);
        const ionTailMat = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        });
        const ionTail = new THREE.Mesh(ionTailGeo, ionTailMat);
        ionTail.geometry.translate(0, comet.tailLengthScale * 0.75, 0);
        cometRoot.add(ionTail);

        // Dust Tail (Broader, curved, yellowish-white)
        const dustTailGeo = new THREE.ConeGeometry(0.24, comet.tailLengthScale * 1.2, 24, 1, true);
        const dustTailMat = new THREE.MeshBasicMaterial({
          color: 0xfff0b8,
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        });
        const dustTail = new THREE.Mesh(dustTailGeo, dustTailMat);
        dustTail.geometry.translate(0, comet.tailLengthScale * 0.6, 0);
        dustTail.rotation.z = 0.15;
        cometRoot.add(dustTail);

        cometMeshesRef.current.push({
          mesh: cometRoot,
          ionTail,
          dustTail,
          data: comet,
          hitMesh: cometHit,
          initialAngle: cAngle,
        });
      } else {
        const dummyTail = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ visible: false }));
        cometMeshesRef.current.push({
          mesh: cometRoot,
          ionTail: dummyTail,
          dustTail: dummyTail,
          data: comet,
          hitMesh: cometHit,
          initialAngle: cAngle,
        });
      }

      cometGroup.add(cometRoot);
    });

    // ── Planets & Moons Setup ─────────────────────────────────────────────────
    planetMeshesRef.current = [];
    marsLocationHitTargetsRef.current = [];
    moonMeshesRef.current = [];

    planets.forEach(planet => {
      const pos = planet.currentPositionAU!;
      scene.add(createOrbitLine(planet.semiMajorAxisAU, planet.eccentricity, planet.colorHex, 0.22));

      const radius = PLANET_VISUAL_RADII[planet.id] || 0.2;
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.82,
        metalness: 0.05,
      });

      // Load authentic NASA photographic texture
      const texPath = PLANET_TEXTURES[planet.id];
      if (texPath) {
        textureLoader.load(texPath, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          mat.map = tex;
          if (['mercury', 'mars', 'earth'].includes(planet.id)) {
            mat.bumpMap = tex;
            mat.bumpScale = planet.id === 'earth' ? 0.015 : 0.024;
          }
          mat.needsUpdate = true;
        });
      }

      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 48), mat);
      mesh.position.set(pos.x * AU_SCALE, pos.y * AU_SCALE, pos.z * AU_SCALE);
      mesh.userData = { bodyId: planet.id };
      scene.add(mesh);

      // Earth Setup: Moon + LEO Debris Shell
      if (planet.id === 'earth') {
        // Atmospheric Blue Halo
        const earthAtmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(radius * 1.05, 32, 32),
          new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, side: THREE.BackSide })
        );
        mesh.add(earthAtmosphere);

        // Tracked LEO / GEO Space Debris Shell (1,200 micro-particles)
        const debrisCount = 1200;
        const debrisPos = new Float32Array(debrisCount * 3);
        for (let i = 0; i < debrisCount; i++) {
          const theta = Math.random() * 2 * Math.PI;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = radius * (1.12 + Math.random() * 0.45); // LEO to GEO shell
          debrisPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
          debrisPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          debrisPos[i * 3 + 2] = r * Math.cos(phi);
        }
        const debrisGeo = new THREE.BufferGeometry();
        debrisGeo.setAttribute('position', new THREE.BufferAttribute(debrisPos, 3));
        const debrisMesh = new THREE.Points(debrisGeo, new THREE.PointsMaterial({
          map: asteroidSpriteTex,
          color: 0x22e5ff,
          size: 0.025,
          transparent: true,
          opacity: 0.72,
          depthWrite: false,
          sizeAttenuation: true,
        }));
        mesh.add(debrisMesh);
        debrisGroup.add(debrisMesh);
        earthDebrisMeshRef.current = debrisMesh;
      }

      // Mars Setup: Realistic Atmosphere & Landing Site Pins
      if (planet.id === 'mars') {
        marsMeshRef.current = mesh;

        const atmoGeo = new THREE.SphereGeometry(radius * 1.026, 48, 48);
        const atmoMat = new THREE.MeshStandardMaterial({
          color: 0xeb7746,
          transparent: true,
          opacity: 0.22,
          roughness: 0.9,
          side: THREE.BackSide,
        });
        mesh.add(new THREE.Mesh(atmoGeo, atmoMat));

        const rimGeo = new THREE.SphereGeometry(radius * 1.012, 32, 32);
        const rimMat = new THREE.MeshBasicMaterial({
          color: 0xf97316,
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
        });
        mesh.add(new THREE.Mesh(rimGeo, rimMat));

        // Landing site pins
        const markerGroup = new THREE.Group();
        mesh.add(markerGroup);

        MARS_LOCATIONS.forEach(loc => {
          const phi = (90 - loc.latitude) * (Math.PI / 180);
          const theta = (loc.longitude + 180) * (Math.PI / 180);
          const x = -(radius * 1.02 * Math.sin(phi) * Math.cos(theta));
          const z = radius * 1.02 * Math.sin(phi) * Math.sin(theta);
          const y = radius * 1.02 * Math.cos(phi);

          const pinGeo = new THREE.SphereGeometry(radius * 0.038, 16, 16);
          const pinMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
          const pinMesh = new THREE.Mesh(pinGeo, pinMat);
          pinMesh.position.set(x, y, z);
          markerGroup.add(pinMesh);

          const ringGeo = new THREE.RingGeometry(radius * 0.05, radius * 0.065, 24);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.set(x * 1.002, y * 1.002, z * 1.002);
          ringMesh.lookAt(new THREE.Vector3(x * 2, y * 2, z * 2));
          markerGroup.add(ringMesh);

          const hitGeo = new THREE.SphereGeometry(radius * 0.18, 10, 10);
          const hitMat = new THREE.MeshBasicMaterial({ visible: false });
          const hitMesh = new THREE.Mesh(hitGeo, hitMat);
          hitMesh.position.set(x, y, z);
          hitMesh.userData = { isMarsLocation: true, location: loc };
          markerGroup.add(hitMesh);
          marsLocationHitTargetsRef.current.push({ mesh: hitMesh, location: loc });
        });
      }

      // Rings for Saturn & Uranus
      if (planet.id === 'saturn') createSaturnRings(mesh, textureLoader);
      if (planet.id === 'uranus') createUranusRings(mesh);

      // Gas Giants Atmospheric Glow
      if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(planet.id)) {
        const haloColor = planet.id === 'jupiter' ? 0xc88b3a : planet.id === 'saturn' ? 0xecb454 : planet.id === 'uranus' ? 0x7de8e8 : 0x3f54ba;
        mesh.add(new THREE.Mesh(
          new THREE.SphereGeometry(radius * 1.06, 32, 32),
          new THREE.MeshBasicMaterial({ color: haloColor, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, side: THREE.BackSide })
        ));
      }

      // Add Detailed Moons from dataset for this planet
      const planetMoons = DETAILED_MOONS.filter(m => m.parentPlanetId === planet.id);
      planetMoons.forEach((m, mIdx) => {
        const mRadius = Math.max(0.018, (m.diameterKm / 5000) * radius * 0.4);
        const mDist = radius * 1.5 + (mIdx + 1) * 0.42;

        let moonGeo: THREE.BufferGeometry;
        if (m.id === 'phobos') {
          // Phobos: triaxial potato shape deformed with Stickney crater depression
          moonGeo = createRealisticAsteroidGeometry(mRadius * 1.35, 'elongated', 7);
        } else if (m.id === 'deimos') {
          // Deimos: smoother rubble-pile pillow shape
          moonGeo = createRealisticAsteroidGeometry(mRadius * 1.25, 'rubble-pile', 13);
        } else if (m.id === 'mimas') {
          // Mimas: spherical with giant Herschel impact basin
          moonGeo = createRealisticAsteroidGeometry(mRadius, 'dwarf', 21);
        } else {
          moonGeo = new THREE.SphereGeometry(mRadius, 32, 32);
        }

        const moonMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: m.roughness,
          metalness: 0.05,
        });

        // Load authentic photographic texture (Galileo, Cassini, Voyager 2, HiRISE, LRO)
        const texPath = MOON_TEXTURES[m.id];
        if (texPath) {
          textureLoader.load(texPath, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 8;
            moonMat.map = tex;
            moonMat.bumpMap = tex;
            moonMat.bumpScale = (m.id === 'phobos' || m.id === 'callisto') ? 0.025 : 0.015;
            moonMat.needsUpdate = true;
          });
        } else {
          moonMat.color.setHex(m.colorHex);
        }

        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.set(mDist, 0, 0);
        moonMesh.userData = { moonId: m.id, data: m };
        mesh.add(moonMesh);

        // Titan: dense nitrogen-methane golden atmosphere haze halo
        if (m.id === 'titan') {
          const titanHaze = new THREE.Mesh(
            new THREE.SphereGeometry(mRadius * 1.08, 32, 32),
            new THREE.MeshBasicMaterial({
              color: 0xf59e0b,
              transparent: true,
              opacity: 0.28,
              blending: THREE.AdditiveBlending,
              side: THREE.BackSide,
            })
          );
          moonMesh.add(titanHaze);
        }

        // Enceladus: supersonic south pole cryovolcanic water ice geyser plume
        if (m.id === 'enceladus') {
          const plumeGeo = new THREE.ConeGeometry(mRadius * 0.35, mRadius * 0.9, 16, 1, true);
          const plumeMat = new THREE.MeshBasicMaterial({
            color: 0x93c5fd,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          });
          const plumeMesh = new THREE.Mesh(plumeGeo, plumeMat);
          plumeMesh.position.set(0, -mRadius * 0.85, 0);
          plumeMesh.rotation.x = Math.PI; // Erupting downward from south pole
          moonMesh.add(plumeMesh);
        }

        // Clickable hit target for this moon
        const moonHit = new THREE.Mesh(
          new THREE.SphereGeometry(Math.max(mRadius * 3.5, 0.25), 8, 8),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        moonHit.position.copy(moonMesh.position);
        moonHit.userData = { moonId: m.id, data: m };
        mesh.add(moonHit);

        moonMeshesRef.current.push({
          mesh: moonMesh,
          parentMesh: mesh,
          data: m,
          hitMesh: moonHit,
        });
      });

      // Planet hit target for clicking
      const hitRadius = Math.max(radius * 2.2, 1.0);
      const hitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(hitRadius, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitMesh.position.copy(mesh.position);
      hitMesh.userData = { bodyId: planet.id };
      scene.add(hitMesh);

      planetMeshesRef.current.push({ mesh, data: planet, hitMesh });
    });

    // ── Historic Spacecraft & Planetary Orbiting Satellites ──────────────────
    spacecraftMeshesRef.current = [];
    HISTORIC_SPACECRAFT.forEach(probe => {
      let px = 0, py = 0, pz = 0;

      if (probe.orbitingBodyId) {
        // Orbiting satellite (ISS, Hubble, MRO, Cassini)
        const parentEntry = planetMeshesRef.current.find(p => p.data.id === probe.orbitingBodyId);
        const pRad = PLANET_VISUAL_RADII[probe.orbitingBodyId] || 0.2;
        const orbR = pRad * (probe.orbitalAltitudeScale || 1.3);
        const pPos = parentEntry ? parentEntry.mesh.position : new THREE.Vector3(0, 0, 0);
        px = pPos.x + orbR;
        py = pPos.y;
        pz = pPos.z;

        // Subtle orbital trace ring around parent planet
        const ringGeo = new THREE.RingGeometry(orbR * 0.995, orbR * 1.005, 60);
        const ringMat = new THREE.MeshBasicMaterial({ color: probe.colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        if (parentEntry) parentEntry.mesh.add(ringMesh);
      } else if (probe.id === 'jwst') {
        // 1.5 million km outward from Earth at Sun-Earth L2
        const earthEntry = planetMeshesRef.current.find(p => p.data.id === 'earth');
        if (earthEntry) {
          const earthPos = earthEntry.mesh.position;
          const earthDir = earthPos.clone().normalize();
          const jwstPos = earthPos.clone().add(earthDir.multiplyScalar(0.48));
          px = jwstPos.x; py = jwstPos.y; pz = jwstPos.z;
        }
      } else {
        const pDist = probe.heliocentricDistanceAU * AU_SCALE;
        px = pDist * Math.cos(probe.trajectoryAngleRad);
        py = probe.id === 'voyager-1' ? 25.0 : 4.0; // Voyager 1 steep ecliptic exit
        pz = pDist * Math.sin(probe.trajectoryAngleRad);

        // Deep space trajectory line
        const linePoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(px, py, pz)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        probeGroup.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: probe.colorHex, transparent: true, opacity: 0.25 })));
      }

      // High-Definition Procedural 3D Spacecraft Model
      const scMesh = createDetailedSpacecraftModel(probe);
      scMesh.position.set(px, py, pz);
      scMesh.userData = { spacecraftId: probe.id, data: probe };
      probeGroup.add(scMesh);

      // Hit Target for smooth raycasting & clicking
      const scHit = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
      scHit.position.copy(scMesh.position);
      scHit.userData = { spacecraftId: probe.id, data: probe };
      probeGroup.add(scHit);

      spacecraftMeshesRef.current.push({ mesh: scMesh, data: probe, hitMesh: scHit });
    });

    // ── Initial Camera Placement on Mars ──────────────────────────────────────
    const initialMars = planetMeshesRef.current.find(p => p.data.id === 'mars');
    if (initialMars) {
      controls.target.copy(initialMars.mesh.position);
      camera.position.set(
        initialMars.mesh.position.x + 0.5,
        initialMars.mesh.position.y + 0.35,
        initialMars.mesh.position.z + 0.65
      );
      controls.update();
    }

    // ── Raycasting & Click Handling ───────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Track whether the mouse/pointer was pressed down ON the canvas.
    // This is the only reliable way to distinguish:
    //   (a) a genuine canvas click (user clicked the 3D scene) — mousedown was on canvas ✓
    //   (b) a UI panel button click that got redirected — mousedown was on the button ✗
    // Neither e.target checks nor timestamp heuristics handle the DOM-removal
    // redirect perfectly, but this native pointerdown flag is bulletproof.
    let mouseDownOnCanvas = false;
    const onCanvasPointerDown = () => { mouseDownOnCanvas = true; };
    renderer.domElement.addEventListener('pointerdown', onCanvasPointerDown);

    const onCanvasClick = (e: MouseEvent) => {
      // Only process clicks whose press (pointerdown) originated on the canvas.
      // If the user pressed on a UI button, mouseDownOnCanvas is false and we
      // bail out immediately — even if the browser redirected the click here
      // because the button element was removed from the DOM before mouseup.
      const fromCanvas = mouseDownOnCanvas;
      mouseDownOnCanvas = false; // reset for next interaction
      if (!fromCanvas) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // 1. If focused on Mars, check Mars landing sites first
      if (focusedBodyIdRef.current === 'mars') {
        const siteHits = raycaster.intersectObjects(marsLocationHitTargetsRef.current.map(h => h.mesh), false);
        if (siteHits.length > 0) {
          const loc = siteHits[0].object.userData.location as MarsLocation;
          setSelectedMarsLocation(loc);
          return;
        }
      }

      // 2. Check Moons
      if (layers.moons) {
        const moonHits = raycaster.intersectObjects(moonMeshesRef.current.map(m => m.hitMesh), false);
        if (moonHits.length > 0) {
          const moonData = moonHits[0].object.userData.data as DetailedMoonData;
          focusOnBody(moonData.id);
          return;
        }
      }

      // 3. Check Comets
      if (layers.comets) {
        const cometHits = raycaster.intersectObjects(cometMeshesRef.current.map(c => c.hitMesh), false);
        if (cometHits.length > 0) {
          const cometData = cometHits[0].object.userData.data as CometData;
          focusOnBody(cometData.id);
          return;
        }
      }

      // 4. Check Asteroids & Dwarf Planets
      if (layers.asteroids) {
        const asteroidHits = raycaster.intersectObjects(minorBodyHitTargetsRef.current.map(a => a.mesh), false);
        if (asteroidHits.length > 0) {
          const astData = asteroidHits[0].object.userData.data as MinorBodyData;
          focusOnBody(astData.id);
          return;
        }
      }

      // 5. Check Spacecraft
      if (layers.probes) {
        const probeHits = raycaster.intersectObjects(spacecraftMeshesRef.current.map(s => s.hitMesh), false);
        if (probeHits.length > 0) {
          const probeData = probeHits[0].object.userData.data as SpacecraftData;
          focusOnBody(probeData.id);
          return;
        }
      }

      // 6. Check Planets
      const planetHits = raycaster.intersectObjects(planetMeshesRef.current.map(p => p.mesh), false);
      if (planetHits.length > 0) {
        const hitId = planetHits[0].object.userData.bodyId as string;
        focusOnBody(hitId);
        return;
      }

      // 7. Check Sun
      const sunTargets: THREE.Object3D[] = [];
      if (sunHitMeshRef.current) sunTargets.push(sunHitMeshRef.current);
      if (sunMeshRef.current) sunTargets.push(sunMeshRef.current);
      if (sunTargets.length > 0) {
        const sunHits = raycaster.intersectObjects(sunTargets, false);
        if (sunHits.length > 0) {
          focusOnBody('sun');
          return;
        }
      }
    };
    renderer.domElement.addEventListener('click', onCanvasClick);

    // Hover detection for Mars landing sites
    const onCanvasMouseMove = (e: MouseEvent) => {
      if (focusedBodyIdRef.current !== 'mars') {
        setHoveredMarsLocation(null);
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const siteHits = raycaster.intersectObjects(marsLocationHitTargetsRef.current.map(h => h.mesh), false);
      if (siteHits.length > 0) {
        setHoveredMarsLocation(siteHits[0].object.userData.location as MarsLocation);
      } else {
        setHoveredMarsLocation(null);
      }
    };
    renderer.domElement.addEventListener('mousemove', onCanvasMouseMove);

    // Window Resize Handler
    const onResize = () => {
      const nW = container.clientWidth;
      const nH = container.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener('resize', onResize);

    // ── Animation Loop ────────────────────────────────────────────────────────
    let time = 0;
    const timeScale = 3.5;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      time += 0.008;

      // Advance Simulation Timeline
      if (isSimPlayingRef.current) {
        const yearIncrement = 0.016 / Math.max(0.2, simSpeedSecPerYearRef.current);
        simulatedYearRef.current += yearIncrement;
        if (simulatedYearRef.current > 2030.5) {
          simulatedYearRef.current = 1950.0;
        }

        // Throttle UI synchronization to reduce React re-renders ONLY when simulation is playing
        frameCountRef.current++;
        if (frameCountRef.current % 5 === 0) {
          setDisplayYear(simulatedYearRef.current);

          // Milestone event detection during playback or scrubbing
          const currY = simulatedYearRef.current;
          const matchingMilestone = TIMELINE_MILESTONES.find(m => Math.abs(currY - m.year) <= 0.45);
          if (matchingMilestone) {
            if (lastTriggeredMilestoneIdRef.current !== matchingMilestone.id) {
              lastTriggeredMilestoneIdRef.current = matchingMilestone.id;
              setActiveMilestone(matchingMilestone);
            }
          }
        }
      } else if (!isOrbitPausedRef.current) {
        // Natural gentle real-time drift for Three.js 3D orbits (no continuous React state re-renders)
        simulatedYearRef.current += 0.0002;
      }

      const currentYear = simulatedYearRef.current;
      const isStrict = strictTimelineModeRef.current;

      // 1. Planetary Orbital Dynamics (Keplerian motion from J2000 epoch)
      planetMeshesRef.current.forEach(({ mesh, data, hitMesh }) => {
        const periodYears = Math.max(0.01, data.orbitalPeriodDays / 365.25);
        const meanMotionRadPerYear = (2 * Math.PI) / periodYears;
        const baseAngle = (data.id.charCodeAt(0) * 1.5) % (Math.PI * 2);
        const orbAngle = baseAngle + (currentYear - 2000.0) * meanMotionRadPerYear;
        const dist = data.semiMajorAxisAU * AU_SCALE;
        mesh.position.x = dist * Math.cos(orbAngle);
        mesh.position.z = dist * Math.sin(orbAngle);
        hitMesh.position.copy(mesh.position);

        // Axial rotation
        mesh.rotation.y += 0.004;
      });

      // 2. Moons orbiting parent planets
      moonMeshesRef.current.forEach(({ mesh: mMesh, parentMesh, data: mData, hitMesh }) => {
        const mAngle = (currentYear * (365.25 / mData.orbitalPeriodDays) * 0.25) + (mData.id.charCodeAt(0) * 1.2);
        const mDist = mMesh.position.length();
        mMesh.position.x = mDist * Math.cos(mAngle);
        mMesh.position.z = mDist * Math.sin(mAngle);
        hitMesh.position.copy(mMesh.position);
      });

      // 3. Notable Asteroids & Dwarf Planets with Discovery Timeline
      notableAsteroidMeshesRef.current.forEach(({ mesh: astMesh, data: ast, hitMesh, initialAngle }) => {
        const isDiscovered = !ast.discoveryYear || currentYear >= ast.discoveryYear;
        if (isStrict && !isDiscovered) {
          astMesh.visible = false;
          hitMesh.visible = false;
        } else {
          astMesh.visible = true;
          hitMesh.visible = true;

          const periodYears = Math.max(0.1, ast.orbitalPeriodDays / 365.25);
          const radPerYear = (2 * Math.PI) / periodYears;
          const astAngle = initialAngle + (currentYear - 2000.0) * radPerYear;
          const astDist = ast.semiMajorAxisAU * AU_SCALE;
          astMesh.position.x = astDist * Math.cos(astAngle);
          astMesh.position.z = astDist * Math.sin(astAngle);
          hitMesh.position.copy(astMesh.position);
          astMesh.rotation.y += 0.008;
        }
      });

      // 4. Comets with Dynamic Perihelion Flares & Anti-Solar Tails
      cometMeshesRef.current.forEach(({ mesh: cMesh, ionTail, dustTail, data: comet, hitMesh, initialAngle }) => {
        const isDiscovered = !comet.discoveryYear || currentYear >= comet.discoveryYear;

        let isNearPerihelion = false;
        let tailActivity = 0.08;

        if (comet.id === 'halley') {
          // Halley returns ~1910.3, 1986.11, 2061.5
          const dist1910 = Math.abs(currentYear - 1910.3);
          const dist1986 = Math.abs(currentYear - 1986.11);
          const dist2061 = Math.abs(currentYear - 2061.5);
          const minDist = Math.min(dist1910, dist1986, dist2061);
          if (minDist < 2.5) {
            isNearPerihelion = true;
            tailActivity = Math.max(0.18, 1.0 - (minDist / 2.5));
          }
        } else if (comet.id === 'neowise') {
          const dist2020 = Math.abs(currentYear - 2020.51);
          if (dist2020 < 1.2) {
            isNearPerihelion = true;
            tailActivity = Math.max(0.2, 1.0 - (dist2020 / 1.2));
          }
        } else if (comet.id === 'oumuamua') {
          const dist2017 = Math.abs(currentYear - 2017.81);
          if (dist2017 < 1.5) {
            isNearPerihelion = true;
            tailActivity = Math.max(0.1, 1.0 - (dist2017 / 1.5));
          }
        } else if (comet.id === '67p') {
          const cycle = Math.abs((currentYear - 2015.6) % 6.45);
          const distFromPeak = Math.min(cycle, 6.45 - cycle);
          if (distFromPeak < 1.4) {
            isNearPerihelion = true;
            tailActivity = Math.max(0.2, 1.0 - (distFromPeak / 1.4));
          }
        }

        if (isStrict && !isDiscovered) {
          cMesh.visible = false;
          hitMesh.visible = false;
        } else if (isStrict && comet.id === 'oumuamua' && Math.abs(currentYear - 2017.81) > 2.0) {
          cMesh.visible = false;
          hitMesh.visible = false;
        } else if (isStrict && comet.id === 'neowise' && Math.abs(currentYear - 2020.51) > 3.0) {
          cMesh.visible = false;
          hitMesh.visible = false;
        } else {
          cMesh.visible = true;
          hitMesh.visible = true;

          const cPeriodYears = comet.orbitalPeriodDays > 0 ? comet.orbitalPeriodDays / 365.25 : 12.0;
          const cRadPerYear = (2 * Math.PI) / cPeriodYears;
          const cAngle = initialAngle + (currentYear - 2000.0) * cRadPerYear;
          const cDistAU = (isNearPerihelion ? comet.perihelionAU * 1.8 : (comet.perihelionAU + 4.2)) * AU_SCALE;
          cMesh.position.x = cDistAU * Math.cos(cAngle);
          cMesh.position.z = cDistAU * Math.sin(cAngle);
          hitMesh.position.copy(cMesh.position);

          if (comet.id !== 'oumuamua') {
            const sunPos = new THREE.Vector3(0, 0, 0);
            const antiSolarDir = cMesh.position.clone().sub(sunPos).normalize();
            const tailTarget = cMesh.position.clone().add(antiSolarDir);
            cMesh.lookAt(tailTarget);
            ionTail.rotation.x = Math.PI / 2;
            dustTail.rotation.x = Math.PI / 2;

            const tailScale = isNearPerihelion ? Math.max(0.35, tailActivity) : 0.08;
            ionTail.scale.set(tailScale, tailScale, tailScale);
            dustTail.scale.set(tailScale, tailScale, tailScale);
            (ionTail.material as THREE.MeshBasicMaterial).opacity = 0.48 * tailScale;
            (dustTail.material as THREE.MeshBasicMaterial).opacity = 0.32 * tailScale;
          }
        }
      });

      // 5. Rotate Trojans along with Jupiter
      if (asteroidGroupRef.current) {
        asteroidGroupRef.current.rotation.y += 0.0002;
      }

      // 6. Spacecraft & Satellite Launch Dates & Dynamic Trajectories
      spacecraftMeshesRef.current.forEach(({ mesh: scMesh, data: probe, hitMesh }) => {
        const isLaunched = currentYear >= probe.launchYear;
        const isEnded = probe.endYear && currentYear > probe.endYear;

        if (isStrict && !isLaunched) {
          scMesh.visible = false;
          hitMesh.visible = false;
          return;
        }

        scMesh.visible = true;
        hitMesh.visible = true;

        if (probe.orbitingBodyId) {
          const parentEntry = planetMeshesRef.current.find(p => p.data.id === probe.orbitingBodyId);
          if (parentEntry) {
            const pPos = parentEntry.mesh.position;
            const pRad = PLANET_VISUAL_RADII[probe.orbitingBodyId] || 0.2;
            const orbR = pRad * (probe.orbitalAltitudeScale || 1.3);
            const orbSpeed = (probe.orbitalSpeed || 0.5) * 0.9;
            const angle = (time * orbSpeed * 12) + (probe.id.charCodeAt(0) * 1.5);
            const ox = orbR * Math.cos(angle);
            const oz = orbR * Math.sin(angle);
            const oy = probe.id === 'iss' ? 0.03 * Math.sin(angle * 2) : 0;
            scMesh.position.set(pPos.x + ox, pPos.y + oy, pPos.z + oz);
            scMesh.lookAt(pPos);
            hitMesh.position.copy(scMesh.position);
          }
        } else if (probe.id === 'jwst') {
          const earthMesh = planetMeshesRef.current.find(p => p.data.id === 'earth');
          if (earthMesh) {
            const earthPos = earthMesh.mesh.position;
            const earthDir = earthPos.clone().normalize();
            const jwstPos = earthPos.clone().add(earthDir.multiplyScalar(0.48));
            scMesh.position.copy(jwstPos);
            hitMesh.position.copy(jwstPos);
          }
        } else if (probe.id === 'voyager-1') {
          // Outward deep space flight from 1977 to present
          const elapsedYears = Math.max(0, currentYear - 1977.68);
          const voyagerAU = Math.min(163.5, 1.0 + elapsedYears * 3.32);
          const vDist = voyagerAU * AU_SCALE;
          const px = vDist * Math.cos(probe.trajectoryAngleRad);
          const py = 25.0 * Math.min(1.0, voyagerAU / 163.5);
          const pz = vDist * Math.sin(probe.trajectoryAngleRad);
          scMesh.position.set(px, py, pz);
          hitMesh.position.copy(scMesh.position);
        } else if (probe.id === 'new-horizons') {
          const nhElapsed = Math.max(0, currentYear - 2006.05);
          const nhAU = Math.min(59.2, 1.0 + nhElapsed * 2.85);
          const nhDist = nhAU * AU_SCALE;
          const px = nhDist * Math.cos(probe.trajectoryAngleRad);
          const py = 4.0 * Math.min(1.0, nhAU / 59.2);
          const pz = nhDist * Math.sin(probe.trajectoryAngleRad);
          scMesh.position.set(px, py, pz);
          hitMesh.position.copy(scMesh.position);
        }
      });

      // 7. Earth Space Debris Accumulation from 1957 to Present
      if (debrisGroupRef.current) {
        if (isStrict && currentYear < 1957.76) {
          debrisGroupRef.current.visible = false;
        } else {
          debrisGroupRef.current.visible = layers.debris;
          if (earthDebrisMeshRef.current) {
            const accumulation = Math.min(1.0, Math.max(0.04, (currentYear - 1957) / (2026 - 1957)));
            (earthDebrisMeshRef.current.material as THREE.PointsMaterial).opacity = 0.72 * accumulation;
          }
        }
      }

      if (sunMeshRef.current) {
        sunMeshRef.current.rotation.y += 0.0006;
      }
      if (sunChromosphereRef.current) {
        sunChromosphereRef.current.rotation.y -= 0.0003;
        sunChromosphereRef.current.rotation.x += 0.00015;
      }
      if (sunProminencesRef.current) {
        const pulse = 1.0 + 0.035 * Math.sin(time * 3.2);
        sunProminencesRef.current.scale.set(pulse, pulse, pulse);
      }
      if (sunCoronaGroupRef.current) {
        const cPulse = 1.0 + 0.018 * Math.sin(time * 1.8);
        sunCoronaGroupRef.current.scale.set(cPulse, cPulse, cPulse);
        sunCoronaGroupRef.current.rotation.z += 0.0001;
      }

      // Slowly tumble the instanced belt rocks (each rock tumbles on all 3 axes)
      if (instancedAsteroidsRef.current.length > 0) {
        const tumbleMat = new THREE.Matrix4();
        const tumblePos = new THREE.Vector3();
        const tumbleQuat = new THREE.Quaternion();
        const tumbleScale = new THREE.Vector3();
        const rotDelta = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.0003, 0.0005, 0.0002));

        instancedAsteroidsRef.current.forEach((instMesh) => {
          for (let ri = 0; ri < instMesh.count; ri++) {
            instMesh.getMatrixAt(ri, tumbleMat);
            tumbleMat.decompose(tumblePos, tumbleQuat, tumbleScale);
            tumbleQuat.multiply(rotDelta);
            tumbleMat.compose(tumblePos, tumbleQuat, tumbleScale);
            instMesh.setMatrixAt(ri, tumbleMat);
          }
          instMesh.instanceMatrix.needsUpdate = true;
        });
      }

      // 2. Camera Flight Transition Interpolation
      if (flightTargetPosRef.current && flightTargetDistRef.current !== null) {
        controls.target.lerp(flightTargetPosRef.current, 0.08);

        const camToTarget = camera.position.clone().sub(controls.target);
        const currentDist = camToTarget.length();
        const desiredDist = flightTargetDistRef.current;
        const newDist = THREE.MathUtils.lerp(currentDist, desiredDist, 0.07);
        if (currentDist > 0.001) {
          camToTarget.normalize().multiplyScalar(newDist);
          camera.position.copy(controls.target).add(camToTarget);
        }

        if (controls.target.distanceTo(flightTargetPosRef.current) < 0.05 && Math.abs(currentDist - desiredDist) < 0.1) {
          flightTargetPosRef.current = null;
          flightTargetDistRef.current = null;
        }
      } else if (focusedBodyIdRef.current) {
        // Continuous Body Tracking: Lock onto moving planet, moon, or asteroid
        if (focusedBodyIdRef.current === 'sun') {
          controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.08);
        } else {
          // Check planet
          const pEntry = planetMeshesRef.current.find(p => p.data.id === focusedBodyIdRef.current);
          if (pEntry) {
            const oldTarget = controls.target.clone();
            controls.target.lerp(pEntry.mesh.position, 0.1);
            const delta = controls.target.clone().sub(oldTarget);
            camera.position.add(delta);
          } else {
            // Check moon
            const mEntry = moonMeshesRef.current.find(m => m.data.id === focusedBodyIdRef.current);
            if (mEntry) {
              const worldPos = new THREE.Vector3();
              mEntry.mesh.getWorldPosition(worldPos);
              const oldTarget = controls.target.clone();
              controls.target.lerp(worldPos, 0.1);
              const delta = controls.target.clone().sub(oldTarget);
              camera.position.add(delta);
            } else {
              // Check spacecraft
              const scEntry = spacecraftMeshesRef.current.find(s => s.data.id === focusedBodyIdRef.current);
              if (scEntry) {
                const worldPos = new THREE.Vector3();
                scEntry.mesh.getWorldPosition(worldPos);
                const oldTarget = controls.target.clone();
                controls.target.lerp(worldPos, 0.1);
                const delta = controls.target.clone().sub(oldTarget);
                camera.position.add(delta);
              }
            }
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      renderer.domElement.removeEventListener('pointerdown', onCanvasPointerDown);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      renderer.domElement.removeEventListener('mousemove', onCanvasMouseMove);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [planets, focusOnBody]);

  // ── Timeline Simulation Controls ───────────────────────────────────────────
  const togglePlaySimulation = () => {
    const next = !isSimPlaying;
    setIsSimPlaying(next);
    isSimPlayingRef.current = next;
  };

  const handleScrubSimulation = (year: number) => {
    simulatedYearRef.current = year;
    setSimulatedYear(year);
    setDisplayYear(year);

    // Check for milestone
    const m = TIMELINE_MILESTONES.find(item => Math.abs(year - item.year) <= 0.45);
    if (m) {
      setActiveMilestone(m);
      lastTriggeredMilestoneIdRef.current = m.id;
    }
  };

  const handleSpeedChange = (speedSec: number) => {
    setSimSpeedSecPerYear(speedSec);
    simSpeedSecPerYearRef.current = speedSec;
  };

  const toggleStrictTimeline = () => {
    const next = !strictTimelineMode;
    setStrictTimelineMode(next);
    strictTimelineModeRef.current = next;
  };

  const stepSimulation = (yearDelta: number) => {
    const next = Math.max(1950, Math.min(2030, simulatedYearRef.current + yearDelta));
    handleScrubSimulation(next);
  };

  const formatSimDate = (floatYear: number) => {
    const year = Math.floor(floatYear);
    const frac = floatYear - year;
    const dayOfYear = Math.floor(frac * 365.25);
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + dayOfYear);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = months[date.getMonth()] || 'Jan';
    const dayStr = String(date.getDate()).padStart(2, '0');
    return { year, monthStr, dayStr, formatted: `${monthStr} ${dayStr}, ${year}`, epochStr: `J${floatYear.toFixed(2)}` };
  };

  // ── Manual Zoom Controls (+ / -) ───────────────────────────────────────────
  const handleZoom = (factor: number) => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object as THREE.PerspectiveCamera;
    const offset = camera.position.clone().sub(controlsRef.current.target);
    offset.multiplyScalar(factor);
    const len = offset.length();
    if (len >= controlsRef.current.minDistance && len <= controlsRef.current.maxDistance) {
      camera.position.copy(controlsRef.current.target).add(offset);
      controlsRef.current.update();
    }
  };

  // ── Preset Zoom Scales ──────────────────────────────────────────────────────
  const setScalePreset = (distanceAU: number) => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object as THREE.PerspectiveCamera;
    const targetDist = distanceAU * AU_SCALE;
    const direction = camera.position.clone().sub(controlsRef.current.target).normalize();
    camera.position.copy(controlsRef.current.target).add(direction.multiplyScalar(targetDist));
    controlsRef.current.update();
  };

  // ── Planet HUD Panel ────────────────────────────────────────────────────────
  const PlanetPanel: React.FC<{ planet: PlanetData }> = ({ planet }) => (
    <div className="absolute right-3 sm:right-4 top-14 sm:top-16 z-50 w-[calc(100vw-1.5rem)] sm:w-84 max-w-sm rounded-2xl border border-slate-700/80 bg-black/95 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden max-h-[85vh] overflow-y-auto animate-in slide-in-from-right-4 fade-in duration-300 pointer-events-auto">
      <div
        className="relative px-5 pt-5 pb-3"
        style={{ background: `linear-gradient(135deg, #${planet.colorHex.toString(16).padStart(6, '0')}32, transparent)` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">
              NASA JPL Body #{planet.nasaBodyId} · {planet.semiMajorAxisAU.toFixed(2)} AU Orbit
            </p>
            <h2 className="text-2xl font-extrabold font-display text-white tracking-tight">{planet.name}</h2>
            <p className="text-xs font-mono mt-0.5" style={{ color: `#${planet.colorHex.toString(16).padStart(6, '0')}` }}>
              {planet.distanceFromSunAU?.toFixed(3)} AU from Sun · {planet.distanceFromEarthAU?.toFixed(2)} AU from Earth
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedPlanet(null); }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed font-light">{planet.description}</p>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Surface Temp', value: `${planet.meanSurfaceTempC}°C`, icon: <Thermometer className="w-3 h-3 text-red-400" /> },
            { label: 'Orbital Period', value: `${planet.orbitalPeriodDays.toFixed(0)} d`, icon: <Wind className="w-3 h-3 text-green-400" /> },
            { label: 'Confirmed Moons', value: `${planet.numberOfMoons}`, icon: <Zap className="w-3 h-3 text-yellow-400" /> },
            { label: 'Mean Radius', value: `${(planet.radiusKm / 1000).toFixed(1)}K km`, icon: <Globe className="w-3 h-3 text-blue-400" /> },
            { label: 'Gravity', value: `${planet.surfaceGravityMs2} m/s²`, icon: <Zap className="w-3 h-3 text-purple-400" /> },
            { label: 'Day Length', value: `${Math.abs(planet.rotationPeriodHours).toFixed(1)} h`, icon: <Compass className="w-3 h-3 text-orange-400" /> },
          ].map(stat => (
            <div key={stat.label} className="px-2.5 py-2 rounded-lg bg-white/5 border border-white/8">
              <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                {stat.icon}
                <span className="text-[10px] font-mono uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-sm font-bold font-display text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => focusOnBody(planet.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/50 hover:bg-cyan-900/60 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <Focus className="w-3.5 h-3.5" />
            <span>Lock Focus</span>
          </button>

          <a
            href={planet.nasaFactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-950/40 border border-blue-700/40 hover:bg-blue-900/50 text-blue-300 text-xs font-mono transition-colors group"
          >
            <span>NASA Sheet</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {planet.id === 'mars' && (
          <button
            onClick={() => navigate('/mission/location')}
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-mars-600 hover:from-orange-500 hover:to-mars-500 text-white text-xs font-mono transition-all font-bold group cursor-pointer shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              <span>Launch Mars Agricultural Mission</span>
            </div>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );

  // ── Minor Body (Asteroid / Dwarf Planet) Telemetry Card ─────────────────────
  const MinorBodyPanel: React.FC<{ body: MinorBodyData }> = ({ body }) => (
    <div className="absolute right-3 sm:right-4 top-14 sm:top-16 z-50 w-[calc(100vw-1.5rem)] sm:w-84 max-w-sm rounded-2xl border border-amber-500/60 bg-black/95 backdrop-blur-xl shadow-[0_0_45px_rgba(245,158,11,0.25)] overflow-hidden max-h-[85vh] overflow-y-auto animate-in slide-in-from-right-4 fade-in duration-300 pointer-events-auto">
      <div className="px-5 pt-4 pb-3 bg-gradient-to-r from-amber-950/40 to-space-950 border-b border-amber-500/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              {body.type.toUpperCase()} // NASA SMALL-BODY
            </span>
            <h3 className="text-xl font-bold font-display text-white tracking-tight">{body.name}</h3>
            <p className="text-[11px] font-mono text-slate-400">{body.nasaDesignation}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedMinorBody(null); }}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed font-light">{body.description}</p>
        <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] font-mono text-amber-200">
          <strong className="text-amber-400 block mb-1">NASA Mission Telemetry:</strong>
          {body.latestMissionOrFact}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-white/5 border border-white/8">
            <span className="text-[9px] text-slate-500 block uppercase">Diameter</span>
            <span className="font-bold text-white">{body.diameterKm} km</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/8">
            <span className="text-[9px] text-slate-500 block uppercase">Orbit Period</span>
            <span className="font-bold text-white">{body.orbitalPeriodDays} days</span>
          </div>
        </div>
        <a
          href={body.nasaFactUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-700/40 text-amber-300 text-xs font-mono transition-colors group"
        >
          <span>NASA Small-Body Database</span>
          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );

  // ── Comet Telemetry Card ────────────────────────────────────────────────────
  const CometPanel: React.FC<{ comet: CometData }> = ({ comet }) => (
    <div className="absolute right-3 sm:right-4 top-14 sm:top-16 z-50 w-[calc(100vw-1.5rem)] sm:w-84 max-w-sm rounded-2xl border border-cyan-400/70 bg-black/95 backdrop-blur-xl shadow-[0_0_45px_rgba(6,182,212,0.3)] overflow-hidden max-h-[85vh] overflow-y-auto animate-in slide-in-from-right-4 fade-in duration-300 pointer-events-auto">
      <div className="px-5 pt-4 pb-3 bg-gradient-to-r from-cyan-950/50 to-space-950 border-b border-cyan-500/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Flame className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                COMETARY NUCLEUS & SOLAR WIND TAIL
              </span>
            </div>
            <h3 className="text-xl font-bold font-display text-white tracking-tight">{comet.name}</h3>
            <p className="text-[11px] font-mono text-slate-400">{comet.nasaDesignation}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedComet(null); }}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed font-light">{comet.description}</p>
        <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-[11px] font-mono text-cyan-200">
          <strong className="text-cyan-400 block mb-1">Authentic Cometary Mechanics:</strong>
          {comet.latestMissionOrFact}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-white/5 border border-white/8">
            <span className="text-[9px] text-slate-500 block uppercase">Perihelion</span>
            <span className="font-bold text-white">{comet.perihelionAU} AU</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/8">
            <span className="text-[9px] text-slate-500 block uppercase">Eccentricity</span>
            <span className="font-bold text-cyan-300">{comet.eccentricity}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Planetary Moon Telemetry Card ───────────────────────────────────────────
  const MoonPanel: React.FC<{ moon: DetailedMoonData }> = ({ moon }) => (
    <div className="absolute right-3 sm:right-4 top-14 sm:top-16 z-50 w-[calc(100vw-1.5rem)] sm:w-84 max-w-sm rounded-2xl border border-blue-400/60 bg-black/95 backdrop-blur-xl shadow-[0_0_45px_rgba(59,130,246,0.25)] overflow-hidden max-h-[85vh] overflow-y-auto animate-in slide-in-from-right-4 fade-in duration-300 pointer-events-auto">
      <div className="px-5 pt-4 pb-3 bg-gradient-to-r from-blue-950/40 to-space-950 border-b border-blue-500/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
              NATURAL SATELLITE // {moon.parentPlanetId.toUpperCase()}
            </span>
            <h3 className="text-xl font-bold font-display text-white tracking-tight">{moon.name}</h3>
            <p className="text-[11px] font-mono text-slate-400">{moon.diameterKm} km Diameter</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedMoon(null); }}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed font-light">{moon.specialFeature}</p>
        <div className="p-2.5 rounded-xl bg-blue-950/25 border border-blue-500/35 text-[11px] font-mono text-blue-200">
          <strong className="text-blue-400 block mb-1">NASA Exploration Telemetry:</strong>
          {moon.nasaFact}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-white/5 border border-white/8">
            <span className="text-[9px] text-slate-500 block uppercase">Subsurface Ocean</span>
            <span className={`font-bold ${moon.hasSubsurfaceOcean ? 'text-emerald-400' : 'text-slate-400'}`}>
              {moon.hasSubsurfaceOcean ? 'CONFIRMED' : 'NONE'}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/8">
            <span className="text-[9px] text-slate-500 block uppercase">Orbit Period</span>
            <span className="font-bold text-white">{moon.orbitalPeriodDays} d</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Spacecraft / Probe Telemetry Card ───────────────────────────────────────
  const SpacecraftPanel: React.FC<{ probe: SpacecraftData }> = ({ probe }) => (
    <div className="absolute right-3 sm:right-4 top-14 sm:top-16 z-50 w-[calc(100vw-1.5rem)] sm:w-84 max-w-sm rounded-2xl border border-purple-400/60 bg-black/95 backdrop-blur-xl shadow-[0_0_45px_rgba(168,85,247,0.25)] overflow-hidden max-h-[85vh] overflow-y-auto animate-in slide-in-from-right-4 fade-in duration-300 pointer-events-auto">
      <div className="px-5 pt-4 pb-3 bg-gradient-to-r from-purple-950/40 to-space-950 border-b border-purple-500/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                {probe.orbitingBodyId ? `ORBITING ${probe.orbitingBodyId.toUpperCase()}` : 'NASA DEEP SPACE TELEMETRY'}
              </span>
            </div>
            <h3 className="text-xl font-bold font-display text-white tracking-tight">{probe.name}</h3>
            <p className="text-[11px] font-mono text-slate-400">{probe.destination}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedSpacecraft(null); }}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed font-light">{probe.description}</p>
        <div className="p-2.5 rounded-xl bg-purple-950/25 border border-purple-500/35 text-[11px] font-mono text-purple-200">
          <strong className="text-purple-400 block mb-1">Mission Telemetry:</strong>
          {probe.latestStatus}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-white/5 border border-white/8">
            <span className="text-[9px] text-slate-500 block uppercase">Launch Year</span>
            <span className="font-bold text-white text-sm">{probe.launchYear}</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/8">
            <span className="text-[9px] text-slate-500 block uppercase">
              {probe.orbitingBodyId ? 'Orbiter Target' : 'Distance'}
            </span>
            <span className="font-bold text-white text-sm">
              {probe.orbitingBodyId ? probe.orbitingBodyId.toUpperCase() : `${probe.heliocentricDistanceAU} AU`}
            </span>
          </div>
        </div>
        <a
          href={probe.nasaFactUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-mono transition-colors"
        >
          <span>NASA Official Mission Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
        </a>
      </div>
    </div>
  );

  // ── Sun Telemetry Reconnaissance Card ───────────────────────────────────────
  const SunPanel: React.FC = () => (
    <div className="absolute right-3 sm:right-4 top-14 sm:top-16 z-50 w-[calc(100vw-1.5rem)] sm:w-88 max-w-sm rounded-2xl border border-amber-500/70 bg-black/95 backdrop-blur-xl shadow-[0_0_50px_rgba(245,158,11,0.35)] overflow-hidden max-h-[85vh] overflow-y-auto animate-in slide-in-from-right-4 fade-in duration-300 font-sans pointer-events-auto">
      <div className="relative px-5 pt-4 pb-3 bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-space-950 border-b border-amber-500/40">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                SOLAR SYSTEM CENTRAL STAR // G2V
              </span>
            </div>
            <h3 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
              <span>☀️ The Sun (Sol)</span>
            </h3>
            <p className="text-[11px] font-mono text-amber-200/80">Yellow Dwarf · 4.603 Billion Years Old</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setIsSunSelected(false); }}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-3.5">
        <p className="text-xs text-slate-200 leading-relaxed font-light">
          The gravitational powerhouse of our solar system containing 99.86% of all system mass. Powered by proton-proton chain nuclear fusion in its core, fusing 600 million tons of hydrogen into helium every second.
        </p>

        {/* Real-time Sun Status Banner */}
        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-[11px] font-mono text-amber-200">
          <strong className="text-amber-400 block mb-1 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Solar Cycle 25 Telemetry:
          </strong>
          Currently near Solar Maximum with heightened coronal mass ejections (CMEs), active sunspot clusters, and coronal magnetic loops observed by NASA SDO.
        </div>

        {/* Key Physics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[9px] text-slate-500 block uppercase">Core Fusion Temp</span>
            <span className="font-bold text-amber-300 text-sm">15,000,000 °C</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[9px] text-slate-500 block uppercase">Photosphere Surface</span>
            <span className="font-bold text-white text-sm">5,500 °C (5,778 K)</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[9px] text-slate-500 block uppercase">Equatorial Diameter</span>
            <span className="font-bold text-white text-sm">1,392,700 km</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[9px] text-slate-500 block uppercase">Solar Mass</span>
            <span className="font-bold text-white text-sm">1.989 × 10³⁰ kg</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[9px] text-slate-500 block uppercase">Solar Wind Velocity</span>
            <span className="font-bold text-cyan-300 text-sm">450 – 750 km/s</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[9px] text-slate-500 block uppercase">Light Travel to Mars</span>
            <span className="font-bold text-orange-400 text-sm">~12.6 Minutes</span>
          </div>
        </div>

        {/* NASA SDO Mission Portal Link */}
        <a
          href="https://sdo.gsfc.nasa.gov/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/50 text-amber-200 hover:text-white text-xs font-mono transition-colors"
        >
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>NASA Solar Dynamics Observatory (SDO)</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
        </a>
      </div>
    </div>
  );

  // ── Mars Landing Site Reconnaissance Card ───────────────────────────────────
  const MarsLocationCard: React.FC<{ loc: MarsLocation }> = ({ loc }) => (
    <div className="absolute left-3 sm:left-4 top-14 sm:top-16 z-50 w-[calc(100vw-1.5rem)] sm:w-84 max-w-sm rounded-2xl border border-cyan-500/70 bg-black/95 backdrop-blur-xl shadow-[0_0_45px_rgba(0,240,255,0.3)] overflow-hidden max-h-[85vh] overflow-y-auto animate-in slide-in-from-left-4 fade-in duration-300 pointer-events-auto">
      <div className="relative px-5 pt-4 pb-3 bg-gradient-to-r from-cyan-950/50 to-space-950 border-b border-cyan-500/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                ORBITAL SCOUT // {loc.type.toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-bold font-display text-white tracking-tight">{loc.name}</h3>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {loc.latitude}°N · {loc.longitude}°E · {loc.elevationKm} km Elevation
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedMarsLocation(null); }}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed font-light">{loc.description}</p>

        <div className="grid grid-cols-3 gap-2">
          <div className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/8 text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Elevation</span>
            <span className="text-xs font-bold font-display text-white">{loc.elevationKm} km</span>
          </div>
          <div className="px-2 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-700/40 text-center">
            <span className="text-[9px] font-mono text-cyan-400 uppercase block">Solar Score</span>
            <span className="text-xs font-bold font-display text-cyan-200">{loc.solarPotentialScore}/100</span>
          </div>
          <div className="px-2 py-1.5 rounded-lg bg-bio-950/30 border border-bio-700/40 text-center">
            <span className="text-[9px] font-mono text-bio-400 uppercase block">Water Ice</span>
            <span className="text-xs font-bold font-display text-bio-200">{loc.waterPotentialScore}/100</span>
          </div>
        </div>

        <div className="pt-1 flex flex-col gap-2">
          <button
            onClick={() => navigate('/mission/location')}
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-mars-600 hover:from-orange-500 hover:to-mars-500 text-white text-xs font-mono font-bold transition-all shadow-[0_0_20px_rgba(255,77,46,0.35)] group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              <span>Launch Mission at this Site</span>
            </div>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => focusOnBody('sun')}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl bg-space-900/80 hover:bg-space-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Center on Solar System Sun</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none overflow-hidden font-sans">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top HUD Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
          <button
            onClick={() => navigate('/')}
            className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-black/75 hover:bg-black border border-white/10 hover:border-white/30 text-slate-300 hover:text-white text-xs font-mono transition-all backdrop-blur-md shadow-lg cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back<span className="hidden sm:inline"> to Mars Farm</span></span>
          </button>

          <div className="flex flex-col items-center">
            <p className="hidden md:flex text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest items-center gap-1.5">
              <Compass className="w-3 h-3" />
              NASA JPL Heliocentric Ephemeris · Planetary & Minor Bodies
            </p>
            <h1 className="text-xs sm:text-sm font-extrabold font-display text-white tracking-wider sm:tracking-widest whitespace-nowrap">
              SOLAR SYSTEM EXPLORER
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Orbit Motion Toggle */}
            <button
              onClick={() => {
                isOrbitPausedRef.current = !isOrbitPausedRef.current;
                setIsOrbitPaused(!isOrbitPaused);
              }}
              className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-black/75 border border-white/10 hover:border-white/30 text-xs font-mono text-slate-300 hover:text-white transition-all backdrop-blur-md cursor-pointer"
              title="Pause/Resume Orbital Motion"
            >
              {isOrbitPaused ? <Play className="w-3 h-3 text-green-400" /> : <Pause className="w-3 h-3 text-yellow-400" />}
              <span className="hidden sm:inline">{isOrbitPaused ? 'Resume' : 'Pause'}</span>
            </button>

            {/* NASA API Status */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-black/75 border border-white/10 text-xs font-mono backdrop-blur-md">
              <span className={`w-2 h-2 rounded-full ${dataStatus === 'live' ? 'bg-green-400 animate-ping' : 'bg-cyan-400'}`} />
              <span className="text-slate-400 font-mono text-[10px] sm:text-[11px]">
                <span className="sm:hidden">{dataStatus === 'loading' ? 'CALC' : dataStatus === 'live' ? 'LIVE' : 'KEPLER'}</span>
                <span className="hidden sm:inline">{dataStatus === 'loading' ? 'CALCULATING...' : dataStatus === 'live' ? 'LIVE NASA JPL API' : 'NASA KEPLERIAN DATA'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Focus Indicator Badge */}
      <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-[85vw] hidden md:flex">
        <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/85 border border-cyan-500/40 text-[10px] sm:text-xs font-mono text-cyan-300 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.25)] flex items-center gap-1.5 sm:gap-2 truncate">
          <Focus className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="truncate">
            {focusedBodyId
              ? `Tracking: ${focusedBodyId === 'sun' ? '☀️ Sun (Solar Center)' : focusedBodyId.toUpperCase()}`
              : '🔭 Free Scan Mode (Camera Unlocked)'}
          </span>
        </div>
      </div>

      {/* Layer Visibility Toggles (Top Right Floating) */}
      <div className="absolute top-14 sm:top-16 right-2 sm:right-4 z-20 flex items-center gap-1 sm:gap-1.5 p-0.5 sm:p-1 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md max-w-[94vw] overflow-x-auto scrollbar-none">
        <button
          onClick={() => setLayers(l => ({ ...l, asteroids: !l.asteroids }))}
          className={`px-1.5 sm:px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap ${
            layers.asteroids ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Main Asteroid Belt & Trojans"
        >
          🪨 <span className="hidden sm:inline">Asteroids</span><span className="sm:hidden">Ast</span>
        </button>
        <button
          onClick={() => setLayers(l => ({ ...l, comets: !l.comets }))}
          className={`px-1.5 sm:px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap ${
            layers.comets ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Famous Comets with Solar Wind Tails"
        >
          ☄️ <span className="hidden sm:inline">Comets</span><span className="sm:hidden">Com</span>
        </button>
        <button
          onClick={() => setLayers(l => ({ ...l, moons: !l.moons }))}
          className={`px-1.5 sm:px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap ${
            layers.moons ? 'bg-blue-500/25 text-blue-300 border border-blue-500/50' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Planetary Moons (Galilean, Phobos, Titan, Triton, etc.)"
        >
          🪐 <span className="hidden sm:inline">Moons</span><span className="sm:hidden">Moon</span>
        </button>
        <button
          onClick={() => setLayers(l => ({ ...l, probes: !l.probes }))}
          className={`px-1.5 sm:px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap ${
            layers.probes ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Deep Space Probes & JWST at L2"
        >
          🛰️ <span className="hidden sm:inline">Probes</span><span className="sm:hidden">Probe</span>
        </button>
      </div>

      {/* Hover Scout Tooltip for Mars landing sites */}
      {focusedBodyId === 'mars' && hoveredMarsLocation && !selectedMarsLocation && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-black/95 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold shadow-[0_0_25px_rgba(0,240,255,0.5)] pointer-events-none animate-in fade-in">
          🔭 Scout: {hoveredMarsLocation.name} ({hoveredMarsLocation.elevationKm} km) · Click to Inspect
        </div>
      )}

      {/* Right Zoom & Scan Utility Floating Bar */}
      <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-2">
        <button
          onClick={() => handleZoom(0.7)}
          className="p-2.5 rounded-xl bg-black/80 hover:bg-black border border-white/15 hover:border-cyan-400 text-slate-300 hover:text-white transition-all shadow-lg backdrop-blur-md cursor-pointer"
          title="Zoom In Closer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(1.4)}
          className="p-2.5 rounded-xl bg-black/80 hover:bg-black border border-white/15 hover:border-cyan-400 text-slate-300 hover:text-white transition-all shadow-lg backdrop-blur-md cursor-pointer"
          title="Zoom Out Farther"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={() => focusOnBody(null)}
          className={`p-2.5 rounded-xl border transition-all shadow-lg backdrop-blur-md cursor-pointer ${
            focusedBodyId === null
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
              : 'bg-black/80 hover:bg-black border-white/15 text-slate-300 hover:text-white'
          }`}
          title="Unlock Camera for Free Scanning & Panning"
        >
          <Move className="w-4 h-4" />
        </button>
      </div>

      {/* ── Floating Milestone Alert Hologram Toast ─────────────────────────── */}
      {activeMilestone && (
        <div className="absolute bottom-20 sm:bottom-52 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[94%] sm:w-[92%] rounded-2xl bg-black/95 border border-cyan-500/60 p-3.5 sm:p-4 shadow-[0_0_40px_rgba(6,182,212,0.35),0_0_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl max-h-[50vh] overflow-y-auto animate-in slide-in-from-bottom-3 fade-in duration-250">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0 drop-shadow-md">{activeMilestone.badge}</span>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-extrabold">
                    {activeMilestone.dateStr}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold uppercase">
                    {activeMilestone.category}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold font-display text-white leading-tight">{activeMilestone.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">{activeMilestone.description}</p>
                {activeMilestone.highlightText && (
                  <p className="text-[10px] font-mono text-cyan-300 font-bold mt-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    <span>{activeMilestone.highlightText}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveMilestone(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
              title="Dismiss Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {activeMilestone.associatedBodyId && (
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">Target: {activeMilestone.associatedBodyId.toUpperCase()}</span>
              <button
                onClick={() => focusOnBody(activeMilestone.associatedBodyId!)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                <Focus className="w-3.5 h-3.5" />
                <span>Fly Camera to Body</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Timeline Simulation Control Panel (Scrubber & Speeds) ──────────────── */}
      {isTimelineOpen ? (
        <div className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 z-30 w-[96%] max-w-4xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-black/92 border border-cyan-500/35 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(6,182,212,0.15)] flex flex-col gap-1.5 sm:gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Top Edge Collapse Tab */}
          <button
            onClick={() => setIsTimelineOpen(false)}
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/90 border border-cyan-500/40 hover:border-cyan-400 text-[10px] font-mono text-cyan-300 hover:text-white flex items-center gap-1 shadow-md cursor-pointer transition-all backdrop-blur-md"
            title="Minimize Timeline for Full View"
          >
            <ChevronDown className="w-3 h-3 text-cyan-400" />
            <span>Hide Timeline</span>
          </button>

          {/* Top Control Bar: Date / Epoch Display, Playback Buttons, Speed Adjuster */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Current Date & Roman Epoch */}
            <div className="flex items-center gap-2">
              <div className="p-1 sm:p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
                <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm font-extrabold font-mono tracking-wider text-white">
                    {formatSimDate(displayYear).formatted}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold">
                    {formatSimDate(displayYear).epochStr}
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] font-mono text-slate-400 hidden xs:block">
                  {displayYear >= 2026.5 ? '🔴 Active Exploration' : displayYear >= 1957 ? '🚀 Space Age' : '🔭 Early Astronomy'}
                </p>
              </div>
            </div>

            {/* Primary Playback Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => stepSimulation(-5)}
                className="hidden xs:inline-flex px-1.5 sm:px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] sm:text-xs font-mono transition-all cursor-pointer"
                title="Step -5 Years"
              >
                -5y
              </button>
              <button
                onClick={() => stepSimulation(-1)}
                className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Step -1 Year"
              >
                <Rewind className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>

              <button
                onClick={togglePlaySimulation}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border font-mono text-xs font-bold transition-all shadow-md cursor-pointer ${
                  isSimPlaying
                    ? 'bg-amber-500/25 text-amber-300 border-amber-500/70 shadow-[0_0_14px_rgba(245,158,11,0.4)]'
                    : 'bg-cyan-500/25 text-cyan-300 border-cyan-500/70 hover:bg-cyan-500/35 shadow-[0_0_14px_rgba(6,182,212,0.4)]'
                }`}
              >
                {isSimPlaying ? <Pause className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current" /> : <Play className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current" />}
                <span>{isSimPlaying ? 'Pause' : 'Simulate'}</span>
              </button>

              <button
                onClick={() => stepSimulation(1)}
                className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Step +1 Year"
              >
                <FastForward className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>
              <button
                onClick={() => stepSimulation(5)}
                className="hidden xs:inline-flex px-1.5 sm:px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] sm:text-xs font-mono transition-all cursor-pointer"
                title="Step +5 Years"
              >
                +5y
              </button>
            </div>

            {/* Speed Adjusters, Strict Mode, & Minimize */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 px-0.5 sm:px-1 flex items-center gap-1">
                  <Clock className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-cyan-400" />
                  <span className="hidden sm:inline">Speed:</span>
                </span>
                {[1, 3, 5, 10, 30].map(s => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      simSpeedSecPerYear === s
                        ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.7)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                    title={`${s} seconds per simulated year`}
                  >
                    {s}s
                  </button>
                ))}
              </div>

              {/* Strict Discovery Mode Toggle */}
              <button
                onClick={toggleStrictTimeline}
                className={`px-1.5 sm:px-2 py-1 rounded-xl border text-[9px] sm:text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  strictTimelineMode
                    ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
                title="When enabled, comets, asteroids, and probes only appear after their discovery/launch date"
              >
                {strictTimelineMode ? '✓ Historical' : 'All Objects'}
              </button>

              {/* Close / Minimize Timeline Button */}
              <button
                onClick={() => setIsTimelineOpen(false)}
                className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                title="Minimize Timeline"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Timeline Scrubber Range Slider with Milestone Ticks */}
          <div className="relative flex flex-col gap-0.5">
            <div className="relative w-full flex items-center">
              <input
                type="range"
                min="1950"
                max="2030"
                step="0.05"
                value={displayYear}
                onChange={(e) => handleScrubSimulation(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #3b82f6 ${Math.min(100, Math.max(0, ((displayYear - 1950) / 80) * 100))}%, #1e293b ${Math.min(100, Math.max(0, ((displayYear - 1950) / 80) * 100))}%, #0f172a 100%)`
                }}
              />
            </div>

            {/* Scrubber Year Bounds */}
            <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-slate-500 px-0.5">
              <span>1950<span className="hidden sm:inline"> Dawn</span></span>
              <span className="hidden md:inline">1977 Voyager</span>
              <span>1986<span className="hidden sm:inline"> Halley</span></span>
              <span className="hidden md:inline">1998 ISS</span>
              <span className="hidden md:inline">2015 Pluto</span>
              <span className="text-cyan-400 font-bold">2026<span className="hidden sm:inline"> Present</span></span>
              <span className="text-amber-400 font-bold">2029<span className="hidden sm:inline"> Apophis</span></span>
            </div>
          </div>

          {/* Milestone Quick-Jump Rail */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin scrollbar-thumb-slate-800 touch-pan-x">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
              <History className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Milestones:</span>
            </span>
            {KEY_TIMELINE_PRESETS.map(preset => {
              const isNear = Math.abs(displayYear - preset.year) <= 0.6;
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    handleScrubSimulation(preset.year);
                    if (preset.bodyId) focusOnBody(preset.bodyId);
                  }}
                  className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono whitespace-nowrap transition-all border cursor-pointer flex-shrink-0 ${
                    isNear
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.45)] font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="absolute bottom-12 sm:bottom-14 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            onClick={() => setIsTimelineOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-black/90 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white backdrop-blur-xl shadow-[0_0_25px_rgba(0,240,255,0.25)] transition-all text-[11px] sm:text-xs font-mono font-bold cursor-pointer animate-in fade-in"
            title="Open Simulation Timeline"
          >
            <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-400" />
            <span>Timeline ({formatSimDate(displayYear).year})</span>
            <ChevronUp className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-400" />
          </button>
        </div>
      )}

      {/* Bottom Scale Preset Switchers */}
      <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-black/90 border border-white/15 backdrop-blur-xl shadow-2xl max-w-[96vw] overflow-x-auto scrollbar-none pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => focusOnBody('mars')}
          className={`px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
            focusedBodyId === 'mars'
              ? 'bg-orange-500/25 text-orange-300 border border-orange-500/70 shadow-[0_0_14px_rgba(255,77,46,0.35)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          🔴 Mars<span className="hidden sm:inline"> Close-Up</span>
        </button>

        <button
          onClick={() => {
            focusOnBody('sun');
            setScalePreset(4.5);
          }}
          className={`px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
            focusedBodyId === 'sun'
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/70 shadow-[0_0_14px_rgba(6,182,212,0.35)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          ☀️ Inner<span className="hidden sm:inline"> System</span>
        </button>

        <button
          onClick={() => {
            focusOnBody('sun');
            setScalePreset(35);
          }}
          className="px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-mono font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
        >
          🌌 <span className="sm:hidden">35 AU</span><span className="hidden sm:inline">Full Orrery (35 AU)</span>
        </button>

        <button
          onClick={() => {
            focusOnBody(null);
            setScalePreset(70);
          }}
          className="px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-mono font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
        >
          🛸 <span className="sm:hidden">70 AU</span><span className="hidden sm:inline">Deep Space (70 AU)</span>
        </button>
      </div>

      {/* Left Celestial Bodies & Minor Bodies Explorer Sidebar */}
      {isSidebarOpen ? (
        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 pointer-events-auto max-h-[60vh] sm:max-h-[75vh] w-32 sm:w-auto overflow-y-auto pr-1 animate-in fade-in slide-in-from-left-3 duration-200">
          <div className="flex items-center justify-between px-2 mb-0.5">
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Focus Body</p>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-all cursor-pointer"
              title="Collapse Focus Sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

        {/* Sun Button */}
        <button
          onClick={() => focusOnBody('sun')}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all backdrop-blur-md cursor-pointer ${
            focusedBodyId === 'sun'
              ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'bg-black/75 border-white/10 hover:border-white/25 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] flex-shrink-0" />
          <span className="w-16 text-left font-bold">Sun</span>
          <span className="text-slate-600 text-[10px]">Center</span>
        </button>

        {/* All 8 Planets */}
        {planets.map(p => {
          const isFocused = focusedBodyId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => focusOnBody(p.id)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all backdrop-blur-md cursor-pointer ${
                isFocused
                  ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                  : 'bg-black/75 border-white/10 hover:border-white/25 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: `#${p.colorHex.toString(16).padStart(6, '0')}`,
                  boxShadow: isFocused ? `0 0 8px #${p.colorHex.toString(16).padStart(6, '0')}` : undefined
                }}
              />
              <span className="w-16 text-left">{p.name}</span>
              <span className="text-slate-600 text-[10px]">{p.distanceFromSunAU?.toFixed(1)} AU</span>
            </button>
          );
        })}

        {/* Notable Minor Objects Quick Jump Divider */}
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest px-2 mt-2 mb-0.5">Asteroids & Comets</p>

        {/* Ceres */}
        <button
          onClick={() => focusOnBody('ceres')}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all backdrop-blur-md cursor-pointer ${
            focusedBodyId === 'ceres' ? 'bg-amber-950/70 border-amber-400 text-amber-200' : 'bg-black/75 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400/80 flex-shrink-0" />
          <span className="w-16 text-left">1 Ceres</span>
          <span className="text-slate-600 text-[10px]">2.8 AU</span>
        </button>

        {/* Halley's Comet */}
        <button
          onClick={() => focusOnBody('halley')}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all backdrop-blur-md cursor-pointer ${
            focusedBodyId === 'halley' ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200' : 'bg-black/75 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
          <span className="w-16 text-left">1P/Halley</span>
          <span className="text-slate-600 text-[10px]">Comet</span>
        </button>

        {/* Satellites & Probes Divider */}
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest px-2 mt-2 mb-0.5">Satellites & Probes</p>

        {/* ISS */}
        <button
          onClick={() => focusOnBody('iss')}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all backdrop-blur-md cursor-pointer ${
            focusedBodyId === 'iss' ? 'bg-sky-950/70 border-sky-400 text-sky-200' : 'bg-black/75 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />
          <span className="w-16 text-left">ISS</span>
          <span className="text-slate-600 text-[10px]">Earth Orbit</span>
        </button>

        {/* MRO */}
        <button
          onClick={() => focusOnBody('mro')}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all backdrop-blur-md cursor-pointer ${
            focusedBodyId === 'mro' ? 'bg-red-950/70 border-red-400 text-red-200' : 'bg-black/75 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
          <span className="w-16 text-left">MRO</span>
          <span className="text-slate-600 text-[10px]">Mars Orbit</span>
        </button>

        {/* JWST */}
        <button
          onClick={() => focusOnBody('jwst')}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all backdrop-blur-md cursor-pointer ${
            focusedBodyId === 'jwst' ? 'bg-amber-950/70 border-amber-400 text-amber-200' : 'bg-black/75 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
          <span className="w-16 text-left">JWST</span>
          <span className="text-slate-600 text-[10px]">L2 Point</span>
        </button>

        {/* Voyager 1 */}
        <button
          onClick={() => focusOnBody('voyager-1')}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all backdrop-blur-md cursor-pointer ${
            focusedBodyId === 'voyager-1' ? 'bg-purple-950/70 border-purple-400 text-purple-200' : 'bg-black/75 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Rocket className="w-2.5 h-2.5 text-purple-400 flex-shrink-0" />
          <span className="w-16 text-left">Voyager 1</span>
          <span className="text-slate-600 text-[10px]">163 AU</span>
        </button>

        {/* Free Scan Button */}
        <button
          onClick={() => focusOnBody(null)}
          className={`flex items-center gap-2 px-2.5 py-1.5 mt-1 rounded-lg border text-xs font-mono transition-all backdrop-blur-md cursor-pointer ${
            focusedBodyId === null
              ? 'bg-purple-950/70 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
              : 'bg-black/75 border-white/10 hover:border-white/25 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Move className="w-3 h-3 text-purple-400 flex-shrink-0" />
          <span className="w-16 text-left">Free Scan</span>
          <span className="text-slate-600 text-[10px]">Manual</span>
        </button>
      </div>
      ) : (
        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-black/85 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all text-xs font-mono font-bold cursor-pointer animate-in fade-in"
            title="Open Celestial Bodies Focus Sidebar"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Focus Bodies</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      )}

      {/* NASA Attribution Footer */}
      <div className="absolute bottom-2 right-4 z-20 pointer-events-none hidden lg:block">
        <p className="text-[10px] font-mono text-slate-600">
          NASA JPL Small-Body Database & Horizons · Latest 2026 Planetary & Cometary Telemetry
        </p>
      </div>

      {/* ── Overlay Panels ─────────────────────────────────────────────────────
           All pointer interactions on any panel record a timestamp so the
           Three.js canvas raycaster cannot re-select an object in the same
           click sequence (desktop browser DOM-removal redirect bug). */}
      <div
        className="absolute inset-0 pointer-events-none z-50"
        onPointerDown={() => { panelInteractionTimeRef.current = Date.now(); }}
        onPointerUp={() => { panelInteractionTimeRef.current = Date.now(); }}
        onClick={() => { panelInteractionTimeRef.current = Date.now(); }}
      >
        {selectedPlanet && <PlanetPanel planet={selectedPlanet} />}
        {selectedMinorBody && <MinorBodyPanel body={selectedMinorBody} />}
        {selectedComet && <CometPanel comet={selectedComet} />}
        {selectedMoon && <MoonPanel moon={selectedMoon} />}
        {selectedSpacecraft && <SpacecraftPanel probe={selectedSpacecraft} />}
        {selectedMarsLocation && <MarsLocationCard loc={selectedMarsLocation} />}
        {isSunSelected && <SunPanel />}
      </div>

      {/* Loading Screen */}
      {dataStatus === 'loading' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/40 border-t-cyan-400 animate-spin mx-auto" />
            <p className="text-sm font-mono text-cyan-400 font-bold">Computing NASA Keplerian Mechanics...</p>
            <p className="text-xs font-mono text-slate-500">JPL Horizons Planetary & Minor Body Ephemeris Baseline</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarSystemView;
