import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  colorScheme?: 'cyan' | 'mars' | 'bio' | 'amber' | 'purple';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon,
  colorScheme = 'cyan',
  className = ''
}) => {
  const schemeStyles = {
    cyan: 'border-cyan-500/20 text-cyan-400 bg-cyan-950/20',
    mars: 'border-mars-500/20 text-mars-400 bg-mars-950/20',
    bio: 'border-bio-500/20 text-bio-400 bg-bio-950/20',
    amber: 'border-amber-500/20 text-amber-400 bg-amber-950/20',
    purple: 'border-purple-500/20 text-purple-400 bg-purple-950/20',
  };

  const textColors = {
    cyan: 'text-cyan-300',
    mars: 'text-mars-400',
    bio: 'text-bio-400',
    amber: 'text-amber-300',
    purple: 'text-purple-300',
  };

  return (
    <div className={`hud-panel rounded-lg border p-3 sm:p-4 relative overflow-hidden transition-all duration-200 hover:border-cyan-400/40 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider truncate">{label}</p>
          <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
            <span className={`text-lg sm:text-2xl lg:text-3xl font-bold font-display tracking-tight truncate ${textColors[colorScheme]}`}>
              {value}
            </span>
            {unit && <span className="text-[10px] sm:text-xs font-mono text-slate-400">{unit}</span>}
          </div>
          {subtext && <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-400/90 truncate">{subtext}</p>}
        </div>
        {icon && (
          <div className={`p-1.5 sm:p-2.5 rounded-md border shrink-0 ${schemeStyles[colorScheme]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
