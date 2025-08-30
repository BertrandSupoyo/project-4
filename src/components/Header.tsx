import React from 'react';
//import { Zap, Bell, Settings, User } from 'lucide-react';
//import { Button } from './ui/Button';

export const Header: React.FC = () => {
  return (
    <header className="bg-blue-700 text-white py-4 mb-6">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold">PowerGrid Monitor</h1>
      </div>
    </header>
  );
};