import React from 'react';
//import { Zap, Bell, Settings, User } from 'lucide-react';
//import { Button } from './ui/Button';

export const Header: React.FC = () => {
  return (
    <header className="bg-blue-700 text-white py-2 sm:py-3 md:py-4 mb-3 sm:mb-4 md:mb-6 overflow-hidden shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center px-3 md:px-4">
        <h1 className="text-base sm:text-lg md:text-2xl font-bold truncate tracking-tight">
          PowerGrid Monitor
        </h1>
      </div>
    </header>
  );
};