import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SecurityAlertProps {
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  description: string;
  icon?: React.ReactNode;
  onDismiss?: () => void;
}

const SecurityAlert: React.FC<SecurityAlertProps> = ({
  type,
  title,
  description,
  icon,
  onDismiss
}) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'info':
        return <Shield className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'success':
        return 'default';
      case 'info':
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      {getIcon()}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SecurityAlert;