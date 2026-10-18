import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', danger = true }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onCancel}>
      <div className="bg-white dark:bg-dark-card border border-[var(--border)] rounded-2xl shadow-xl w-full max-w-sm p-6" role="alertdialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          {danger && (
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
          )}
          <div>
            <div className="text-lg font-bold">{title}</div>
            <div className="text-[var(--text-muted)] text-sm mt-1">{message}</div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button
            className={`px-5 py-2.5 rounded-full text-white font-semibold transition-colors active:scale-95 ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-black hover:bg-gray-800 dark:bg-white dark:text-black'}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
