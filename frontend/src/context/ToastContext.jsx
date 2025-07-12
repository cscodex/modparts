import { createContext, useState, useContext, useCallback } from 'react';
import Toast from '../components/ui/Toast';

// Create the context
const ToastContext = createContext();

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const addToast = useCallback((message, type = TOAST_TYPES.INFO, duration = 3000) => {
    const id = Date.now();
    
    setToasts(prevToasts => [
      ...prevToasts,
      { id, message, type, duration }
    ]);
    
    // Automatically remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  }, []);

  // Remove a toast by id
  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Shorthand methods for different toast types
  const success = useCallback((message, duration) => 
    addToast(message, TOAST_TYPES.SUCCESS, duration), [addToast]);
  
  const error = useCallback((message, duration) => 
    addToast(message, TOAST_TYPES.ERROR, duration), [addToast]);
  
  const info = useCallback((message, duration) => 
    addToast(message, TOAST_TYPES.INFO, duration), [addToast]);
  
  const warning = useCallback((message, duration) => 
    addToast(message, TOAST_TYPES.WARNING, duration), [addToast]);

  // Value to be provided by the context
  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
