import { useState, useCallback } from 'react';

/**
 * A custom hook for using the confirm dialog
 * 
 * @returns {Object} - The confirm dialog state and functions
 * @returns {boolean} - isOpen - Whether the dialog is open
 * @returns {Function} - confirm - Function to open the dialog and return a promise
 * @returns {Function} - handleClose - Function to close the dialog
 * @returns {Function} - handleConfirm - Function to confirm the dialog
 * @returns {Object} - dialogProps - The props for the dialog
 */
const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState({
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmButtonClass: 'bg-red-600 hover:bg-red-700'
  });
  const [resolveReject, setResolveReject] = useState([]);
  
  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (resolveReject[1]) {
      resolveReject[1](); // Call reject function
    }
  }, [resolveReject]);
  
  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveReject[0]) {
      resolveReject[0](); // Call resolve function
    }
  }, [resolveReject]);
  
  const confirm = useCallback((options = {}) => {
    return new Promise((resolve, reject) => {
      setDialogProps({
        ...dialogProps,
        ...options
      });
      setResolveReject([resolve, reject]);
      setIsOpen(true);
    });
  }, [dialogProps]);
  
  return {
    isOpen,
    confirm,
    handleClose,
    handleConfirm,
    dialogProps
  };
};

export default useConfirm;
