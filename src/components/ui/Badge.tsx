import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'mars' | 'bio' | 'amber' | 'neutral' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  icon,
  className = ''
}) => {
  const variantStyles = {
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30',
    mars: 'bg-mars-950/60 text-mars-300 border-mars-500/30',
    bio: 'bg-bio-950/60 text-bio-300 border-bio-500/30',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
    neutral: 'bg-space-800 text-slate-300 border-slate-700',
    danger: 'bg-red-950/60 text-red-300 border-red-500/30',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-mono gap-1',
    md: 'text-xs px-2.5 py-1 font-mono gap-1.5',
  };

  return (
    <span className={`inline-flex items-center rounded border font-medium uppercase tracking-wider ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
