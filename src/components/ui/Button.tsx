import React from 'react';
import { useAudio } from '../../context/AudioContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'mars' | 'bio' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const { playClick } = useAudio();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playClick();
    if (onClick) onClick(e);
  };

  const baseStyles = 'inline-flex items-center justify-center font-display font-medium uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-space-950 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-md relative overflow-hidden active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 shadow-lg',
  };

  const variantStyles = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-space-950 font-semibold shadow-[0_0_15px_rgba(0,240,255,0.35)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] focus:ring-cyan-400',
    mars: 'bg-gradient-to-r from-mars-600 to-mars-500 hover:from-mars-500 hover:to-mars-400 text-white font-semibold shadow-[0_0_20px_rgba(255,77,46,0.35)] hover:shadow-[0_0_30px_rgba(255,77,46,0.6)] focus:ring-mars-400',
    bio: 'bg-gradient-to-r from-bio-600 to-bio-500 hover:from-bio-500 hover:to-bio-400 text-white font-semibold shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] focus:ring-bio-400',
    secondary: 'bg-space-800 hover:bg-space-700 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 focus:ring-cyan-500',
    outline: 'bg-transparent hover:bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:border-cyan-400 focus:ring-cyan-400',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-400',
    danger: 'bg-red-600 hover:bg-red-500 text-white font-semibold shadow-[0_0_15px_rgba(239,68,68,0.4)] focus:ring-red-400',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
