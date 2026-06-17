import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`pointer-events-auto flex items-start p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-slide-in ${
        isSuccess
          ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
          : 'bg-rose-950/90 border-rose-500/30 text-rose-200'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-400" />
        )}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-4 flex-shrink-0 inline-flex text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
