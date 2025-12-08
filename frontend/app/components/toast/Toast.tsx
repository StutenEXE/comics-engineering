import React, { createContext, useCallback, useContext, useState } from 'react';

type ToastType = 'info' | 'success' | 'error';

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  show: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let idCounter = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = idCounter++;
    setToasts((t) => [...t, { id, type, message }]);
    if (duration > 0) {
      window.setTimeout(() => remove(id), duration);
    }
  }, [remove]);

  const success = useCallback((message: string, duration?: number) => show(message, 'success', duration), [show]);
  const error = useCallback((message: string, duration?: number) => show(message, 'error', duration), [show]);
  const info = useCallback((message: string, duration?: number) => show(message, 'info', duration), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info }}>
      {children}

      <div aria-live="assertive" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full px-4 py-2 rounded shadow-lg text-white flex items-center justify-between space-x-4 ${
              t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-800'
            }`}
          >
            <div className="truncate">{t.message}</div>
            <button
              aria-label="dismiss"
              onClick={() => remove(t.id)}
              className="ml-3 text-sm opacity-90 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export default ToastProvider;
