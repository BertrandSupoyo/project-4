const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createAdminUser(username, password, name, role = 'admin') {
  try {
    // Hash password (simple hash for demo, use bcrypt in production)
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    const adminUser = await prisma.adminUser.create({
      data: {
        username,
        password_hash: passwordHash,
        name: name || username,
        role,
      },
    });
    
    console.log('✅ Admin user created successfully:', {
      id: adminUser.id,
      username: adminUser.username,
      name: adminUser.name,
      role: adminUser.role,
      created_at: adminUser.created_at
    });
    
    return adminUser;
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Username already exists');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
    throw error;
  }
}

async function listAdminUsers() {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        created_at: true
      }
    });
    
    console.log('📋 Current admin users:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Name: ${user.name}, Role: ${user.role}, Created: ${user.created_at}`);
    });
    
    return users;
  } catch (error) {
    console.error('❌ Error listing admin users:', error);
    throw error;
  }
}

async function deleteAdminUser(username) {
  try {
    const deletedUser = await prisma.adminUser.delete({
      where: { username }
    });
    
    console.log('✅ Admin user deleted:', deletedUser.username);
    return deletedUser;
  } catch (error) {
    console.error('❌ Error deleting admin user:', error);
    throw error;
  }
}

// Main function
async function main() {
  const command = process.argv[2];
  const username = process.argv[3];
  const password = process.argv[4];
  const name = process.argv[5];
  
  try {
    switch (command) {
      case 'create':
        if (!username || !password) {
          console.log('Usage: node createAdmin.js create <username> <password> [name]');
          process.exit(1);
        }
        await createAdminUser(username, password, name);
        break;
        
      case 'list':
        await listAdminUsers();
        break;
        
      case 'delete':
        if (!username) {
          console.log('Usage: node createAdmin.js delete <username>');
          process.exit(1);
        }
        await deleteAdminUser(username);
        break;
        
      default:
        console.log('Available commands:');
        console.log('  create <username> <password> [name] - Create new admin user');
        console.log('  list                                 - List all admin users');
        console.log('  delete <username>                    - Delete admin user');
        break;
    }
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 