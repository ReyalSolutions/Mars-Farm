/**
 * Mars Real-Time Procedural Synthesizer & Acoustic Environment
 *
 * Implements authentic Martian acoustics grounded in NASA Perseverance SuperCam
 * microphone research: Mars has a thin (6.1 mbar) CO2 atmosphere where sound travels
 * ~240 m/s (vs 340 m/s on Earth) and frequencies above 1 kHz are heavily attenuated.
 *
 * Provides:
 * 1. Entry, Descent & Landing (EDL) hypersonic re-entry roar & retro-rockets.
 * 2. Site-specific ambient music and soundscapes for all 6 Martian landing sites.
 * 3. Dynamic volumetric dust storm howling wind, sand grain hull impacts, and strobe beacons.
 */

class MarsAudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Active nodes tracking
  private descentNodes: {
    noiseSource?: AudioBufferSourceNode;
    noiseFilter?: BiquadFilterNode;
    noiseGain?: GainNode;
    subOsc?: OscillatorNode;
    subGain?: GainNode;
    masterGain?: GainNode;
    pingInterval?: number;
  } = {};

  private surfaceNodes: {
    locationId?: string;
    windSource?: AudioBufferSourceNode;
    windFilter?: BiquadFilterNode;
    windGain?: GainNode;
    stormGain?: GainNode;
    sandSource?: AudioBufferSourceNode;
    sandFilter?: BiquadFilterNode;
    sandGain?: GainNode;
    droneOscs?: OscillatorNode[];
    droneGain?: GainNode;
    masterGain?: GainNode;
    strobeInterval?: number;
  } = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('mars_surface_audio_muted') === 'true';
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mars_surface_audio_muted', String(muted));
    }
    if (muted) {
      if (this.descentNodes.masterGain && this.ctx) {
        this.descentNodes.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      if (this.surfaceNodes.masterGain && this.ctx) {
        this.surfaceNodes.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } else {
      if (this.descentNodes.masterGain && this.ctx) {
        this.descentNodes.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      }
      if (this.surfaceNodes.masterGain && this.ctx) {
        this.surfaceNodes.masterGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      }
    }
  }

  public toggleMute(): boolean {
    const next = !this.isMuted;
    this.setMuted(next);
    return next;
  }

  // ── 1. Atmospheric Entry, Descent & Landing (EDL) Audio ─────────────────────

  // ── 1. Atmospheric Entry, Descent & Landing (EDL) Audio ─────────────────────

  public startDescentAudio(targetType: 'mars' | 'earth' | 'moon' | 'martian-moon' | boolean = false) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.stopDescentAudio();

    let type: 'mars' | 'earth' | 'moon' | 'martian-moon';
    if (typeof targetType === 'boolean') {
      type = targetType ? 'martian-moon' : 'mars';
    } else {
      type = targetType;
    }

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(this.isMuted ? 0.0001 : 0.28, now + 0.4);
      masterGain.connect(ctx.destination);

      // A. Hypersonic Re-entry / Orbital Retro-Thrusters
      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brownian low-frequency accumulation
        data[i] = (lastOut + 0.04 * white) / 1.04;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter sweeps based on celestial atmosphere density:
      // Earth: Dense N2-O2 plasma & supersonic rush (180Hz to 1600Hz)
      // Mars: Thin CO2 plasma (160Hz to 950Hz)
      // Moon / Phobos: Vacuum cold-gas / hypergolic RCS pulsing (110Hz to 280Hz)
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      if (type === 'earth') {
        noiseFilter.frequency.setValueAtTime(180, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(1600, now + 1.2);
        noiseFilter.frequency.exponentialRampToValueAtTime(320, now + 2.7);
      } else if (type === 'moon' || type === 'martian-moon') {
        noiseFilter.frequency.setValueAtTime(110, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(280, now + 1.4);
        noiseFilter.frequency.exponentialRampToValueAtTime(130, now + 2.7);
      } else {
        noiseFilter.frequency.setValueAtTime(160, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(950, now + 1.2);
        noiseFilter.frequency.exponentialRampToValueAtTime(240, now + 2.7);
      }

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(type === 'earth' ? 0.35 : (type === 'moon' || type === 'martian-moon' ? 0.16 : 0.3), now);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start();

      // B. Sub-bass Descent Core Rumble (32 - 52 Hz sine)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(type === 'earth' ? 52 : (type === 'moon' ? 36 : 44), now);
      subOsc.frequency.linearRampToValueAtTime(30, now + 2.6);

      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.02, now + 2.7);

      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start();

      // C. Futuristic Cinematic Synth Descent Chords
      let chordNotes: number[];
      if (type === 'earth') {
        chordNotes = [130.81, 164.81, 196.0, 261.63, 329.63]; // C major aerospace glory
      } else if (type === 'moon') {
        chordNotes = [97.99, 146.83, 196.0, 293.66, 392.0]; // G minor lunar mystery
      } else if (type === 'martian-moon') {
        chordNotes = [116.54, 174.61, 233.08, 349.23]; // Bb minor orbital space
      } else {
        chordNotes = [130.81, 196.0, 261.63, 392.0]; // Mars classic fifths
      }

      chordNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((idx - 1.5) * 7, now); // Gentle warm chorusing

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 1.8);
        filter.frequency.exponentialRampToValueAtTime(350, now + 2.8);

        oGain.gain.setValueAtTime(0.001, now);
        oGain.gain.exponentialRampToValueAtTime(0.045, now + 0.5);
        oGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

        osc.connect(filter);
        filter.connect(oGain);
        oGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 2.9);
      });

      // D. Radar Telemetry Ping Beeps (TRN Terrain Relative Navigation & Lidar Lock)
      let pingCount = 0;
      const pingInterval = window.setInterval(() => {
        if (!this.ctx || this.isMuted) return;
        try {
          const t = this.ctx.currentTime;
          const pingOsc = this.ctx.createOscillator();
          const pGain = this.ctx.createGain();
          pingOsc.type = 'sine';
          const freq = type === 'moon' ? 1400 + (pingCount % 4) * 120 : (type === 'earth' ? 2200 : 1200 + pingCount * 80);
          pingOsc.frequency.setValueAtTime(freq, t);
          pGain.gain.setValueAtTime(0.04, t);
          pGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

          pingOsc.connect(pGain);
          pGain.connect(masterGain);
          pingOsc.start(t);
          pingOsc.stop(t + 0.09);
          pingCount++;
        } catch {}
      }, type === 'earth' ? 320 : 450);

      this.descentNodes = {
        noiseSource,
        noiseFilter,
        noiseGain,
        subOsc,
        subGain,
        masterGain,
        pingInterval,
      };
    } catch (e) {
      console.warn('EDL descent audio error:', e);
    }
  }

  public stopDescentAudio() {
    if (this.descentNodes.pingInterval) {
      clearInterval(this.descentNodes.pingInterval);
    }
    const currentNodes = this.descentNodes;
    this.descentNodes = {};

    if (currentNodes.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        currentNodes.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        setTimeout(() => {
          try {
            currentNodes.noiseSource?.stop();
            currentNodes.subOsc?.stop();
          } catch {}
        }, 350);
      } catch {}
    }
  }

  // ── 2. Site-Specific Surface Music & Martian Atmospheric Soundscape ──────────

  /**
   * Chords & Musical Atmosphere per Martian Landing Site:
   * - Jezero: Serene ancient river delta, open fifths (D minor: D2, A2, F3, D4)
   * - Gale: Resonant deep central mound (C minor: C2, G2, Eb3, Bb3)
   * - Utopia: Crystalline frozen cryo-ice sheet (E minor: E2, B2, G3, B3, high sparkle E5)
   * - Olympus: Subterranean volcanic lava tubes (Sub-bass A1: 55Hz, E2, A2, low pass)
   * - Valles: Grand canyon abyss winds (A minor / D minor: A1, E2, C3, A3)
   * - Arcadia: Optimistic human colony dawn (F major: F2, C3, A3, F4)
   */
  private getSiteMusicalFrequencies(locationId: string): number[] {
    switch (locationId) {
      case 'jezero-crater':
        return [73.42, 110.0, 174.61, 293.66]; // D2, A2, F3, D4
      case 'gale-crater':
        return [65.41, 98.0, 155.56, 233.08]; // C2, G2, Eb3, Bb3
      case 'utopia-planitia':
        return [82.41, 123.47, 196.0, 329.63, 659.25]; // E2, B2, G3, E4, E5 (Glassy icy sheen)
      case 'olympus-mons-foothills':
        return [55.0, 82.41, 110.0, 164.81]; // A1, E2, A2, E3 (Deep volcanic basalt sub-bass)
      case 'valles-marineris':
        return [55.0, 110.0, 130.81, 220.0]; // A1, A2, C3, A3 (Canyon reverb abyss)
      case 'arcadia-planitia':
        return [87.31, 130.81, 174.61, 261.63]; // F2, C3, F3, C4 (Warm human pioneer major chords)
      case 'phobos':
        return [58.27, 116.54, 155.56, 233.08, 349.23, 466.16]; // Bb1, Bb2, Eb3, Bb3, F4, Bb4 (Orbital mystery)
      case 'deimos':
        return [69.30, 103.83, 138.59, 207.65, 277.18, 415.30]; // C#2, G#2, C#3, G#3, C#4, G#4 (Orbital serenity)
      case 'kennedy-space-center':
        return [65.41, 130.81, 196.0, 261.63, 329.63, 392.0]; // C2, C3, G3, C4, E4, G4 (Uplifting aerospace major)
      case 'mauna-kea':
        return [55.0, 110.0, 164.81, 220.0, 329.63]; // A1, A2, E3, A3, E4 (High-altitude alpine wind)
      case 'svalbard-vault':
        return [73.42, 110.0, 164.81, 220.0, 440.0, 880.0]; // D2, A2, E3, A3, A4, A5 (Crystalline arctic frost)
      case 'shackleton-crater':
        return [48.99, 97.99, 146.83, 196.0, 293.66, 440.0]; // G1, G2, D3, G3, D4, A4 (Deep eternal polar ice)
      case 'tranquility-base':
        return [55.0, 110.0, 146.83, 220.0, 293.66, 369.99]; // A1, A2, D3, A3, D4, F#4 (Apollo 11 historic triumph)
      default:
        return [73.42, 110.0, 174.61, 293.66];
    }
  }

  public startSurfaceAudio(locationId: string, isDustStorm: boolean = false) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const isEarth = locationId === 'kennedy-space-center' || locationId === 'mauna-kea' || locationId === 'svalbard-vault';
    const isMoon = locationId === 'phobos' || locationId === 'deimos' || locationId === 'shackleton-crater' || locationId === 'tranquility-base';

    // If already playing this site, just update the dust storm state
    if (this.surfaceNodes.locationId === locationId && this.surfaceNodes.masterGain) {
      this.setDustStormAudio(isDustStorm);
      return;
    }

    this.stopSurfaceAudio();

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(this.isMuted ? 0.0001 : 0.22, now + 1.2);
      masterGain.connect(ctx.destination);

      // A. Ambient Wind / Ocean Surf / Life-Support Ventilation
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const windData = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.992 * b0 + white * 0.045;
        b1 = 0.985 * b1 + white * 0.035;
        b2 = 0.975 * b2 + white * 0.025;
        windData[i] = (b0 + b1 + b2) * 0.8;
      }

      const windSource = ctx.createBufferSource();
      windSource.buffer = noiseBuffer;
      windSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      if (isEarth) {
        // Natural Earth coastal sea breeze / high-altitude wind
        windFilter.frequency.setValueAtTime(isDustStorm ? 620 : 220, now);
      } else if (isMoon) {
        // Microgravity space habitat life support airflow
        windFilter.frequency.setValueAtTime(isDustStorm ? 180 : 80, now);
      } else {
        // Thin Martian carbon dioxide gale
        windFilter.frequency.setValueAtTime(isDustStorm ? 480 : 160, now);
      }

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(
        isEarth ? (isDustStorm ? 0.55 : 0.25) : (isMoon ? (isDustStorm ? 0.15 : 0.05) : (isDustStorm ? 0.65 : 0.22)),
        now
      );

      windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);
      windSource.start();

      // B. Sand Pelting Granular Noise (active during dust storm)
      const sandBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const sandData = sandBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Intermittent sharp crackles of airborne grains striking the dome
        sandData[i] = Math.random() > 0.88 ? (Math.random() * 2 - 1) * 0.4 : 0;
      }
      const sandSource = ctx.createBufferSource();
      sandSource.buffer = sandBuffer;
      sandSource.loop = true;

      const sandFilter = ctx.createBiquadFilter();
      sandFilter.type = 'bandpass';
      sandFilter.frequency.setValueAtTime(1400, now);
      sandFilter.Q.setValueAtTime(2.5, now);

      const sandGain = ctx.createGain();
      sandGain.gain.setValueAtTime(isDustStorm ? 0.18 : 0.0001, now);

      sandSource.connect(sandFilter);
      sandFilter.connect(sandGain);
      sandGain.connect(masterGain);
      sandSource.start();

      // C. Site-Specific Ambient Musical Drone (Harmonic Pads)
      const freqs = this.getSiteMusicalFrequencies(locationId);
      const droneOscs: OscillatorNode[] = [];
      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.12, now);

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Subtle detune for rich celestial chorus
        osc.detune.setValueAtTime((idx - 1) * 4.5, now);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320 + idx * 80, now);

        oscGain.gain.setValueAtTime(0.06 / (idx + 1), now);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(droneGain);
        osc.start();
        droneOscs.push(osc);
      });

      droneGain.connect(masterGain);

      // D. Strobe Alert Beeps if storm is active
      let strobeInterval: number | undefined;
      if (isDustStorm) {
        strobeInterval = window.setInterval(() => {
          if (!this.ctx || this.isMuted) return;
          try {
            const t = this.ctx.currentTime;
            const bOsc = this.ctx.createOscillator();
            const bGain = this.ctx.createGain();
            bOsc.type = 'sine';
            bOsc.frequency.setValueAtTime(740, t);
            bGain.gain.setValueAtTime(0.04, t);
            bGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
            bOsc.connect(bGain);
            bGain.connect(masterGain);
            bOsc.start(t);
            bOsc.stop(t + 0.12);
          } catch {}
        }, 1200);
      }

      this.surfaceNodes = {
        locationId,
        windSource,
        windFilter,
        windGain,
        sandSource,
        sandFilter,
        sandGain,
        droneOscs,
        droneGain,
        masterGain,
        strobeInterval,
      };
    } catch (e) {
      console.warn('Surface ambient audio error:', e);
    }
  }

  public setDustStormAudio(isDustStorm: boolean) {
    if (!this.ctx || !this.surfaceNodes.windFilter || !this.surfaceNodes.windGain) return;
    try {
      const now = this.ctx.currentTime;

      if (isDustStorm) {
        // Whistling, powerful howling squall
        this.surfaceNodes.windFilter.frequency.exponentialRampToValueAtTime(540, now + 0.8);
        this.surfaceNodes.windGain.gain.linearRampToValueAtTime(0.70, now + 0.8);

        // Turn on sand grain pelting
        if (this.surfaceNodes.sandGain) {
          this.surfaceNodes.sandGain.gain.linearRampToValueAtTime(0.22, now + 0.8);
        }

        // Strobe beeps
        if (!this.surfaceNodes.strobeInterval) {
          this.surfaceNodes.strobeInterval = window.setInterval(() => {
            if (!this.ctx || this.isMuted || !this.surfaceNodes.masterGain) return;
            try {
              const t = this.ctx.currentTime;
              const bOsc = this.ctx.createOscillator();
              const bGain = this.ctx.createGain();
              bOsc.type = 'sine';
              bOsc.frequency.setValueAtTime(740, t);
              bGain.gain.setValueAtTime(0.035, t);
              bGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
              bOsc.connect(bGain);
              bGain.connect(this.surfaceNodes.masterGain);
              bOsc.start(t);
              bOsc.stop(t + 0.12);
            } catch {}
          }, 1200);
        }
      } else {
        // Return to gentle background breeze
        this.surfaceNodes.windFilter.frequency.exponentialRampToValueAtTime(160, now + 0.8);
        this.surfaceNodes.windGain.gain.linearRampToValueAtTime(0.22, now + 0.8);

        if (this.surfaceNodes.sandGain) {
          this.surfaceNodes.sandGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
        }

        if (this.surfaceNodes.strobeInterval) {
          clearInterval(this.surfaceNodes.strobeInterval);
          this.surfaceNodes.strobeInterval = undefined;
        }
      }
    } catch {}
  }

  public stopSurfaceAudio() {
    if (this.surfaceNodes.strobeInterval) {
      clearInterval(this.surfaceNodes.strobeInterval);
    }
    const currentNodes = this.surfaceNodes;
    this.surfaceNodes = {};

    if (currentNodes.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        currentNodes.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        setTimeout(() => {
          try {
            currentNodes.windSource?.stop();
            currentNodes.sandSource?.stop();
            currentNodes.droneOscs?.forEach(osc => osc.stop());
          } catch {}
        }, 550);
      } catch {}
    }
  }
}

export const marsAudioService = new MarsAudioService();
