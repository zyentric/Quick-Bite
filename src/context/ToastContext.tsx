import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import CustomToast, { ToastConfig, ToastType } from '../components/CustomToast';

interface ToastOptions {
  type?: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextData {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextData>({
  showToast: () => {},
  hideToast: () => {},
});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [currentToast, setCurrentToast] = useState<ToastConfig | null>(null);

  const showToast = useCallback(({ type = 'info', title, message, duration = 4000 }: ToastOptions) => {
    const id = Date.now().toString() + Math.random().toString();
    setCurrentToast({ id, type, title, message, duration });
  }, []);

  const hideToast = useCallback(() => {
    setCurrentToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <CustomToast toast={currentToast} onDismiss={hideToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
