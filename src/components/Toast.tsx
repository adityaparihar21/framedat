import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className="pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-[--bg-surface-2] border border-[--border-subtle] shadow-xl text-xs font-sans text-[--text-primary] animate-slide-up">
      <div className="flex items-center gap-2.5">
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[--accent-blue] shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-[--text-secondary] shrink-0" />}
        <span className="font-medium">{toast.text}</span>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded text-[--text-tertiary] hover:text-[--text-primary] hover:bg-[--bg-surface-3] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
