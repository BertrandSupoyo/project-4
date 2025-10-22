const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Check if admin_users table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
      ) as exists
    `;
    
    if (!tableExists[0]?.exists) {
      console.log('❌ admin_users table does not exist. Please run Prisma migration first.');
      console.log('Run: npx prisma migrate dev --name add_name_field');
      return;
    }
    
    // Check if name column exists
    const columnExists = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_users' 
      AND column_name = 'name'
    `;
    
    if (columnExists.length === 0) {
      console.log('🔄 Adding name column to admin_users table...');
      
      try {
        await prisma.$queryRaw`
          ALTER TABLE admin_users 
          ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT ''
        `;
        console.log('✅ Successfully added name column');
        
        // Update existing records
        await prisma.$queryRaw`
          UPDATE admin_users 
          SET name = username 
          WHERE name = '' OR name IS NULL
        `;
        console.log('✅ Updated existing records');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('✅ Name column already exists');
        } else {
          throw error;
        }
      }
    } else {
      console.log('✅ Name column already exists');
    }
    
    // Check if there are any admin users
    const adminUsers = await prisma.adminUser.findMany();
    console.log(`📊 Found ${adminUsers.length} existing admin users`);
    
    if (adminUsers.length === 0) {
      console.log('👤 Creating default admin user...');
      
      const defaultAdmin = await prisma.adminUser.create({
        data: {
          username: 'admin',
          password_hash: crypto.createHash('sha256').update('admin123').digest('hex'),
          name: 'Administrator',
          role: 'admin'
        }
      });
      
      console.log('✅ Default admin user created:', {
        username: defaultAdmin.username,
        name: defaultAdmin.name,
        role: defaultAdmin.role
      });
    }
    
    // List all users
    const allUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        created_at: true
      }
    });
    
    console.log('📋 All admin users:');
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Name: ${user.name}, Role: ${user.role}`);
    });
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
