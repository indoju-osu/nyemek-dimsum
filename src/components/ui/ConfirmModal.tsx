import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  danger = true,
  onConfirm,
  onCancel,
  children,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md bg-[#1C1C1C] border border-white/10 rounded-lg p-6 text-[#FFF4E8] shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle
              className={`w-5 h-5 shrink-0 ${
                danger ? 'text-[#D71920]' : 'text-[#FFC247]'
              }`}
              aria-hidden="true"
            />
            <h3 id="confirm-modal-title" className="font-display text-xl tracking-wide uppercase">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#A7A7A7] hover:text-[#FFF4E8] p-1"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#A7A7A7] leading-relaxed mb-4">{description}</p>
        {children}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[#FFF4E8] bg-white/5 hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
              danger
                ? 'bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8]'
                : 'bg-[#FFC247] hover:bg-[#E5AC38] text-[#111111]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
