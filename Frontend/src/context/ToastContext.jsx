import { createContext, useState, useCallback } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const add = useCallback(
    (message, { type = "info", duration = 4000 } = {}) => {
      const id = Date.now() + Math.random().toString(36).slice(2, 9);
      const t = { id, message, type };
      setToasts((s) => [t, ...s]);
      setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== id));
      }, duration);
      return id;
    },
    []
  );

  const remove = useCallback((id) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, add, remove }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastContext;
