import { Client } from 'pg';

async function createDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'username', // Ganti dengan username PostgreSQL Anda
    password: 'password', // Ganti dengan password PostgreSQL Anda
    database: 'postgres' // Connect ke database default
  });

  try {
    console.log('🔧 Creating PostgreSQL database...');
    
    // Connect to PostgreSQL
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'substation_monitoring'"
    );
    
    if (result.rows.length > 0) {
      console.log('📋 Database "substation_monitoring" already exists');
    } else {
      // Create database
      await client.query('CREATE DATABASE substation_monitoring');
      console.log('✅ Database "substation_monitoring" created successfully');
    }
    
    // Create user if not exists
    try {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'substation_user') THEN
            CREATE ROLE substation_user WITH LOGIN PASSWORD 'substation_password';
          END IF;
        END
        $$;
      `);
      console.log('✅ User "substation_user" created successfully');
    } catch (error) {
      console.log('ℹ️ User "substation_user" already exists or error creating user');
    }
    
    // Grant privileges
    try {
      await client.query('GRANT ALL PRIVILEGES ON DATABASE substation_monitoring TO substation_user');
      console.log('✅ Privileges granted to substation_user');
    } catch (error) {
      console.log('ℹ️ Error granting privileges:', error.message);
    }
    
    console.log('\n📋 Database setup completed!');
    console.log('🔗 Update your DATABASE_URL to:');
    console.log('postgresql://substation_user:substation_password@localhost:5432/substation_monitoring');
    
  } catch (error) {
    console.error('❌ Database creation failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code
    });
    
    console.log('\n💡 Please check:');
    console.log('1. PostgreSQL is running');
    console.log('2. Username and password are correct');
    console.log('3. You have permission to create databases');
  } finally {
    await client.end();
  }
}

createDatabase();
