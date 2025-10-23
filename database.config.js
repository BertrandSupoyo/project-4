// Database configuration
// Copy this file to .env.local and update with your database URL

export const DATABASE_CONFIG = {
  // PostgreSQL (Production)
  // DATABASE_URL: "postgresql://username:password@localhost:5432/substation_monitoring",
  
  // SQLite (Development)
  DATABASE_URL: "file:./dev.db",
  
  // MySQL (Alternative)
  // DATABASE_URL: "mysql://username:password@localhost:3306/substation_monitoring"
};

// Set environment variable if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DATABASE_CONFIG.DATABASE_URL;
}
