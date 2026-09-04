import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-space-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog with responsive height and scrolling body */}
      <div className={`relative w-full ${maxWidthClasses[maxWidth]} max-h-[92vh] flex flex-col hud-panel rounded-2xl border border-cyan-500/40 p-3.5 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] z-10 overflow-hidden`}>
        {/* Header */}
        <div className="flex items-start justify-between pb-2.5 sm:pb-3 border-b border-slate-800 shrink-0">
          <div className="pr-2">
            <h3 className="text-sm sm:text-base font-bold font-display uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span>{title}</span>
            </h3>
            {subtitle && <p className="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5 line-clamp-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors focus:outline-none shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="pt-3 pb-1 text-sm text-slate-200 overflow-y-auto flex-1 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
};
