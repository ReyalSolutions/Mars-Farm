import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface AudioContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playClick: () => void;
  playSuccess: () => void;
  playAlarm: () => void;
  playDayTick: () => void;
  playHarvestChime: () => void;
  startAmbientLoop: () => void;
  stopAmbientLoop: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('mars_farm_sound') !== 'false';
  });

  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const ambientNodesRef = useRef<{
    windSource: AudioNode | null;
    pumpSource: OscillatorNode | null;
    masterGain: GainNode | null;
  }>({
    windSource: null,
    pumpSource: null,
    masterGain: null
  });

  useEffect(() => {
    localStorage.setItem('mars_farm_sound', String(soundEnabled));
    if (!soundEnabled) {
      stopAmbientLoop();
    }
  }, [soundEnabled]);

  const initAudio = (): AudioContext | null => {
    if (!audioCtx && typeof window !== 'undefined') {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        const newCtx = new Ctx();
        setAudioCtx(newCtx);
        return newCtx;
      }
    } else if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
      return audioCtx;
    }
    return audioCtx;
  };

  const toggleSound = () => {
    initAudio();
    setSoundEnabled(prev => !prev);
  };

  const playClick = () => {
    if (!soundEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  };

  const playSuccess = () => {
    if (!soundEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.06, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * 0.06 + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + (idx + 1) * 0.06 + 0.1);
      });
    } catch {}
  };

  const playHarvestChime = () => {
    if (!soundEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + (idx + 1) * 0.05 + 0.2);
      });
    } catch {}
  };

  const playAlarm = () => {
    if (!soundEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.15);
      osc.frequency.linearRampToValueAtTime(440, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  };

  const playDayTick = () => {
    if (!soundEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.015);
    } catch {}
  };

  // Martian Atmospheric & ECLSS Life-Support Ambient Soundscape (Synthesized)
  const startAmbientLoop = () => {
    if (!soundEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    if (ambientNodesRef.current.masterGain) return; // already active

    try {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 1.2); // subtle, soothing background
      masterGain.connect(ctx.destination);

      // 1. Synthesize low-frequency Martian sub-surface wind roar (filtered noise buffer)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.98 * b1 + white * 0.04;
        b2 = 0.97 * b2 + white * 0.03;
        output[i] = (b0 + b1 + b2) * 0.6;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(120, ctx.currentTime); // low rumble

      whiteNoise.connect(lowpass);
      lowpass.connect(masterGain);
      whiteNoise.start();

      // 2. ECLSS Hydroponic / Aeroponic circulation pump hum (60 Hz AC low drone)
      const pump = ctx.createOscillator();
      const pumpGain = ctx.createGain();
      pump.type = 'sine';
      pump.frequency.setValueAtTime(62, ctx.currentTime);
      pumpGain.gain.setValueAtTime(0.25, ctx.currentTime);
      pump.connect(pumpGain);
      pumpGain.connect(masterGain);
      pump.start();

      ambientNodesRef.current = {
        windSource: whiteNoise,
        pumpSource: pump,
        masterGain
      };
    } catch {}
  };

  const stopAmbientLoop = () => {
    if (ambientNodesRef.current.masterGain && audioCtx) {
      try {
        ambientNodesRef.current.masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        setTimeout(() => {
          try {
            (ambientNodesRef.current.windSource as any)?.stop();
            ambientNodesRef.current.pumpSource?.stop();
          } catch {}
          ambientNodesRef.current = { windSource: null, pumpSource: null, masterGain: null };
        }, 450);
      } catch {
        ambientNodesRef.current = { windSource: null, pumpSource: null, masterGain: null };
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        playClick,
        playSuccess,
        playAlarm,
        playDayTick,
        playHarvestChime,
        startAmbientLoop,
        stopAmbientLoop
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
