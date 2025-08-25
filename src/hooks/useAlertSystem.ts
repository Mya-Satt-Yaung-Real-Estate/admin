import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ActionAlertProps } from '../components/ui/ActionAlert';

export interface UseAlertSystemReturn {
  alert: ActionAlertProps;
  showSuccess: (message: string, autoHide?: boolean) => void;
  showError: (message: string, autoHide?: boolean) => void;
  clearAlert: () => void;
}

export const useAlertSystem = (autoHideDelay: number = 5000): UseAlertSystemReturn => {
  const [alert, setAlert] = useState<ActionAlertProps>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const clearAlert = useCallback(() => {
    setAlert({});
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showSuccess = useCallback((message: string, autoHide: boolean = true) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setAlert({
      success: {
        show: true,
        message,
      },
    });

    // Auto-hide after delay if enabled
    if (autoHide) {
      timeoutRef.current = setTimeout(() => {
        clearAlert();
      }, autoHideDelay);
    }
  }, [autoHideDelay, clearAlert]);

  const showError = useCallback((message: string, autoHide: boolean = true) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setAlert({
      error: {
        show: true,
        message,
      },
    });

    // Auto-hide after delay if enabled
    if (autoHide) {
      timeoutRef.current = setTimeout(() => {
        clearAlert();
      }, autoHideDelay);
    }
  }, [autoHideDelay, clearAlert]);

  // Handle URL parameters for success/error messages
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const successMessage = searchParams.get('success');
    const errorMessage = searchParams.get('error');
    
    if (successMessage) {
      showSuccess(decodeURIComponent(successMessage), true);
      // Clear the URL parameter
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('success');
      navigate(location.pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''), { replace: true });
    }
    
    if (errorMessage) {
      showError(decodeURIComponent(errorMessage), true);
      // Clear the URL parameter
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('error');
      navigate(location.pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''), { replace: true });
    }
  }, [location.search, showSuccess, showError, navigate, location.pathname]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    alert,
    showSuccess,
    showError,
    clearAlert,
  };
};
