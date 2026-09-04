import React from 'react';
import { useAudio } from '../../context/AudioContext';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  subtext?: string;
  onChange: (value: number) => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  subtext,
  onChange,
  className = ''
}) => {
  const { playClick } = useAudio();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onChange(val);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-xs font-mono">
        <label className="text-slate-300 font-semibold tracking-wider uppercase">{label}</label>
        <span className="text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        onMouseUp={playClick}
        className="w-full h-2 bg-space-950 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
      />
      {subtext && <p className="text-[11px] text-slate-400 font-mono">{subtext}</p>}
    </div>
  );
};
