import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'mars' | 'bio' | 'dark' | 'glass';
  className?: string;
  glow?: boolean;
  cornerBrackets?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  glow = false,
  cornerBrackets = false,
  onClick
}) => {
  const variantClasses = {
    default: 'bg-space-900/80 border-cyan-500/20 text-slate-100',
    mars: 'bg-gradient-to-br from-space-900/90 to-mars-950/50 border-mars-500/30 text-slate-100',
    bio: 'bg-gradient-to-br from-space-900/90 to-bio-950/50 border-bio-500/30 text-slate-100',
    dark: 'bg-space-950/90 border-slate-800 text-slate-100',
    glass: 'bg-space-900/40 backdrop-blur-md border-white/10 text-slate-100',
  };

  const glowClasses = glow
    ? variant === 'mars'
      ? 'shadow-[0_0_20px_rgba(255,77,46,0.15)]'
      : variant === 'bio'
      ? 'shadow-[0_0_20px_rgba(16,185,129,0.15)]'
      : 'shadow-[0_0_20px_rgba(0,240,255,0.12)]'
    : '';

  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg border p-5 transition-all duration-200
        ${variantClasses[variant]}
        ${glowClasses}
        ${cornerBrackets ? 'hud-corner-brackets' : ''}
        ${onClick ? 'cursor-pointer hover:border-cyan-400/50 hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
