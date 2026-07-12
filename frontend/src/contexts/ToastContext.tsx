import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, RotateCcw } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  undoAction?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: ToastType, undoAction?: () => void) => void;
  removeToast: (id: string) => void;
  success: (message: string, undoAction?: () => void) => void;
  error: (message: string, undoAction?: () => void) => void;
  warning: (message: string, undoAction?: () => void) => void;
  info: (message: string, undoAction?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType, undoAction?: () => void) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, undoAction }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = (message: string, undoAction?: () => void) => showToast(message, 'success', undoAction);
  const error = (message: string, undoAction?: () => void) => showToast(message, 'error', undoAction);
  const warning = (message: string, undoAction?: () => void) => showToast(message, 'warning', undoAction);
  const info = (message: string, undoAction?: () => void) => showToast(message, 'info', undoAction);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast container overlay */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col space-y-2 w-full max-w-sm">
        {toasts.map(toast => {
          const icons = {
            success: <CheckCircle2 className="text-emerald-500" size={18} />,
            error: <AlertCircle className="text-rose-500" size={18} />,
            warning: <AlertTriangle className="text-amber-500" size={18} />,
            info: <Info className="text-blue-500" size={18} />
          };

          const themes = {
            success: 'bg-white dark:bg-zinc-900 border-emerald-100 dark:border-emerald-950/30 text-slate-900 dark:text-slate-100 shadow-premium',
            error: 'bg-white dark:bg-zinc-900 border-rose-100 dark:border-rose-950/30 text-slate-900 dark:text-slate-100 shadow-premium',
            warning: 'bg-white dark:bg-zinc-900 border-amber-100 dark:border-amber-950/30 text-slate-900 dark:text-slate-100 shadow-premium',
            info: 'bg-white dark:bg-zinc-900 border-blue-100 dark:border-blue-950/30 text-slate-900 dark:text-slate-100 shadow-premium'
          };

          return (
            <div
              key={toast.id}
              className={`flex items-start justify-between p-4 border rounded-xl animate-fade-in ${themes[toast.type]} pointer-events-auto`}
              role="alert"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">{icons[toast.type]}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{toast.message}</p>
                  {toast.undoAction && (
                    <button
                      onClick={() => {
                        toast.undoAction?.();
                        removeToast(toast.id);
                      }}
                      className="mt-2 inline-flex items-center space-x-1 text-xs font-semibold text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition"
                    >
                      <RotateCcw size={12} />
                      <span>Undo Action</span>
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 p-0.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
