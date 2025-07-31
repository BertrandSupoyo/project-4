// Environment configuration
export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Monitoring Gardu Distribusi',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature flags
  enableRealTimeUpdates: import.meta.env.VITE_ENABLE_REALTIME_UPDATES === 'true',
  enableExport: import.meta.env.VITE_ENABLE_EXPORT === 'true',
  
  // Timeout configurations
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  refreshInterval: parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '30000'),
};

// Development helpers
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD; 