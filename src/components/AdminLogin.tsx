import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Lock, User, Eye, EyeOff, Eye as ViewerIcon, Briefcase } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onViewerLogin: () => void;
  onPetugasLogin: (username: string, password: string) => Promise<void>; // Update untuk petugas login dengan database
  loading?: boolean;
  error?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ 
  onLogin, 
  onViewerLogin,
  onPetugasLogin, // Tambah prop
  loading = false, 
  error 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [petugasUsername, setPetugasUsername] = useState('');
  const [petugasPassword, setPetugasPassword] = useState('');
  const [showPetugasPassword, setShowPetugasPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      await onLogin(username, password);
    }
  };

  const handlePetugasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (petugasUsername.trim() && petugasPassword.trim()) {
      await onPetugasLogin(petugasUsername, petugasPassword);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 md:w-6 md:h-6 text-white" />
          </div>
          <h2 className="text-3xl md:text-2xl font-bold text-gray-900">Login</h2>
          <p className="text-base md:text-sm text-gray-600">Pilih cara login yang sesuai</p>
        </CardHeader>
        <CardContent>
          {/* Tombol Login sebagai Viewer */}
          <div className="mb-4">
            <Button
              onClick={onViewerLogin}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base"
              disabled={loading}
            >
              <ViewerIcon className="w-5 h-5 mr-2" />
              Login sebagai Viewer
            </Button>
            <p className="text-sm md:text-xs text-gray-500 mt-2 text-center">
              Masuk tanpa password untuk melihat data gardu distribusi
            </p>
          </div>

          {/* Form Login Petugas */}
          <div className="mb-6">
            <form onSubmit={handlePetugasSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username Petugas
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={petugasUsername}
                    onChange={(e) => setPetugasUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Username petugas"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Petugas
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPetugasPassword ? 'text' : 'password'}
                    value={petugasPassword}
                    onChange={(e) => setPetugasPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Password petugas"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPetugasPassword(!showPetugasPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPetugasPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 text-sm"
                disabled={loading || !petugasUsername.trim() || !petugasPassword.trim()}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                {loading ? 'Memproses...' : 'Login sebagai Petugas'}
              </Button>
            </form>
            <p className="text-sm md:text-xs text-gray-500 mt-2 text-center">
              Masuk sebagai petugas lapangan untuk mengelola data gardu
            </p>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Atau</span>
            </div>
          </div>

          {/* Form Login Admin */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-base md:text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-base md:text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-base"
              disabled={loading || !username.trim() || !password.trim()}
            >
              {loading ? 'Memproses...' : 'Login sebagai Admin'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
