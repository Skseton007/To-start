import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    // Errors stay longer so they can actually be read
    setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3000);
  }, [dismiss]);

  // Stable value so consumers' effects don't re-run on every toast
  const value = useMemo(() => ({
    addToast,
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map(toast => {
          const Icon = icons[toast.type] || Info;
          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{toast.message}</span>
              <button className="icon-btn p-1" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
