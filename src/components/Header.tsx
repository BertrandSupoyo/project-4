import React from 'react';
//import { Zap, Bell, Settings, User } from 'lucide-react';
//import { Button } from './ui/Button';

export const Header: React.FC = () => {
  return (
    <header className="bg-blue-700 text-white py-3 md:py-4 mb-4 md:mb-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-3 md:px-4">
        <h1 className="text-lg md:text-2xl font-bold truncate">PowerGrid Monitor</h1>
      </div>
    </header>
  );
};