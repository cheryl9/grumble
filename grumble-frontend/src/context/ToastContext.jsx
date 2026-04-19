import { createContext, useContext } from "react";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    console.warn("useToast must be used within a ToastProvider");
    // Return a no-op function instead of throwing
    return { pushToast: () => {} };
  }
  return context;
}

export function ToastProvider({ children, pushToast }) {
  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
    </ToastContext.Provider>
  );
}
