import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValue?: boolean;
  valueSuffix?: string;
  variant?: 'cyan' | 'mars' | 'bio' | 'amber' | 'dynamic';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  valueSuffix = '%',
  variant = 'cyan',
  size = 'md',
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getDynamicColor = (pct: number) => {
    if (pct < 30) return 'from-red-600 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    if (pct < 70) return 'from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    return 'from-bio-600 to-bio-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
  };

  const variantGradients = {
    cyan: 'from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.4)]',
    mars: 'from-mars-600 to-mars-400 shadow-[0_0_10px_rgba(255,77,46,0.4)]',
    bio: 'from-bio-600 to-bio-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]',
    amber: 'from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
    dynamic: getDynamicColor(percentage)
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
          {label && <span className="text-slate-300 font-medium">{label}</span>}
          {showValue && (
            <span className="text-slate-400 font-bold">
              {value}{valueSuffix}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-space-950/80 border border-slate-800 rounded-full overflow-hidden p-0.5 ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ${variantGradients[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
