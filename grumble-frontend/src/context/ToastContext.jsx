/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastContext.Provider");
  }
  return ctx;
};

export default ToastContext;
