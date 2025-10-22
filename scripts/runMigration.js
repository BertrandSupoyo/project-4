const { execSync } = require('child_process');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Running Prisma migration...');
    
    // Change to api directory where Prisma is configured
    const apiDir = path.join(__dirname, '..', 'api');
    
    console.log('📁 Changing to API directory:', apiDir);
    process.chdir(apiDir);
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Run migration
    console.log('🚀 Running database migration...');
    try {
      execSync('npx prisma migrate dev --name add_name_field', { stdio: 'inherit' });
    } catch (error) {
      if (error.message.includes('No pending migrations')) {
        console.log('✅ No pending migrations');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('🎉 Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
