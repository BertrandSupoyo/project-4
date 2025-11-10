import { useState, useEffect, useRef } from 'react';
import { User, AuthState } from '../types';

// ⏱️ KONFIGURASI SESSION TIMEOUT (dalam milidetik)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 menit
const WARNING_TIME = 5 * 60 * 1000; // Warning 5 menit sebelum logout
const INACTIVITY_CHECK_INTERVAL = 1000; // Check setiap 1 detik

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  // 🔧 STATE BARU UNTUK SESSION TIMEOUT
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(0);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // 🔧 REFS UNTUK TIMER
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const activityListenersAddedRef = useRef<boolean>(false);

  // 🔧 FUNCTION: START SESSION TIMER
  const startSessionTimer = () => {
    // Clear semua timer yang ada
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setShowSessionWarning(false);
    setSessionTimeRemaining(SESSION_TIMEOUT);
    lastActivityRef.current = Date.now();

    // ⚠️ TIMER UNTUK TAMPILKAN WARNING
    warningTimeoutRef.current = setTimeout(() => {
      setShowSessionWarning(true);
      console.warn('⚠️ Session akan berakhir dalam 5 menit');
    }, SESSION_TIMEOUT - WARNING_TIME);

    // 🔴 TIMER UNTUK LOGOUT OTOMATIS
    sessionTimeoutRef.current = setTimeout(() => {
      console.log('⏱️ Session timeout - melakukan logout otomatis');
      logoutDueToTimeout();
    }, SESSION_TIMEOUT);

    // 📊 COUNTDOWN TIMER (update setiap detik)
    countdownIntervalRef.current = setInterval(() => {
      setSessionTimeRemaining(prev => Math.max(0, prev - 1000));
    }, 1000);

    // 🕐 TIMER UNTUK DETEKSI INACTIVITY
    inactivityTimerRef.current = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        console.log('⏱️ Inactivity timeout');
        logoutDueToTimeout();
      }
    }, SESSION_TIMEOUT);
  };

  // 🔧 FUNCTION: STOP SESSION TIMER
  const stopSessionTimer = () => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setShowSessionWarning(false);
    setSessionTimeRemaining(0);
  };

  // 🔧 FUNCTION: LOGOUT KARENA TIMEOUT
  const logoutDueToTimeout = () => {
    stopSessionTimer();
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.setItem('sessionTimeout', 'true'); // Flag untuk menampilkan notifikasi
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  // 🔧 FUNCTION: RESET ACTIVITY TIMER
  const resetActivityTimer = () => {
    lastActivityRef.current = Date.now();
    setShowSessionWarning(false);
    startSessionTimer();
  };

  // 🔧 FUNCTION: EXTEND SESSION (User click "Continue")
  const extendSession = () => {
    resetActivityTimer();
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    const userData = sessionStorage.getItem('admin_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });
        // ✅ START SESSION TIMER KETIKA LOGIN
        startSessionTimer();
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }

    // Cleanup on unmount
    return () => {
      stopSessionTimer();
    };
  }, []);

  // 🔧 DETECT USER ACTIVITY
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const handleUserActivity = () => {
      if (showSessionWarning) {
        // Jangan reset timer jika warning sudah muncul
        return;
      }
      resetActivityTimer();
    };

    // Tambahkan event listeners hanya sekali
    if (!activityListenersAddedRef.current) {
      document.addEventListener('click', handleUserActivity);
      document.addEventListener('keypress', handleUserActivity);
      document.addEventListener('mousemove', handleUserActivity);
      document.addEventListener('scroll', handleUserActivity);
      activityListenersAddedRef.current = true;
    }

    return () => {
      // Cleanup dilakukan di logout, bukan di sini
    };
  }, [authState.isAuthenticated, showSessionWarning]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.success && data.data) {
        const { token, user } = data.data;

        // Store in localStorage
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
        localStorage.removeItem('sessionTimeout'); // Clear timeout flag

        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });

        // ✅ START SESSION TIMER SETELAH LOGIN
        startSessionTimer();

        return { success: true };
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const loginViewer = () => {
    const viewerUser: User = {
      id: 'viewer',
      username: 'viewer',
      role: 'viewer',
      name: 'Viewer'
    };

    localStorage.setItem('admin_token', 'viewer_token');
    localStorage.setItem('admin_user', JSON.stringify(viewerUser));
    localStorage.removeItem('sessionTimeout');

    setAuthState({
      user: viewerUser,
      isAuthenticated: true,
      loading: false,
    });

    // ✅ START SESSION TIMER
    startSessionTimer();
  };

  const loginPetugas = () => {
    const petugasUser: User = {
      id: 'petugas',
      username: 'petugas',
      role: 'petugas',
      name: 'Petugas Lapangan'
    };

    localStorage.setItem('admin_token', 'petugas_token');
    localStorage.setItem('admin_user', JSON.stringify(petugasUser));
    localStorage.removeItem('sessionTimeout');

    setAuthState({
      user: petugasUser,
      isAuthenticated: true,
      loading: false,
    });

    // ✅ START SESSION TIMER
    startSessionTimer();
  };

  const logout = () => {
    stopSessionTimer();
    
    // Remove event listeners
    if (activityListenersAddedRef.current) {
      document.removeEventListener('click', () => {});
      document.removeEventListener('keypress', () => {});
      document.removeEventListener('mousemove', () => {});
      document.removeEventListener('scroll', () => {});
      activityListenersAddedRef.current = false;
    }

    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('sessionTimeout');
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const checkAuth = (): boolean => {
    const token = localStorage.getItem('admin_token');
    return !!token;
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    login,
    loginViewer,
    loginPetugas,
    logout,
    checkAuth,
    // 🔧 RETURN NILAI BARU UNTUK SESSION
    sessionTimeRemaining,
    showSessionWarning,
    extendSession,
  };
};