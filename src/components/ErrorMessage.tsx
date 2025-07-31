import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  showRetry = true 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">Terjadi Kesalahan</h3>
      <p className="text-red-600 text-center mb-4">{message}</p>
      {showRetry && onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}; 