// UI Component Types
export interface LoadingSpinnerProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
}

export interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export interface PageLoadingStateProps {
  title?: string;
  message?: string;
  showSpinner?: boolean;
  minHeight?: string | number;
  variant?: 'default' | 'centered' | 'minimal';
}

export interface PageErrorStateProps {
  error: any;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onLogin?: () => void;
  showRetryButton?: boolean;
  showLoginButton?: boolean;
  variant?: 'default' | 'centered' | 'minimal';
  minHeight?: string | number;
}

export interface PageEmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionButton?: {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  };
  secondaryActionButton?: {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  };
  variant?: 'default' | 'centered' | 'minimal';
  minHeight?: string | number;
  showIcon?: boolean;
} 