const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateAddNameField() {
  try {
    console.log('🔄 Starting migration to add name field to admin_users table...');
    
    // Check if the name column already exists
    const columnExists = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_users' 
      AND column_name = 'name'
    `;
    
    if (columnExists.length > 0) {
      console.log('✅ Name column already exists, skipping migration');
      return;
    }
    
    // Add the name column
    await prisma.$queryRaw`
      ALTER TABLE admin_users 
      ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT ''
    `;
    
    console.log('✅ Successfully added name column to admin_users table');
    
    // Update existing records to use username as name if name is empty
    await prisma.$queryRaw`
      UPDATE admin_users 
      SET name = username 
      WHERE name = '' OR name IS NULL
    `;
    
    console.log('✅ Updated existing records with username as name');
    
    // List all users to verify
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        created_at: true
      }
    });
    
    console.log('📋 Current users after migration:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Name: ${user.name}, Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateAddNameField()
    .then(() => {
      console.log('🎉 Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateAddNameField };
