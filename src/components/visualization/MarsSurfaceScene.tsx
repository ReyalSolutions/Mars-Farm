import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MarsSurfaceDetail, NasaSurfaceImage } from '../../data/marsSurfaceData';
import { marsAudioService } from '../../services/marsAudioService';
import { Sun, Moon, Wind, Eye, Compass, Sparkles, Volume2, VolumeX, Camera } from 'lucide-react';

interface MarsSurfaceSceneProps {
  surfaceData: MarsSurfaceDetail;
  className?: string;
  isDescending?: boolean;
  onSceneReady?: () => void;
  onDescentComplete?: () => void;
  onInspectNasaImage?: (image: NasaSurfaceImage) => void;
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

/**
 * Generates photorealistic procedural ground, bump, and specular roughness maps
 * grounded in the latest NASA Perseverance, Curiosity, MRO HiRISE, and Viking observations.
 */
const createSiteRealisticTerrainTextures = (surfaceData: MarsSurfaceDetail) => {
  const size = 1024;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  // 1. Fill base regolith grain noise
  const hex = surfaceData.terrain3DConfig.groundColorHex;
  const baseR = (hex >> 16) & 255;
  const baseG = (hex >> 8) & 255;
  const baseB = hex & 255;

  const colorData = ctx.createImageData(size, size);
  const bumpData = bCtx.createImageData(size, size);
  const roughData = rCtx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Multi-frequency noise
      const n1 = Math.sin(x * 0.05) * Math.cos(y * 0.05);
      const n2 = Math.sin(x * 0.15 + 1.2) * Math.sin(y * 0.12) * 0.5;
      const grain = (Math.random() - 0.5) * 0.4;
      const totalN = (n1 + n2 + grain) * 0.5;

      const r = Math.min(255, Math.max(0, baseR + totalN * 32));
      const g = Math.min(255, Math.max(0, baseG + totalN * 24));
      const b = Math.min(255, Math.max(0, baseB + totalN * 16));

      colorData.data[idx] = r;
      colorData.data[idx + 1] = g;
      colorData.data[idx + 2] = b;
      colorData.data[idx + 3] = 255;

      const bumpVal = Math.min(255, Math.max(0, 128 + totalN * 45));
      bumpData.data[idx] = bumpVal;
      bumpData.data[idx + 1] = bumpVal;
      bumpData.data[idx + 2] = bumpVal;
      bumpData.data[idx + 3] = 255;

      const roughVal = Math.min(255, Math.max(0, 210 + totalN * 25));
      roughData.data[idx] = roughVal;
      roughData.data[idx + 1] = roughVal;
      roughData.data[idx + 2] = roughVal;
      roughData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(colorData, 0, 0);
  bCtx.putImageData(bumpData, 0, 0);
  rCtx.putImageData(roughData, 0, 0);

  // 2. Overlay Site-Specific Authentic Geological Features from NASA Imagery
  const locId = surfaceData.locationId;

  if (locId === 'jezero-crater') {
    // ── Jezero Crater: Perseverance Sol 1220 "Cheyava Falls" Veins & Delta Sand Ripples ──
    // Dark olivine sand ripple ribbons
    ctx.fillStyle = 'rgba(42, 30, 22, 0.4)';
    bCtx.fillStyle = 'rgb(80, 80, 80)';
    for (let i = 0; i < size; i += 32) {
      ctx.beginPath();
      bCtx.beginPath();
      ctx.moveTo(0, i);
      bCtx.moveTo(0, i);
      for (let x = 0; x <= size; x += 32) {
        const y = i + Math.sin(x * 0.04) * 8;
        ctx.lineTo(x, y);
        bCtx.lineTo(x, y);
      }
      ctx.lineTo(size, i + 14);
      ctx.lineTo(0, i + 14);
      ctx.fill();
      bCtx.lineTo(size, i + 14);
      bCtx.lineTo(0, i + 14);
      bCtx.fill();
    }

    // Branching calcium sulfate and silica veins (inspired by Sol 1220 Neretva Vallis)
    ctx.strokeStyle = 'rgba(238, 230, 218, 0.88)';
    bCtx.strokeStyle = 'rgb(210, 210, 210)';
    rCtx.strokeStyle = 'rgb(110, 110, 110)';
    ctx.lineWidth = 4;
    bCtx.lineWidth = 4;
    rCtx.lineWidth = 4;

    for (let v = 0; v < 7; v++) {
      let vx = (v * 150 + 60) % size;
      let vy = 0;
      ctx.beginPath();
      bCtx.beginPath();
      rCtx.beginPath();
      ctx.moveTo(vx, vy);
      bCtx.moveTo(vx, vy);
      rCtx.moveTo(vx, vy);
      while (vy < size) {
        vx += (Math.random() - 0.5) * 45;
        vy += 30 + Math.random() * 40;
        ctx.lineTo(vx, vy);
        bCtx.lineTo(vx, vy);
        rCtx.lineTo(vx, vy);
      }
      ctx.stroke();
      bCtx.stroke();
      rCtx.stroke();
    }

    // "Leopard spots" (iron phosphate and hematite rings from Cheyava Falls)
    for (let s = 0; s < 18; s++) {
      const sx = 100 + Math.random() * (size - 200);
      const sy = 100 + Math.random() * (size - 200);
      // Dark outer ring
      ctx.fillStyle = 'rgba(45, 18, 12, 0.9)';
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();
      // Light core
      ctx.fillStyle = 'rgba(242, 232, 220, 0.95)';
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (locId === 'gale-crater') {
    // ── Gale Crater: Curiosity Sol 4192 Pure Sulfur Crystals & Desiccation Bedrock ──
    // Mudstone polygonal fracture joints
    ctx.strokeStyle = 'rgba(40, 20, 16, 0.7)';
    bCtx.strokeStyle = 'rgb(50, 50, 50)';
    ctx.lineWidth = 3;
    bCtx.lineWidth = 3;
    for (let p = 0; p < 24; p++) {
      const px = (p * 45 + 20) % size;
      const py = ((p * 75) + 30) % size;
      ctx.strokeRect(px, py, 110, 110);
      bCtx.strokeRect(px, py, 110, 110);
    }

    // Vivid elemental sulfur crystal veins (Gediz Vallis Ridge July 2024 discovery)
    for (let s = 0; s < 35; s++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const cSize = 6 + Math.random() * 14;

      // White sulfate crushed rock halo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(cx, cy, cSize + 4, 0, Math.PI * 2);
      ctx.fill();

      // Pure yellow sulfur crystal center
      ctx.fillStyle = 'rgba(250, 204, 21, 0.96)';
      ctx.beginPath();
      ctx.arc(cx, cy, cSize, 0, Math.PI * 2);
      ctx.fill();

      bCtx.fillStyle = 'rgb(220, 220, 220)';
      bCtx.beginPath();
      bCtx.arc(cx, cy, cSize, 0, Math.PI * 2);
      bCtx.fill();

      rCtx.fillStyle = 'rgb(45, 45, 45)'; // High specular gloss for crystalline sulfur
      rCtx.beginPath();
      rCtx.arc(cx, cy, cSize, 0, Math.PI * 2);
      rCtx.fill();
    }
  } else if (locId === 'utopia-planitia') {
    // ── Utopia Planitia: HiRISE Permafrost Ice-Wedge Polygons & Winter Frost ──
    // Hexagonal permafrost crack networks
    ctx.strokeStyle = 'rgba(60, 28, 22, 0.75)';
    bCtx.strokeStyle = 'rgb(65, 65, 65)';
    ctx.lineWidth = 3.5;
    bCtx.lineWidth = 3.5;

    const polyRadius = 64;
    for (let y = 0; y < size + polyRadius; y += polyRadius * 1.5) {
      for (let x = 0; x < size + polyRadius; x += polyRadius * 1.732) {
        ctx.beginPath();
        bCtx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3;
          const px = x + polyRadius * Math.cos(angle);
          const py = y + polyRadius * Math.sin(angle);
          if (a === 0) {
            ctx.moveTo(px, py);
            bCtx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
            bCtx.lineTo(px, py);
          }
        }
        ctx.closePath();
        bCtx.closePath();
        ctx.stroke();
        bCtx.stroke();
      }
    }

    // Pale bluish-white ice frost lining in polygon fissures
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
    rCtx.strokeStyle = 'rgb(60, 60, 60)';
    ctx.lineWidth = 2;
    rCtx.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
      const fx = Math.random() * size;
      const fy = Math.random() * size;
      ctx.beginPath();
      rCtx.beginPath();
      ctx.arc(fx, fy, 45, 0, Math.PI * 2);
      rCtx.arc(fx, fy, 45, 0, Math.PI * 2);
      ctx.stroke();
      rCtx.stroke();
    }
  } else if (locId === 'olympus-mons-foothills') {
    // ── Olympus Mons Foothills: Basaltic Lava Tube Pahoehoe Swirls & Cinder Ash ──
    ctx.strokeStyle = 'rgba(32, 18, 15, 0.85)';
    bCtx.strokeStyle = 'rgb(180, 180, 180)';
    ctx.lineWidth = 5;
    bCtx.lineWidth = 5;

    for (let l = 0; l < 14; l++) {
      const startY = l * 75;
      ctx.beginPath();
      bCtx.beginPath();
      ctx.moveTo(0, startY);
      bCtx.moveTo(0, startY);
      for (let x = 0; x <= size; x += 40) {
        const y = startY + Math.sin(x * 0.02 + l) * 25 + Math.cos(x * 0.05) * 10;
        ctx.lineTo(x, y);
        bCtx.lineTo(x, y);
      }
      ctx.stroke();
      bCtx.stroke();
    }

    // Dark iron-titanium basalt ash patches
    ctx.fillStyle = 'rgba(20, 12, 10, 0.7)';
    for (let a = 0; a < 25; a++) {
      const ax = Math.random() * size;
      const ay = Math.random() * size;
      ctx.beginPath();
      ctx.ellipse(ax, ay, 35, 18, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (locId === 'valles-marineris') {
    // ── Valles Marineris: Grand Canyon Stratified Bedrock & RSL Seep Streaks ──
    // Horizontal sedimentary strata bands
    const strataColors = [
      'rgba(168, 56, 32, 0.45)',
      'rgba(110, 36, 22, 0.55)',
      'rgba(195, 115, 75, 0.4)',
      'rgba(65, 20, 14, 0.65)',
    ];
    for (let i = 0; i < size; i += 28) {
      ctx.fillStyle = strataColors[(i / 28) % strataColors.length];
      ctx.fillRect(0, i, size, 22);
    }

    // Recurring Slope Lineae (RSL) seasonal dark seep streaks
    ctx.strokeStyle = 'rgba(38, 14, 10, 0.85)';
    bCtx.strokeStyle = 'rgb(75, 75, 75)';
    ctx.lineWidth = 3;
    bCtx.lineWidth = 3;
    for (let r = 0; r < 20; r++) {
      const rx = (r * 52 + 30) % size;
      ctx.beginPath();
      bCtx.beginPath();
      ctx.moveTo(rx, 0);
      bCtx.moveTo(rx, 0);
      ctx.lineTo(rx + (Math.random() - 0.5) * 40, size);
      bCtx.lineTo(rx + (Math.random() - 0.5) * 40, size);
      ctx.stroke();
      bCtx.stroke();
    }
  } else if (locId === 'arcadia-planitia') {
    // ── Arcadia Planitia: Glacial Permafrost & Exposed Blue Water-Ice Trench ──
    // Periglacial lobate hummocks
    ctx.fillStyle = 'rgba(165, 80, 60, 0.3)';
    for (let h = 0; h < 20; h++) {
      const hx = Math.random() * size;
      const hy = Math.random() * size;
      ctx.beginPath();
      ctx.ellipse(hx, hy, 60, 30, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Survey Excavation Trench: exposing pure crystalline bluish-white water ice
    const tx = 380, ty = 420, tw = 260, th = 110;
    ctx.fillStyle = 'rgba(85, 30, 20, 0.85)';
    bCtx.fillStyle = 'rgb(180, 180, 180)';
    ctx.fillRect(tx - 15, ty - 15, tw + 30, th + 30);
    bCtx.fillRect(tx - 15, ty - 15, tw + 30, th + 30);

    const iceGrad = ctx.createLinearGradient(tx, ty, tx + tw, ty + th);
    iceGrad.addColorStop(0, '#e0f2fe');
    iceGrad.addColorStop(0.3, '#7dd3fc');
    iceGrad.addColorStop(0.7, '#38bdf8');
    iceGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = iceGrad;
    ctx.fillRect(tx, ty, tw, th);

    rCtx.fillStyle = 'rgb(35, 35, 35)'; // High reflection gloss for water ice
    rCtx.fillRect(tx, ty, tw, th);
    bCtx.fillStyle = 'rgb(80, 80, 80)';
    bCtx.fillRect(tx, ty, tw, th);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx + 20, ty + 10);
    ctx.lineTo(tx + 120, ty + 60);
    ctx.lineTo(tx + 220, ty + 30);
    ctx.moveTo(tx + 80, ty + 90);
    ctx.lineTo(tx + 170, ty + 40);
    ctx.stroke();
  } else if (locId === 'phobos') {
    // ── Phobos: Dark Carbonaceous Regolith & Parallel Stress Fracture Grooves ──
    ctx.strokeStyle = 'rgba(22, 20, 18, 0.9)';
    bCtx.strokeStyle = 'rgb(30, 30, 30)';
    rCtx.strokeStyle = 'rgb(240, 240, 240)';
    ctx.lineWidth = 6;
    bCtx.lineWidth = 6;

    // Prominent parallel striation grooves from Stickney impact
    for (let g = -size; g < size * 2; g += 75) {
      ctx.beginPath();
      bCtx.beginPath();
      ctx.moveTo(g, 0);
      bCtx.moveTo(g, 0);
      ctx.lineTo(g + size * 0.45, size);
      bCtx.lineTo(g + size * 0.45, size);
      ctx.stroke();
      bCtx.stroke();
    }

    // High-albedo blue-tinted impact ejecta streaks
    ctx.strokeStyle = 'rgba(100, 120, 145, 0.45)';
    ctx.lineWidth = 3.5;
    for (let s = 0; s < 16; s++) {
      const sx = Math.random() * size;
      const sy = Math.random() * size;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random() - 0.5) * 80, sy + (Math.random() - 0.5) * 80);
      ctx.stroke();
    }
  } else if (locId === 'deimos') {
    // ── Deimos: Smooth Powdered Regolith Mantle & Rounded Craters ──
    ctx.fillStyle = 'rgba(80, 72, 68, 0.4)';
    for (let c = 0; c < 28; c++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      ctx.beginPath();
      ctx.arc(cx, cy, 30 + Math.random() * 60, 0, Math.PI * 2);
      ctx.fill();
    }
    rCtx.fillStyle = 'rgba(215, 215, 215, 0.85)';
    rCtx.fillRect(0, 0, size, size);
  } else if (locId === 'kennedy-space-center') {
    // ── Kennedy Space Center: Merritt Island Coastal Turf, Crawlerway & Launch Apron ──
    ctx.fillStyle = 'rgba(46, 125, 50, 0.45)';
    for (let g = 0; g < 40; g++) {
      const gx = Math.random() * size;
      const gy = Math.random() * size;
      ctx.beginPath();
      ctx.ellipse(gx, gy, 45, 25, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // Concrete launch apron and tarmac
    ctx.fillStyle = 'rgba(170, 175, 180, 0.75)';
    bCtx.fillStyle = 'rgb(160, 160, 160)';
    rCtx.fillStyle = 'rgb(120, 120, 120)';
    ctx.fillRect(size * 0.2, size * 0.35, size * 0.6, size * 0.3);
    bCtx.fillRect(size * 0.2, size * 0.35, size * 0.6, size * 0.3);
    rCtx.fillRect(size * 0.2, size * 0.35, size * 0.6, size * 0.3);

    // High-visibility yellow safety boundary stripes
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(size * 0.25, size * 0.4);
    ctx.lineTo(size * 0.75, size * 0.4);
    ctx.moveTo(size * 0.25, size * 0.6);
    ctx.lineTo(size * 0.75, size * 0.6);
    ctx.stroke();
  } else if (locId === 'mauna-kea') {
    // ── Mauna Kea: High-Altitude Basaltic Cinder Cones & Volcanic Scoria ──
    ctx.fillStyle = 'rgba(35, 25, 22, 0.7)';
    for (let v = 0; v < 35; v++) {
      const vx = Math.random() * size;
      const vy = Math.random() * size;
      ctx.beginPath();
      ctx.arc(vx, vy, 20 + Math.random() * 40, 0, Math.PI * 2);
      ctx.fill();
    }
    // Reddish-brown oxidized tephra patches
    ctx.fillStyle = 'rgba(120, 50, 35, 0.5)';
    for (let t = 0; t < 25; t++) {
      const tx = Math.random() * size;
      const ty = Math.random() * size;
      ctx.beginPath();
      ctx.ellipse(tx, ty, 35, 18, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (locId === 'svalbard-vault') {
    // ── Svalbard Global Seed Vault: Arctic Permafrost, Crystalline Snowdrifts & Blue Ice ──
    ctx.fillStyle = 'rgba(235, 245, 255, 0.85)';
    bCtx.fillStyle = 'rgb(210, 210, 210)';
    rCtx.fillStyle = 'rgb(60, 60, 60)'; // Glossy specular ice
    for (let s = 0; s < 30; s++) {
      const sx = Math.random() * size;
      const sy = Math.random() * size;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 55, 30, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // Permafrost ice wedge fissures
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)';
    bCtx.strokeStyle = 'rgb(140, 140, 140)';
    ctx.lineWidth = 3;
    bCtx.lineWidth = 3;
    for (let f = 0; f < 18; f++) {
      const fx = Math.random() * size;
      const fy = Math.random() * size;
      ctx.beginPath();
      bCtx.beginPath();
      ctx.moveTo(fx, fy);
      bCtx.moveTo(fx, fy);
      ctx.lineTo(fx + (Math.random() - 0.5) * 80, fy + (Math.random() - 0.5) * 80);
      bCtx.lineTo(fx + (Math.random() - 0.5) * 80, fy + (Math.random() - 0.5) * 80);
      ctx.stroke();
      bCtx.stroke();
    }
  } else if (locId === 'shackleton-crater') {
    // ── Shackleton Crater: Lunar South Pole Highlands Anorthosite Regolith & Brilliant Ejecta ──
    ctx.fillStyle = 'rgba(195, 205, 215, 0.45)';
    for (let e = 0; e < 32; e++) {
      const ex = Math.random() * size;
      const ey = Math.random() * size;
      ctx.beginPath();
      ctx.ellipse(ex, ey, 50, 28, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // Radial bright ejecta ray streaks
    ctx.strokeStyle = 'rgba(240, 245, 255, 0.65)';
    bCtx.strokeStyle = 'rgb(190, 190, 190)';
    ctx.lineWidth = 2.5;
    bCtx.lineWidth = 2.5;
    for (let r = 0; r < 24; r++) {
      const rx = (r * 42 + 20) % size;
      ctx.beginPath();
      bCtx.beginPath();
      ctx.moveTo(rx, 0);
      bCtx.moveTo(rx, 0);
      ctx.lineTo(rx + (Math.random() - 0.5) * 50, size);
      bCtx.lineTo(rx + (Math.random() - 0.5) * 50, size);
      ctx.stroke();
      bCtx.stroke();
    }
  } else if (locId === 'tranquility-base') {
    // ── Mare Tranquillitatis: Apollo 11 Lunar Basalt Regolith & Historic Bootprints ──
    ctx.fillStyle = 'rgba(55, 55, 58, 0.55)';
    for (let m = 0; m < 35; m++) {
      const mx = Math.random() * size;
      const my = Math.random() * size;
      ctx.beginPath();
      ctx.arc(mx, my, 25 + Math.random() * 45, 0, Math.PI * 2);
      ctx.fill();
    }
    // Apollo 11 Astronaut footpaths & equipment trail
    ctx.strokeStyle = 'rgba(40, 40, 42, 0.85)';
    bCtx.strokeStyle = 'rgb(45, 45, 45)';
    rCtx.strokeStyle = 'rgb(240, 240, 240)';
    ctx.lineWidth = 3.5;
    bCtx.lineWidth = 3.5;
    for (let t = 0; t < 12; t++) {
      const tx = 180 + t * 45;
      ctx.beginPath();
      bCtx.beginPath();
      ctx.moveTo(tx, 200);
      bCtx.moveTo(tx, 200);
      ctx.lineTo(tx + 25, 420);
      bCtx.lineTo(tx + 25, 420);
      ctx.stroke();
      bCtx.stroke();
    }
  }

  // Create Three.js Textures
  const colorTexture = new THREE.CanvasTexture(colorCanvas);
  colorTexture.wrapS = THREE.RepeatWrapping;
  colorTexture.wrapT = THREE.RepeatWrapping;
  colorTexture.repeat.set(5, 5);
  colorTexture.needsUpdate = true;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.RepeatWrapping;
  bumpTexture.repeat.set(5, 5);
  bumpTexture.needsUpdate = true;

  const roughnessTexture = new THREE.CanvasTexture(roughCanvas);
  roughnessTexture.wrapS = THREE.RepeatWrapping;
  roughnessTexture.wrapT = THREE.RepeatWrapping;
  roughnessTexture.repeat.set(5, 5);
  roughnessTexture.needsUpdate = true;

  return { colorTexture, bumpTexture, roughnessTexture };
};

export const MarsSurfaceScene: React.FC<MarsSurfaceSceneProps> = ({
  surfaceData,
  className = '',
  isDescending = false,
  onSceneReady,
  onDescentComplete,
  onInspectNasaImage,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const primaryNasaImage = surfaceData.images[0];
  const [timeOfSol, setTimeOfSol] = useState<'day' | 'sunset' | 'night'>('day');
  const [isDustStormActive, setIsDustStormActive] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'firstPerson'>('orbit');
  const [descentNotification, setDescentNotification] = useState<boolean>(isDescending);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(marsAudioService.getMuted());

  // References to keep Three.js animation cycle updated without recreating WebGL context
  const timeOfSolRef = useRef<'day' | 'sunset' | 'night'>('day');
  const isDustStormRef = useRef<boolean>(false);
  const cameraModeRef = useRef<'orbit' | 'firstPerson'>('orbit');
  const isDescendingRef = useRef<boolean>(isDescending);
  const descentStartTimeRef = useRef<number>(performance.now());

  const getTargetCelestialBody = (): 'earth' | 'moon' | 'martian-moon' | 'mars' => {
    if (surfaceData.bodyType === 'earth' || surfaceData.celestialBody === 'earth') return 'earth';
    if (surfaceData.bodyType === 'moon' || surfaceData.celestialBody === 'moon') return 'moon';
    if (surfaceData.terrain3DConfig.isMoon) return 'martian-moon';
    return 'mars';
  };

  // Surface soundscape and EDL descent audio orchestration
  useEffect(() => {
    if (isDescendingRef.current) {
      marsAudioService.startDescentAudio(getTargetCelestialBody());
    } else {
      marsAudioService.startSurfaceAudio(surfaceData.locationId, isDustStormActive);
    }

    return () => {
      marsAudioService.stopDescentAudio();
      marsAudioService.stopSurfaceAudio();
    };
  }, [surfaceData.locationId]);

  const handleToggleAudio = () => {
    const next = marsAudioService.toggleMute();
    setIsAudioMuted(next);
    if (!next) {
      if (isDescendingRef.current) {
        marsAudioService.startDescentAudio(getTargetCelestialBody());
      } else {
        marsAudioService.startSurfaceAudio(surfaceData.locationId, isDustStormActive);
      }
    }
  };

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
    marsPlanetMesh?: THREE.Mesh;
    earthPlanetMesh?: THREE.Mesh;
    oceanMesh?: THREE.Mesh;
    cloudGroup?: THREE.Group;
    centrifugeRing?: THREE.Group;
    starsPoints?: THREE.Points;
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
    marsAudioService.setDustStormAudio(isDustStormActive);
  }, [isDustStormActive]);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
    updateCameraPosition();
  }, [cameraMode]);

  const updateLightingAndAtmosphere = () => {
    const {
      sunLight,
      ambientLight,
      fog,
      skyMesh,
      domeLights,
      phobosMesh,
      marsPlanetMesh,
      earthPlanetMesh,
      starsPoints,
    } = sceneElementsRef.current;
    if (!sunLight || !ambientLight || !fog || !skyMesh) return;

    const isStorm = isDustStormRef.current;
    const currentSolTime = timeOfSolRef.current;
    const isEarth = surfaceData.bodyType === 'earth' || surfaceData.celestialBody === 'earth';
    const isEarthMoon = surfaceData.bodyType === 'moon' || surfaceData.celestialBody === 'moon';
    const isMartianMoon = surfaceData.terrain3DConfig.isMoon && !isEarthMoon;

    if (isEarthMoon) {
      // ── The Moon (Luna - Apollo / Artemis) Space Vacuum Environment ──
      fog.density = 0.0001; // Zero atmospheric scattering on lunar surface
      fog.color.setHex(0x000002);
      (skyMesh.material as THREE.MeshBasicMaterial).color.setHex(0x000002);
      if (starsPoints) starsPoints.visible = true; // Stars always visible in vacuum daylight
      if (earthPlanetMesh) earthPlanetMesh.visible = true;
      if (marsPlanetMesh) marsPlanetMesh.visible = false;
      if (phobosMesh) phobosMesh.visible = false;

      if (currentSolTime === 'day') {
        sunLight.position.set(60, 60, 40);
        sunLight.color.setHex(isStorm ? 0xfffae0 : 0xffffff);
        sunLight.intensity = isStorm ? 1.8 : 2.8; // Harsh unfiltered solar flux
        ambientLight.color.setHex(0x38bdf8); // Bright blue Earth-shine reflection
        ambientLight.intensity = 0.45;
        if (domeLights) domeLights.forEach((l) => (l.intensity = 1.0));
      } else if (currentSolTime === 'sunset') {
        // Lunar Terminator: low-angle raking sunlight, long black shadows
        sunLight.position.set(90, 2, -20);
        sunLight.color.setHex(0xffeedd);
        sunLight.intensity = 1.6;
        ambientLight.color.setHex(0x2563eb);
        ambientLight.intensity = 0.4;
        if (domeLights) domeLights.forEach((l) => (l.intensity = 2.4));
      } else {
        // Lunar Night: Sun below horizon, landscape illuminated by radiant Earth-shine!
        sunLight.position.set(-50, -40, 20);
        sunLight.intensity = 0.0;
        ambientLight.color.setHex(0x60a5fa); // Radiant Earth-shine
        ambientLight.intensity = 0.65;
        if (domeLights) domeLights.forEach((l) => (l.intensity = 4.8));
      }
      return;
    }

    if (isEarth) {
      // ── Planet Earth: Dense N2-O2 Rayleigh Sky & Cloud Formations ──
      if (marsPlanetMesh) marsPlanetMesh.visible = false;
      if (phobosMesh) phobosMesh.visible = false;
      if (earthPlanetMesh) earthPlanetMesh.visible = false;
      if (starsPoints) starsPoints.visible = currentSolTime === 'night';

      if (currentSolTime === 'day') {
        sunLight.position.set(40, 75, 30);
        sunLight.color.setHex(isStorm ? 0xd0d5dd : 0xfffdf0);
        sunLight.intensity = isStorm ? 0.65 : 2.4;
        ambientLight.color.setHex(isStorm ? 0x64748b : 0xbae6fd);
        ambientLight.intensity = isStorm ? 0.75 : 0.95;

        fog.color.setHex(isStorm ? 0x475569 : 0xbfdbfe);
        fog.density = isStorm ? 0.007 : 0.0016;

        (skyMesh.material as THREE.MeshBasicMaterial).color.setHex(
          isStorm ? 0x334155 : 0x38bdf8 // Crisp blue sky vs stormy overcast
        );
        if (domeLights) domeLights.forEach((l) => (l.intensity = isStorm ? 2.5 : 0.8));
      } else if (currentSolTime === 'sunset') {
        // Golden hour sunset
        sunLight.position.set(85, 6, -15);
        sunLight.color.setHex(0xf97316);
        sunLight.intensity = isStorm ? 0.35 : 2.0;
        ambientLight.color.setHex(0x9a3412);
        ambientLight.intensity = 0.6;

        fog.color.setHex(0x7c2d12);
        fog.density = 0.003;
        (skyMesh.material as THREE.MeshBasicMaterial).color.setHex(0xca8a04);
        if (domeLights) domeLights.forEach((l) => (l.intensity = 2.8));
      } else {
        // Night side
        sunLight.position.set(-30, -30, 20);
        sunLight.intensity = 0.0;
        ambientLight.color.setHex(0x1e293b);
        ambientLight.intensity = 0.4;

        fog.color.setHex(0x020617);
        fog.density = 0.002;
        (skyMesh.material as THREE.MeshBasicMaterial).color.setHex(0x020617);
        if (domeLights) domeLights.forEach((l) => (l.intensity = 4.2));
      }
      return;
    }

    if (isMartianMoon) {
      // ── Martian Moon (Phobos / Deimos) Vacuum of Space Environment ──
      fog.density = 0.0001; // Zero atmospheric scattering
      fog.color.setHex(0x010103);
      (skyMesh.material as THREE.MeshBasicMaterial).color.setHex(
        isStorm ? 0x221133 : 0x010103 // High-energy SEP solar ionization
      );
      if (starsPoints) starsPoints.visible = true;
      if (marsPlanetMesh) marsPlanetMesh.visible = true;
      if (phobosMesh) phobosMesh.visible = false;
      if (earthPlanetMesh) earthPlanetMesh.visible = false;

      if (currentSolTime === 'day') {
        sunLight.position.set(50, 70, 40);
        sunLight.color.setHex(isStorm ? 0xffeaaf : 0xffffff);
        sunLight.intensity = isStorm ? 1.6 : 2.8; // Unfiltered direct cosmic sunlight
        ambientLight.color.setHex(0x943b22); // Mars-shine planet reflection
        ambientLight.intensity = 0.55;
        if (domeLights) domeLights.forEach((l) => (l.intensity = 1.0));
      } else if (currentSolTime === 'sunset') {
        sunLight.position.set(80, 2, -30);
        sunLight.color.setHex(0xffeedd);
        sunLight.intensity = 1.4;
        ambientLight.color.setHex(0x6e2c18);
        ambientLight.intensity = 0.45;
        if (domeLights) domeLights.forEach((l) => (l.intensity = 2.4));
      } else {
        // Night side: Sun blocked, Mars illuminates the lunar regolith in radiant crimson
        sunLight.position.set(-40, -40, 20);
        sunLight.intensity = 0.0;
        ambientLight.color.setHex(0xa03c20); // Mars-shine
        ambientLight.intensity = 0.45;
        if (domeLights) domeLights.forEach((l) => (l.intensity = 4.8));
      }
      return;
    }

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

    // ── 4. Celestial Objects: Sun Disk & Phobos / Earthrise / Giant Mars Planet ──
    const isEarth = surfaceData.bodyType === 'earth' || surfaceData.celestialBody === 'earth';
    const isEarthMoon = surfaceData.bodyType === 'moon' || surfaceData.celestialBody === 'moon';
    const isMartianMoon = surfaceData.terrain3DConfig.isMoon && !isEarthMoon;
    const isPhobos = surfaceData.terrain3DConfig.moonType === 'phobos';

    const sunDiskMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sunDisk = new THREE.Mesh(
      new THREE.SphereGeometry(isEarthMoon ? 4.8 : isMartianMoon ? 3.6 : isEarth ? 5.2 : 4.5, 16, 16),
      sunDiskMat
    );
    sunDisk.position.set(120, 180, 90);
    scene.add(sunDisk);

    // Martian moon Phobos (only shown when standing on surface of Mars)
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
    phobosMesh.visible = !isEarth && !isEarthMoon && !isMartianMoon;
    scene.add(phobosMesh);

    // ── GIANT MARS PLANET IN THE SKY (Dominates sky when standing on Phobos or Deimos) ──
    let marsPlanetMesh: THREE.Mesh | undefined;
    if (isMartianMoon) {
      const marsRadius = isPhobos ? 44 : 22; // On Phobos, Mars fills a massive 42° across the sky!
      const marsGeo = new THREE.SphereGeometry(marsRadius, 36, 36);
      const marsMat = new THREE.MeshStandardMaterial({
        roughness: 0.82,
        metalness: 0.05,
        color: 0xdf6e48,
      });

      const marsTexLoader = new THREE.TextureLoader();
      marsTexLoader.setCrossOrigin('anonymous');
      marsTexLoader.load(
        '/textures/mars_realistic.jpg',
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          marsMat.map = tex;
          marsMat.color.setHex(0xffffff);
          marsMat.needsUpdate = true;
        },
        undefined,
        () => {
          const mgCanvas = document.createElement('canvas');
          mgCanvas.width = 512;
          mgCanvas.height = 256;
          const mgCtx = mgCanvas.getContext('2d')!;
          mgCtx.fillStyle = '#b55134';
          mgCtx.fillRect(0, 0, 512, 256);
          mgCtx.fillStyle = '#5c1a0e';
          mgCtx.fillRect(160, 110, 200, 35);
          mgCtx.fillStyle = '#e8f4fc';
          mgCtx.beginPath();
          mgCtx.ellipse(256, 15, 75, 18, 0, 0, Math.PI * 2);
          mgCtx.fill();
          const pTex = new THREE.CanvasTexture(mgCanvas);
          marsMat.map = pTex;
          marsMat.needsUpdate = true;
        }
      );

      marsPlanetMesh = new THREE.Mesh(marsGeo, marsMat);
      marsPlanetMesh.position.set(isPhobos ? -80 : -70, isPhobos ? 65 : 75, isPhobos ? -115 : -135);
      marsPlanetMesh.rotation.z = 0.44;
      scene.add(marsPlanetMesh);

      const limbGeo = new THREE.RingGeometry(marsRadius * 0.995, marsRadius * 1.05, 48);
      const limbMat = new THREE.MeshBasicMaterial({
        color: 0x55aaff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const limbMesh = new THREE.Mesh(limbGeo, limbMat);
      limbMesh.position.copy(marsPlanetMesh.position);
      limbMesh.lookAt(0, 0, 0);
      scene.add(limbMesh);
    }

    // ── RADIANT LOOMING EARTHRISE IN THE MOON'S SKY (Apollo 8 / Artemis view) ──
    let earthPlanetMesh: THREE.Mesh | undefined;
    if (isEarthMoon) {
      const earthRadius = 15; // Earth appears ~4x larger in lunar sky than Moon appears from Earth!
      const earthGeo = new THREE.SphereGeometry(earthRadius, 36, 36);
      const earthMat = new THREE.MeshStandardMaterial({
        roughness: 0.72,
        metalness: 0.08,
        color: 0x38bdf8,
      });

      const earthTexLoader = new THREE.TextureLoader();
      earthTexLoader.setCrossOrigin('anonymous');
      earthTexLoader.load(
        '/textures/earth_realistic.jpg',
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          earthMat.map = tex;
          earthMat.color.setHex(0xffffff);
          earthMat.needsUpdate = true;
        },
        undefined,
        () => {
          const egCanvas = document.createElement('canvas');
          egCanvas.width = 512;
          egCanvas.height = 256;
          const egCtx = egCanvas.getContext('2d')!;
          egCtx.fillStyle = '#0a2540';
          egCtx.fillRect(0, 0, 512, 256);
          egCtx.fillStyle = '#1e3a8a';
          egCtx.beginPath();
          egCtx.ellipse(256, 128, 180, 90, 0, 0, Math.PI * 2);
          egCtx.fill();
          egCtx.fillStyle = '#22c55e';
          egCtx.beginPath();
          egCtx.ellipse(180, 100, 60, 45, 0.4, 0, Math.PI * 2);
          egCtx.fill();
          egCtx.fillStyle = '#ffffff';
          egCtx.beginPath();
          egCtx.arc(300, 90, 40, 0, Math.PI * 2);
          egCtx.fill();
          const egTex = new THREE.CanvasTexture(egCanvas);
          earthMat.map = egTex;
          earthMat.needsUpdate = true;
        }
      );

      earthPlanetMesh = new THREE.Mesh(earthGeo, earthMat);
      // Position high in lunar sky in a dramatic Earthrise angle
      earthPlanetMesh.position.set(-85, 68, -125);
      earthPlanetMesh.rotation.z = 0.41; // 23.4° axial tilt
      scene.add(earthPlanetMesh);

      // Luminous blue atmospheric limb glow ring
      const limbGeo = new THREE.RingGeometry(earthRadius * 0.995, earthRadius * 1.08, 48);
      const limbMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      });
      const limbMesh = new THREE.Mesh(limbGeo, limbMat);
      limbMesh.position.copy(earthPlanetMesh.position);
      limbMesh.lookAt(0, 0, 0);
      scene.add(limbMesh);
    }

    // ── EARTH ATLANTIC OCEAN HORIZON & CLOUDS (For Earth Stations) ──
    let oceanMesh: THREE.Mesh | undefined;
    if (isEarth && surfaceData.hasOcean) {
      const oceanGeo = new THREE.PlaneGeometry(140, 260);
      oceanGeo.rotateX(-Math.PI / 2);
      const oceanMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.12,
        metalness: 0.85,
        transparent: true,
        opacity: 0.9,
      });
      oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
      oceanMesh.position.set(65, -0.25, 0);
      scene.add(oceanMesh);
    }

    let cloudGroup: THREE.Group | undefined;
    if (isEarth || surfaceData.hasClouds) {
      cloudGroup = new THREE.Group();
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1.0,
        transparent: true,
        opacity: 0.72,
      });
      for (let c = 0; c < 8; c++) {
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(8 + Math.random() * 6, 1), cloudMat);
        puff.position.set((Math.random() - 0.5) * 140, 52 + Math.random() * 20, (Math.random() - 0.5) * 140);
        puff.scale.set(2.4, 0.45, 1.2);
        cloudGroup.add(puff);
      }
      scene.add(cloudGroup);
    }

    // Starfield for deep space / night view
    const starCount = isEarthMoon ? 3500 : isMartianMoon ? 2000 : 1200;
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
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: isEarthMoon ? 1.6 : isMartianMoon ? 1.4 : 1.2,
      transparent: true,
      opacity: isEarthMoon ? 0.98 : isMartianMoon ? 0.95 : 0.8,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ── 5. Photorealistic Procedural Terrain with Sand Ripples & Craters ───────
    const terrainSize = 150;
    const terrainSegments = 140;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
    terrainGeo.rotateX(-Math.PI / 2);

    const positions = terrainGeo.attributes.position;
    const rimScale = surfaceData.terrain3DConfig.craterRimScale || 1.0;
    const isCanyon = surfaceData.terrain3DConfig.hasCanyonWalls;
    const isLavaTubes = surfaceData.terrain3DConfig.hasLavaTubes;
    const locId = surfaceData.locationId;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const distFromCenter = Math.sqrt(x * x + z * z);

      let elevation = 0;

      if (isEarthMoon) {
        // ── Lunar Surface: Micro-cratering, Anorthosite Rim & Mare Basalt ──
        if (locId === 'shackleton-crater') {
          // Deep polar crater bowl with elevated rim
          elevation =
            Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.2 +
            Math.sin(x * 0.2) * Math.sin(z * 0.2) * 0.4;
          if (distFromCenter < 14) {
            elevation *= Math.max(0, (distFromCenter - 4) / 10) * 0.15;
          } else if (distFromCenter > 20) {
            // Towering rim of Shackleton Peak
            elevation += Math.pow((distFromCenter - 20) * 0.14, 1.6) * 1.8;
          }
        } else {
          // Tranquility Base: Flat mare basalt with gentle crater pits
          elevation =
            Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.8 +
            Math.sin(x * 0.15 + 0.8) * Math.cos(z * 0.12) * 0.35;
          if (distFromCenter < 14) {
            elevation *= Math.max(0, (distFromCenter - 4) / 10) * 0.12;
          } else if (distFromCenter > 28) {
            elevation += Math.pow((distFromCenter - 28) * 0.07, 1.3) * 0.7;
          }
        }
      } else if (isEarth) {
        // ── Earth Terrain: Flat Coastal / Mountain Volcano / Arctic Plateau ──
        if (locId === 'kennedy-space-center') {
          // Flat coastal Florida plain with dunes and ocean depression at east edge
          elevation = Math.sin(x * 0.03) * Math.cos(z * 0.03) * 0.4;
          if (x > 32) {
            elevation = -0.35; // Ocean water boundary
          } else if (distFromCenter < 16) {
            elevation = 0.05; // Concrete launch pad apron
          }
        } else if (locId === 'mauna-kea') {
          // High-altitude volcanic cinder cone mountain slope
          elevation = (x * 0.14) + (Math.sin(z * 0.08) * 1.8) + (Math.cos(x * 0.12) * 0.9);
          if (distFromCenter < 14) {
            elevation *= Math.max(0, (distFromCenter - 4) / 10) * 0.2;
          }
        } else {
          // Svalbard: Sandstone plateau with steep mountain cliff face
          elevation = Math.sin(x * 0.06) * Math.cos(z * 0.06) * 0.7;
          if (z < -22) {
            elevation += Math.pow(Math.abs(z + 22) * 0.25, 1.7) * 0.8;
          }
          if (distFromCenter < 14) {
            elevation *= Math.max(0, (distFromCenter - 4) / 10) * 0.15;
          }
        }
      } else if (isMartianMoon) {
        if (isPhobos) {
          elevation =
            Math.sin(x * 0.05) * Math.cos(z * 0.05) * 1.8 +
            Math.sin(x * 0.14) * Math.cos(z * 0.12) * 0.8 +
            Math.sin(x * 0.3) * Math.sin(z * 0.3) * 0.3;

          const grooveVal = Math.sin(x * 0.45 + z * 0.15);
          if (Math.abs(grooveVal) < 0.28) {
            elevation -= (0.28 - Math.abs(grooveVal)) * 2.2;
          }

          if (distFromCenter < 14) {
            elevation *= Math.max(0, (distFromCenter - 4) / 10) * 0.15;
          } else if (distFromCenter > 22) {
            elevation += Math.pow((distFromCenter - 22) * 0.13, 1.6) * 1.5;
          }
        } else {
          elevation =
            Math.sin(x * 0.05) * Math.cos(z * 0.05) * 1.4 +
            Math.cos(x * 0.1) * Math.sin(z * 0.08) * 0.6;
          if (distFromCenter < 14) {
            elevation *= Math.max(0, (distFromCenter - 4) / 10) * 0.15;
          } else if (distFromCenter > 28) {
            elevation += Math.pow((distFromCenter - 28) * 0.08, 1.4) * 0.9;
          }
        }
      } else {
        // Multi-octave natural Martian elevation displacement
        elevation =
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
      }

      positions.setY(i, elevation);
    }
    terrainGeo.computeVertexNormals();

    // ── 5A. Generate site-specific procedural textures & load real NASA imagery ──
    const { colorTexture, bumpTexture, roughnessTexture } = createSiteRealisticTerrainTextures(surfaceData);

    const terrainMat = new THREE.MeshStandardMaterial({
      map: colorTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.22,
      roughnessMap: roughnessTexture,
      roughness: surfaceData.terrain3DConfig.roughness || 0.88,
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
      map: colorTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.35,
      color: surfaceData.terrain3DConfig.groundColorHex,
      roughness: 0.95,
      metalness: 0.05,
      side: THREE.BackSide,
    });
    const mountainMesh = new THREE.Mesh(mountainRingGeo, mountainMat);
    mountainMesh.position.set(0, 14, 0);
    scene.add(mountainMesh);

    // ── 5C. Load Real NASA Captured Photographic Textures onto Terrain and Horizon ──
    const texLoader = new THREE.TextureLoader();
    texLoader.setCrossOrigin('anonymous');

    const groundNasaImage = surfaceData.images.find((img) => !img.isPanorama) || surfaceData.images[0];
    const panoNasaImage = surfaceData.images.find((img) => img.isPanorama) || surfaceData.images[1] || surfaceData.images[0];

    const loadTextureWithFallback = (
      primaryUrl: string,
      fallbackUrl?: string,
      repeatX = 6,
      repeatY = 6,
      onLoaded?: (tex: THREE.Texture) => void
    ) => {
      const configureAndNotify = (tex: THREE.Texture) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        if (onLoaded) onLoaded(tex);
      };

      texLoader.load(
        primaryUrl,
        (tex) => configureAndNotify(tex),
        undefined,
        () => {
          if (fallbackUrl) {
            texLoader.load(
              fallbackUrl,
              (tex) => configureAndNotify(tex),
              undefined,
              () => {
                texLoader.load('/textures/mars_realistic.jpg', (tex) => configureAndNotify(tex));
              }
            );
          } else {
            texLoader.load('/textures/mars_realistic.jpg', (tex) => configureAndNotify(tex));
          }
        }
      );
    };

    if (groundNasaImage) {
      loadTextureWithFallback(
        groundNasaImage.imageUrl,
        groundNasaImage.fallbackUrl,
        6,
        6,
        (tex) => {
          terrainMat.map = tex;
          terrainMat.needsUpdate = true;
        }
      );
    }

    if (panoNasaImage) {
      loadTextureWithFallback(
        panoNasaImage.imageUrl,
        panoNasaImage.fallbackUrl,
        2,
        1,
        (tex) => {
          mountainMat.map = tex;
          mountainMat.color = new THREE.Color(0xffffff);
          mountainMat.needsUpdate = true;
        }
      );
    }

    // ── 5C. Authentic Perseverance / Curiosity Rover Wheel Tracks ──────────
    const domeRadius = 4.8;
    const createRoverTracks = () => {
      const trackGroup = new THREE.Group();
      const numSegments = 32;
      const trackPoints: THREE.Vector3[] = [];
      for (let t = 0; t <= numSegments; t++) {
        const u = t / numSegments;
        const tx = domeRadius + 2.5 + u * 34;
        const tz = Math.sin(u * 2.5) * 8;
        trackPoints.push(new THREE.Vector3(tx, 0.06, tz));
      }

      const trackGauge = 1.1; // 2.2m distance between wheels
      const createSingleTrack = (offset: number) => {
        const trackGeo = new THREE.BufferGeometry();
        const verts: number[] = [];
        const uvs: number[] = [];
        const trackWidth = 0.44;

        for (let i = 0; i < trackPoints.length - 1; i++) {
          const p1 = trackPoints[i];
          const p2 = trackPoints[i + 1];
          const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
          const norm = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

          const c1 = p1.clone().addScaledVector(norm, offset);
          const c2 = p2.clone().addScaledVector(norm, offset);

          const l1 = c1.clone().addScaledVector(norm, -trackWidth / 2);
          const r1 = c1.clone().addScaledVector(norm, trackWidth / 2);
          const l2 = c2.clone().addScaledVector(norm, -trackWidth / 2);
          const r2 = c2.clone().addScaledVector(norm, trackWidth / 2);

          verts.push(l1.x, l1.y, l1.z, r1.x, r1.y, r1.z, l2.x, l2.y, l2.z);
          verts.push(r1.x, r1.y, r1.z, r2.x, r2.y, r2.z, l2.x, l2.y, l2.z);

          const u0 = i / (trackPoints.length - 1);
          const u1 = (i + 1) / (trackPoints.length - 1);
          uvs.push(0, u0, 1, u0, 0, u1);
          uvs.push(1, u0, 1, u1, 0, u1);
        }

        trackGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        trackGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        trackGeo.computeVertexNormals();

        // Canvas chevron tire cleat texture
        const tCanvas = document.createElement('canvas');
        tCanvas.width = 64;
        tCanvas.height = 128;
        const tCtx = tCanvas.getContext('2d')!;
        tCtx.fillStyle = '#260e08'; // Darker compressed regolith
        tCtx.fillRect(0, 0, 64, 128);
        tCtx.strokeStyle = '#4a1d13';
        tCtx.lineWidth = 4.5;
        for (let y = 0; y < 128; y += 16) {
          tCtx.beginPath();
          tCtx.moveTo(4, y);
          tCtx.lineTo(32, y + 8);
          tCtx.lineTo(60, y);
          tCtx.stroke();
        }

        const tTex = new THREE.CanvasTexture(tCanvas);
        tTex.wrapS = THREE.RepeatWrapping;
        tTex.wrapT = THREE.RepeatWrapping;
        tTex.repeat.set(1, 14);

        const trackMat = new THREE.MeshStandardMaterial({
          map: tTex,
          color: 0x5a2318,
          roughness: 0.94,
          metalness: 0.02,
        });

        return new THREE.Mesh(trackGeo, trackMat);
      };

      trackGroup.add(createSingleTrack(-trackGauge));
      trackGroup.add(createSingleTrack(trackGauge));
      return trackGroup;
    };
    scene.add(createRoverTracks());

    // ── 6. Natural Basalt Boulders Grounded in NASA Discoveries ──────────
    const boulderCount =
      surfaceData.terrain3DConfig.boulderDensity === 'heavy' ? 75 : surfaceData.terrain3DConfig.boulderDensity === 'sparse' ? 24 : 45;
    const boulderGroup = new THREE.Group();

    for (let b = 0; b < boulderCount; b++) {
      const bRad = 0.35 + Math.random() * 0.95;
      const bGeo = new THREE.DodecahedronGeometry(bRad, 1);

      const bPos = bGeo.attributes.position;
      for (let j = 0; j < bPos.count; j++) {
        const noise = 1 + (Math.random() - 0.5) * 0.45;
        bPos.setXYZ(j, bPos.getX(j) * noise, bPos.getY(j) * noise * 0.75, bPos.getZ(j) * noise);
      }
      bGeo.computeVertexNormals();

      let bColor = 0x48241d;
      let bRough = 0.95;

      if (surfaceData.locationId === 'gale-crater') {
        // Gediz Vallis Ridge: pure elemental sulfur crystals crushed open on rocks
        if (Math.random() > 0.6) {
          bColor = 0xfacc15; // Bright sulfur yellow
          bRough = 0.38;
        } else if (Math.random() > 0.35) {
          bColor = 0xd97706; // Sulfur crust
          bRough = 0.65;
        } else {
          bColor = 0x3d2119;
        }
      } else if (surfaceData.locationId === 'olympus-mons-foothills') {
        // Dark vesicular basalt volcanic rock
        bColor = Math.random() > 0.5 ? 0x221614 : 0x2f1b17;
      } else if (surfaceData.locationId === 'utopia-planitia' || surfaceData.locationId === 'arcadia-planitia') {
        // Frost-rimed periglacial boulders
        bColor = Math.random() > 0.5 ? 0xc8d7e6 : 0x5a2e26;
        bRough = bColor === 0xc8d7e6 ? 0.45 : 0.95;
      } else if (surfaceData.locationId === 'jezero-crater') {
        // Sedimentary delta rock with occasional abraded core sample spot
        bColor = Math.random() > 0.75 ? 0xbaa490 : 0x5e2b20;
      } else if (surfaceData.locationId === 'valles-marineris') {
        // Stratified canyon shale
        bColor = Math.random() > 0.5 ? 0x782c1e : 0x4a1b14;
      }

      const bMat = new THREE.MeshStandardMaterial({
        color: bColor,
        roughness: bRough,
        metalness: 0.05,
      });

      const boulder = new THREE.Mesh(bGeo, bMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 50;
      const bx = radius * Math.cos(angle);
      const bz = radius * Math.sin(angle);
      boulder.position.set(bx, 0.35, bz);
      boulder.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      boulder.castShadow = true;
      boulder.receiveShadow = true;
      boulderGroup.add(boulder);
    }
    scene.add(boulderGroup);

    // ── 7. Mars Farm Colony Bio-Dome Habitat Model ────────────────────────────
    const habitatGroup = new THREE.Group();

    // Main Geodesic Bio-Dome
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

    // ── 7B. Microgravity Centrifuge Hydroponics Module (For Moon Outpost) ──────
    let centrifugeRing: THREE.Group | undefined;
    if (isMartianMoon) {
      centrifugeRing = new THREE.Group();
      centrifugeRing.position.set(0, 7.2, 0);

      // Rotating centrifuge arms and plant growth pods
      const armLength = 7.5;
      const numArms = 4;
      for (let a = 0; a < numArms; a++) {
        const armAngle = (a / numArms) * Math.PI * 2;
        const armGeo = new THREE.BoxGeometry(armLength, 0.22, 0.22);
        const armMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
        const arm = new THREE.Mesh(armGeo, armMat);
        arm.position.set((armLength / 2) * Math.cos(armAngle), 0, (armLength / 2) * Math.sin(armAngle));
        arm.rotation.y = -armAngle;
        centrifugeRing.add(arm);

        // Hydroponic pod at arm tip
        const podGeo = new THREE.CylinderGeometry(0.95, 0.95, 1.6, 12);
        const podMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.5 });
        const pod = new THREE.Mesh(podGeo, podMat);
        pod.position.set(armLength * Math.cos(armAngle), 0, armLength * Math.sin(armAngle));
        centrifugeRing.add(pod);

        // Bioreactor LED glow strip inside pod
        const podLight = new THREE.PointLight(0x10b981, 1.2, 8);
        podLight.position.set(armLength * Math.cos(armAngle), 0, armLength * Math.sin(armAngle));
        centrifugeRing.add(podLight);
      }
      habitatGroup.add(centrifugeRing);

      // Microgravity Anchor Tension Tethers
      const cableCount = 4;
      const cableMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 });
      for (let c = 0; c < cableCount; c++) {
        const cAngle = (c / cableCount) * Math.PI * 2 + Math.PI / 4;
        const groundX = 14 * Math.cos(cAngle);
        const groundZ = 14 * Math.sin(cAngle);
        const cableGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(domeRadius * 0.7 * Math.cos(cAngle), 3.4, domeRadius * 0.7 * Math.sin(cAngle)),
          new THREE.Vector3(groundX, 0.1, groundZ),
        ]);
        const cable = new THREE.Line(cableGeo, cableMat);
        scene.add(cable);

        // Anchor drill pylon in the regolith
        const pylonGeo = new THREE.CylinderGeometry(0.4, 0.6, 0.7, 8);
        const pylonMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
        const pylon = new THREE.Mesh(pylonGeo, pylonMat);
        pylon.position.set(groundX, 0.35, groundZ);
        scene.add(pylon);
      }
    }

    scene.add(habitatGroup);

    // ── 7C. High-Gain Communications Satellite Dish ───────────────────────────
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
      marsPlanetMesh,
      earthPlanetMesh,
      oceanMesh,
      cloudGroup,
      centrifugeRing,
      starsPoints: stars,
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

      // Slowly rotate giant Mars planet in moon's sky
      if (marsPlanetMesh) {
        marsPlanetMesh.rotation.y += delta * 0.014;
      }

      // Slowly rotate Earth globe in lunar sky (Earthrise view)
      if (earthPlanetMesh) {
        earthPlanetMesh.rotation.y += delta * 0.016;
      }

      // Slowly drift cumulus clouds across Earth sky
      if (cloudGroup) {
        cloudGroup.children.forEach((cloud, cIdx) => {
          cloud.position.x += delta * (0.8 + cIdx * 0.12);
          if (cloud.position.x > 75) cloud.position.x = -75;
        });
      }

      // Slowly rotate microgravity plant centrifuge
      if (centrifugeRing) {
        centrifugeRing.rotation.y += delta * 0.45;
      }

      // Slowly orbit Phobos across the sky (when standing on Mars)
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

        // A. Atmospheric billows / Earth rainfall
        if (dustParticles) {
          const posAttr = dustParticles.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < dustCount; i++) {
            if (isEarth) {
              let x = posAttr.getX(i) - 0.08;
              let y = posAttr.getY(i) - 0.85; // Rapid downward rainfall
              let z = posAttr.getZ(i);
              if (y < 0.2) y = 32;
              if (x < -55) x = 55;
              posAttr.setXYZ(i, x, y, z);
            } else {
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
          marsAudioService.stopDescentAudio();
          marsAudioService.startSurfaceAudio(surfaceData.locationId, isDustStormRef.current);
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
      {/* Three.js Canvas Container with touch-action none for fluid touch gestures */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* Top Left HUD: Touchdown Banner + NASA Capture Source Inspector */}
      <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 z-20 flex flex-col gap-2 max-w-[calc(100vw-7.5rem)] sm:max-w-xs pointer-events-none">
        {/* Touchdown EDL Confirmed Banner */}
        {descentNotification && (
          <div className="animate-in fade-in slide-in-from-top-3 duration-500">
            <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-black/90 backdrop-blur-md border border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center gap-2.5 sm:gap-3">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold leading-tight">
                  {surfaceData.terrain3DConfig.isMoon ? 'ORBITAL DESCENT // TOUCHDOWN' : 'EDL COMPLETE // TOUCHDOWN'}
                </p>
                <p className="text-[11px] sm:text-xs font-bold font-display text-white truncate">
                  {surfaceData.name.toUpperCase()} · {surfaceData.terrain3DConfig.isMoon ? 'MICROGRAVITY ANCHOR LOCKED' : 'SOL 1 ACTIVE'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Authentic NASA Capture Source Badge */}
        {primaryNasaImage && (
          <div className="pointer-events-auto">
            <button
              onClick={() => onInspectNasaImage?.(primaryNasaImage)}
              className="w-full text-left p-2 sm:p-2.5 rounded-xl bg-space-950/90 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 text-slate-200 transition-all shadow-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] group"
              title="Click to inspect raw high-resolution NASA PDS observation"
            >
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden shrink-0 border border-slate-700 group-hover:border-cyan-400/80 transition-colors bg-black">
                  <img
                    src={primaryNasaImage.thumbnailUrl || primaryNasaImage.imageUrl}
                    alt={primaryNasaImage.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (primaryNasaImage.fallbackUrl && target.src !== primaryNasaImage.fallbackUrl) {
                        target.src = primaryNasaImage.fallbackUrl;
                      } else {
                        target.src = '/textures/mars_realistic.jpg';
                      }
                    }}
                  />
                  <div className="absolute bottom-0.5 right-0.5 p-0.5 rounded bg-black/80 text-cyan-300">
                    <Camera className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="truncate">NASA RAW CAPTURE</span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold font-display text-white truncate group-hover:text-cyan-300 transition-colors">
                    {primaryNasaImage.mission}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-slate-400 truncate">
                    <span className="text-amber-300 shrink-0">{primaryNasaImage.solOrDate}</span>
                    <span>•</span>
                    <span className="truncate">{primaryNasaImage.instrument}</span>
                  </div>
                </div>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-400 group-hover:text-cyan-300">
                <span className="text-cyan-400/90 font-medium truncate mr-1">3D Mesh Derived from NASA PDS</span>
                <span className="underline decoration-cyan-500/50 shrink-0">View Raw ↗</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Surface Controls Floating Toolbar */}
      <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 z-20 flex flex-col items-end gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Time of Sol (Day / Sunset / Night) */}
        <div className="flex items-center gap-0.5 sm:gap-1 p-1 rounded-xl bg-space-950/85 backdrop-blur-md border border-slate-800 shadow-xl">
          <button
            onClick={() => setTimeOfSol('day')}
            className={`p-1.5 sm:p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              timeOfSol === 'day'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title={
              surfaceData.bodyType === 'earth'
                ? 'Daytime · Crisp sunlight, oceanic breeze'
                : surfaceData.bodyType === 'moon'
                  ? 'Solar Noon · 1361 W/m² (Direct space solar radiation)'
                  : surfaceData.terrain3DConfig.isMoon
                    ? 'Solar Noon · Space vacuum radiation'
                    : 'Martian Midday (Sol 12:00) · 175 W/m²'
            }
          >
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {surfaceData.bodyType === 'earth'
                ? 'Day'
                : surfaceData.bodyType === 'moon'
                  ? 'Solar Noon'
                  : surfaceData.terrain3DConfig.isMoon
                    ? 'Solar Noon'
                    : 'Midday'}
            </span>
          </button>
          <button
            onClick={() => setTimeOfSol('sunset')}
            className={`p-1.5 sm:p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              timeOfSol === 'sunset'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title={
              surfaceData.bodyType === 'earth'
                ? 'Golden Hour · Warm dusk illumination'
                : surfaceData.bodyType === 'moon'
                  ? 'Lunar Terminator · Raking low-angle shadows'
                  : surfaceData.terrain3DConfig.isMoon
                    ? 'Terminator · Low raking angle'
                    : 'Martian Blue Sunset (Sol 18:30) · NASA blue halo'
            }
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span className="hidden sm:inline">
              {surfaceData.bodyType === 'earth'
                ? 'Golden Hour'
                : surfaceData.bodyType === 'moon'
                  ? 'Terminator'
                  : surfaceData.terrain3DConfig.isMoon
                    ? 'Terminator'
                    : 'Sunset'}
            </span>
          </button>
          <button
            onClick={() => setTimeOfSol('night')}
            className={`p-1.5 sm:p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              timeOfSol === 'night'
                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title={
              surfaceData.bodyType === 'earth'
                ? 'Night · Starry sky and facility illumination'
                : surfaceData.bodyType === 'moon'
                  ? 'Lunar Night · Illuminated by radiant blue Earth-shine!'
                  : surfaceData.terrain3DConfig.isMoon
                    ? 'Cosmic Night · Radiant Mars-shine'
                    : 'Frigid Martian Night (Sol 23:00) · -88°C, Phobos rising'
            }
          >
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {surfaceData.bodyType === 'moon' ? 'Earth-Shine' : 'Night'}
            </span>
          </button>
        </div>

        {/* Storm / Precipitation / Solar Storm Simulation Toggle */}
        <button
          onClick={() => setIsDustStormActive(!isDustStormActive)}
          className={`flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-mono backdrop-blur-md border transition-all ${
            isDustStormActive
              ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.35)] animate-pulse'
              : 'bg-space-950/85 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
          title={
            surfaceData.bodyType === 'earth'
              ? 'Simulate coastal squall and precipitation rainfall'
              : surfaceData.bodyType === 'moon' || surfaceData.terrain3DConfig.isMoon
                ? 'Simulate Solar Energetic Particle (SEP) storm alert'
                : 'Simulate active Martian global dust squall (Optical Depth Tau > 3.0)'
          }
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Wind className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDustStormActive ? 'text-red-400 animate-spin' : 'text-slate-400'}`} />
            <span className="hidden xs:inline">
              {surfaceData.bodyType === 'earth'
                ? 'Rain Squall'
                : surfaceData.bodyType === 'moon' || surfaceData.terrain3DConfig.isMoon
                  ? 'Solar Storm'
                  : 'Dust Storm'}
            </span>
            <span className="xs:hidden">Storm</span>
          </div>
          <span className="text-[9px] sm:text-[10px] ml-1 sm:ml-2 px-1.5 py-0.5 rounded bg-black/50 font-bold">
            {surfaceData.bodyType === 'earth'
              ? isDustStormActive
                ? 'RAIN'
                : 'CLEAR'
              : surfaceData.bodyType === 'moon' || surfaceData.terrain3DConfig.isMoon
                ? isDustStormActive
                  ? 'SEP ALERT'
                  : 'SEP CLEAR'
                : isDustStormActive
                  ? 'TAU 3.2'
                  : 'CLEAR'}
          </span>
        </button>

        {/* Realistic Acoustic Soundscape & Music Toggle */}
        <button
          onClick={handleToggleAudio}
          className={`flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-mono backdrop-blur-md border transition-all ${
            isAudioMuted
              ? 'bg-space-950/85 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              : 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
          }`}
          title={isAudioMuted ? 'Enable authentic acoustic environment & site music' : 'Mute surface soundscape'}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isAudioMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
            )}
            <span className="hidden xs:inline">{isAudioMuted ? 'Sound Muted' : 'Acoustics'}</span>
            <span className="xs:hidden">{isAudioMuted ? 'Mute' : 'Audio'}</span>
          </div>
          <span className="text-[9px] sm:text-[10px] ml-1 sm:ml-2 px-1.5 py-0.5 rounded bg-black/50 font-bold">
            {isAudioMuted ? 'OFF' : 'LIVE'}
          </span>
        </button>

        {/* Camera Perspective Mode (Drone Orbit vs First-Person Astronaut) */}
        <div className="flex items-center gap-0.5 sm:gap-1 p-1 rounded-xl bg-space-950/85 backdrop-blur-md border border-slate-800 shadow-xl">
          <button
            onClick={() => setCameraMode('orbit')}
            className={`p-1.5 sm:p-2 rounded-lg text-[11px] sm:text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
              cameraMode === 'orbit'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Drone Survey View (Orbit around colony)"
          >
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Drone Orbit</span>
            <span className="sm:hidden text-[10px]">Orbit</span>
          </button>
          <button
            onClick={() => setCameraMode('firstPerson')}
            className={`p-1.5 sm:p-2 rounded-lg text-[11px] sm:text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
              cameraMode === 'firstPerson'
                ? 'bg-mars-950/80 text-mars-300 border border-mars-500/50 shadow-[0_0_10px_rgba(255,77,46,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Astronaut Eye Level (1.8m surface perspective)"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Astronaut POV</span>
            <span className="sm:hidden text-[10px]">POV</span>
          </button>
        </div>
      </div>

      {/* Bottom Surface Telemetry HUD Banner */}
      <div className="absolute bottom-2.5 sm:bottom-4 left-2.5 sm:left-4 right-2.5 sm:right-auto z-20 pointer-events-none max-w-full sm:max-w-[90vw]">
        <div className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-space-950/90 backdrop-blur-md border border-slate-800/90 text-[10px] sm:text-xs font-mono text-slate-300 shadow-xl flex flex-wrap items-center gap-x-2.5 sm:gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-bio-400 animate-ping shrink-0" />
            <span className="text-white font-bold">{surfaceData.name}</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300">{surfaceData.coordinates}</span>
          <span className="text-slate-600 hidden xs:inline">|</span>
          <span className="text-amber-300 hidden xs:inline">{surfaceData.elevation}</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Pressure:{' '}
            <strong className="text-slate-200">
              {surfaceData.bodyType === 'earth'
                ? '101.325 kPa (1.00 atm)'
                : surfaceData.bodyType === 'moon' || surfaceData.terrain3DConfig.isMoon
                  ? '0.000 kPa (Hard Vacuum)'
                  : `${surfaceData.atmosphericPressureKpa} kPa`}
            </strong>
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">
            {surfaceData.bodyType === 'earth' ? (
              <>
                Gravity: <strong className="text-emerald-300">9.807 m/s² (1.0g Standard)</strong>
              </>
            ) : surfaceData.bodyType === 'moon' ? (
              <>
                Gravity: <strong className="text-purple-300">1.622 m/s² (0.166g Lunar)</strong>
              </>
            ) : surfaceData.terrain3DConfig.isMoon ? (
              <>
                Gravity: <strong className="text-purple-300">{surfaceData.terrain3DConfig.gravityMss || 0.0057} m/s² (Microgravity)</strong>
              </>
            ) : (
              <>
                Gravity: <strong className="text-orange-300">3.721 m/s² (0.38g)</strong>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
