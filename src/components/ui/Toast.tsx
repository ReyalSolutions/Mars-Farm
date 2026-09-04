import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ---- Provider ----
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = toast.duration ?? 4000;
    setToasts(prev => [...prev.slice(-4), { ...toast, id }]);
    timers.current[id] = setTimeout(() => dismissToast(id), duration);
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// ---- Icons ----
const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-bio-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  error:   <XCircle className="w-4 h-4 text-mars-400" />,
  info:    <Info className="w-4 h-4 text-cyan-400" />,
};

const BORDER_COLOR: Record<ToastType, string> = {
  success: 'border-bio-500/50',
  warning: 'border-amber-500/50',
  error:   'border-mars-500/50',
  info:    'border-cyan-500/50',
};

const GLOW: Record<ToastType, string> = {
  success: 'shadow-[0_0_16px_rgba(16,185,129,0.25)]',
  warning: 'shadow-[0_0_16px_rgba(245,158,11,0.25)]',
  error:   'shadow-[0_0_16px_rgba(255,77,46,0.25)]',
  info:    'shadow-[0_0_16px_rgba(0,240,255,0.2)]',
};

// ---- Container ----
const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 w-80 pointer-events-none"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-space-950/95 backdrop-blur-md border ${BORDER_COLOR[toast.type]} ${GLOW[toast.type]} animate-in slide-in-from-right-4 fade-in duration-200`}
        >
          <span className="mt-0.5 shrink-0">{ICONS[toast.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono font-bold text-white leading-tight">{toast.title}</p>
            {toast.message && (
              <p className="text-[11px] font-mono text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="shrink-0 text-slate-500 hover:text-slate-200 transition-colors mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
