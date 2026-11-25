import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-none"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
            ? AlertCircle
            : Info;
        const borderColor =
          toast.type === 'success'
            ? 'border-[#25D366]/50'
            : toast.type === 'error'
            ? 'border-[#D71920]'
            : 'border-white/15';
        const iconColor =
          toast.type === 'success'
            ? 'text-[#25D366]'
            : toast.type === 'error'
            ? 'text-[#D71920]'
            : 'text-[#FFC247]';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 bg-[#1C1C1C] border ${borderColor} text-[#FFF4E8] px-4 py-3 rounded-lg shadow-xl text-sm`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-[#A7A7A7] hover:text-[#FFF4E8] p-0.5 transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
