import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const icons = { success: CheckCircle2, error: AlertCircle, info: Info };

  return (
    <ToastContext.Provider value={{ addToast, success: (msg) => addToast(msg, "success"), error: (msg) => addToast(msg, "error"), info: (msg) => addToast(msg, "info") }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => {
          const Icon = icons[toast.type] || Info;
          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <Icon size={18} />
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button
                className="btn btn-ghost"
                style={{ padding: '2px' }}
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
