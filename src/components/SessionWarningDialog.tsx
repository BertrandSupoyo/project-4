// SessionWarningDialog.tsx
import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface SessionWarningDialogProps {
  isOpen: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

export const SessionWarningDialog: React.FC<SessionWarningDialogProps> = ({
  isOpen,
  timeRemaining,
  onExtend,
  onLogout,
}) => {
  if (!isOpen) return null;

  const minutes = Math.floor(timeRemaining / 1000 / 60);
  const seconds = Math.floor((timeRemaining / 1000) % 60);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">Session Akan Berakhir</h2>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Anda telah tidak aktif dalam jangka waktu yang lama. Session Anda akan berakhir dalam:
        </p>

        {/* Timer */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center text-yellow-700 mb-2">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Sisa Waktu</span>
          </div>
          <div className="text-4xl font-bold text-yellow-600">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition"
          >
            Logout Sekarang
          </button>
          <button
            onClick={onExtend}
            className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition"
          >
            Lanjutkan Session
          </button>
        </div>

        {/* Footer Info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Klik "Lanjutkan Session" untuk tetap login atau "Logout Sekarang" untuk keluar.
        </p>
      </div>
    </div>
  );
};