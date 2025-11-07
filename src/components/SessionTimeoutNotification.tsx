// SessionTimeoutNotification.tsx
import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export const SessionTimeoutNotification: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasTimeout = localStorage.getItem('sessionTimeout');
    if (hasTimeout === 'true') {
      setShow(true);
      localStorage.removeItem('sessionTimeout');
      // Sembunyikan notifikasi setelah 5 detik
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md shadow-lg z-40">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-800">Session Expired</h3>
          <p className="text-sm text-red-700 mt-1">
            Session Anda telah berakhir karena tidak aktif. Silakan login kembali.
          </p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-red-600 hover:text-red-800 flex-shrink-0 ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};