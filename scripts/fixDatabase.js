const { setupDatabase } = require('./setupDatabase');
const { runMigration } = require('./runMigration');

async function fixDatabase() {
  try {
    console.log('🔧 Starting database fix process...');
    
    // Step 1: Run Prisma migration
    console.log('\n📦 Step 1: Running Prisma migration...');
    await runMigration();
    
    // Step 2: Setup database with proper schema
    console.log('\n🗄️ Step 2: Setting up database...');
    await setupDatabase();
    
    console.log('\n🎉 Database fix completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Deploy the updated code to Vercel');
    console.log('2. Test the admin login functionality');
    console.log('3. Create additional users through the admin dashboard');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
    throw error;
  }
}

// Run fix if called directly
if (require.main === module) {
  fixDatabase()
    .then(() => {
      console.log('✅ Database fix completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixDatabase };
