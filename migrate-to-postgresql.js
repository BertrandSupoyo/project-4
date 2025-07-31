const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');

const prisma = new PrismaClient();

// Konfigurasi MySQL (source database)
const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // sesuaikan dengan password MySQL Anda
  database: 'substation_monitoring',
  port: 3306
};

async function migrateToPostgreSQL() {
  try {
    console.log('🔄 Starting migration from MySQL to PostgreSQL...');

    // Connect ke MySQL
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL');

    // Test PostgreSQL connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connected to PostgreSQL');

    // Migrate substations
    console.log('📦 Migrating substations...');
    const [substations] = await mysqlConnection.execute('SELECT * FROM substations');
    
    for (const substation of substations) {
      await prisma.substation.upsert({
        where: { id: substation.id },
        update: {
          no: substation.no,
          ulp: substation.ulp,
          noGardu: substation.noGardu,
          namaLokasiGardu: substation.namaLokasiGardu,
          jenis: substation.jenis,
          merek: substation.merek,
          daya: substation.daya,
          tahun: substation.tahun,
          phasa: substation.phasa,
          tap_trafo_max_tap: substation.tap_trafo_max_tap,
          penyulang: substation.penyulang,
          arahSequence: substation.arahSequence,
          tanggal: new Date(substation.tanggal),
          status: substation.status,
          lastUpdate: new Date(substation.lastUpdate),
          is_active: substation.is_active,
          ugb: substation.ugb,
          latitude: substation.latitude,
          longitude: substation.longitude
        },
        create: {
          id: substation.id,
          no: substation.no,
          ulp: substation.ulp,
          noGardu: substation.noGardu,
          namaLokasiGardu: substation.namaLokasiGardu,
          jenis: substation.jenis,
          merek: substation.merek,
          daya: substation.daya,
          tahun: substation.tahun,
          phasa: substation.phasa,
          tap_trafo_max_tap: substation.tap_trafo_max_tap,
          penyulang: substation.penyulang,
          arahSequence: substation.arahSequence,
          tanggal: new Date(substation.tanggal),
          status: substation.status,
          lastUpdate: new Date(substation.lastUpdate),
          is_active: substation.is_active,
          ugb: substation.ugb,
          latitude: substation.latitude,
          longitude: substation.longitude
        }
      });
    }
    console.log(`✅ Migrated ${substations.length} substations`);

    // Migrate measurements_siang
    console.log('📦 Migrating measurements_siang...');
    const [measurementsSiang] = await mysqlConnection.execute('SELECT * FROM measurements_siang');
    
    for (const measurement of measurementsSiang) {
      await prisma.measurementSiang.upsert({
        where: { 
          substationId_month_row_name: {
            substationId: measurement.substationId,
            month: measurement.month,
            row_name: measurement.row_name
          }
        },
        update: {
          r: measurement.r,
          s: measurement.s,
          t: measurement.t,
          n: measurement.n,
          rn: measurement.rn,
          sn: measurement.sn,
          tn: measurement.tn,
          pp: measurement.pp,
          pn: measurement.pn,
          rata2: measurement.rata2,
          kva: measurement.kva,
          persen: measurement.persen,
          unbalanced: measurement.unbalanced,
          lastUpdate: new Date(measurement.lastUpdate)
        },
        create: {
          substationId: measurement.substationId,
          month: measurement.month,
          r: measurement.r,
          s: measurement.s,
          t: measurement.t,
          n: measurement.n,
          rn: measurement.rn,
          sn: measurement.sn,
          tn: measurement.tn,
          pp: measurement.pp,
          pn: measurement.pn,
          row_name: measurement.row_name,
          rata2: measurement.rata2,
          kva: measurement.kva,
          persen: measurement.persen,
          unbalanced: measurement.unbalanced,
          lastUpdate: new Date(measurement.lastUpdate)
        }
      });
    }
    console.log(`✅ Migrated ${measurementsSiang.length} siang measurements`);

    // Migrate measurements_malam
    console.log('📦 Migrating measurements_malam...');
    const [measurementsMalam] = await mysqlConnection.execute('SELECT * FROM measurements_malam');
    
    for (const measurement of measurementsMalam) {
      await prisma.measurementMalam.upsert({
        where: { 
          substationId_month_row_name: {
            substationId: measurement.substationId,
            month: measurement.month,
            row_name: measurement.row_name
          }
        },
        update: {
          r: measurement.r,
          s: measurement.s,
          t: measurement.t,
          n: measurement.n,
          rn: measurement.rn,
          sn: measurement.sn,
          tn: measurement.tn,
          pp: measurement.pp,
          pn: measurement.pn,
          rata2: measurement.rata2,
          kva: measurement.kva,
          persen: measurement.persen,
          unbalanced: measurement.unbalanced,
          lastUpdate: new Date(measurement.lastUpdate)
        },
        create: {
          substationId: measurement.substationId,
          month: measurement.month,
          r: measurement.r,
          s: measurement.s,
          t: measurement.t,
          n: measurement.n,
          rn: measurement.rn,
          sn: measurement.sn,
          tn: measurement.tn,
          pp: measurement.pp,
          pn: measurement.pn,
          row_name: measurement.row_name,
          rata2: measurement.rata2,
          kva: measurement.kva,
          persen: measurement.persen,
          unbalanced: measurement.unbalanced,
          lastUpdate: new Date(measurement.lastUpdate)
        }
      });
    }
    console.log(`✅ Migrated ${measurementsMalam.length} malam measurements`);

    // Migrate admin_users
    console.log('📦 Migrating admin_users...');
    const [adminUsers] = await mysqlConnection.execute('SELECT * FROM admin_users');
    
    for (const user of adminUsers) {
      await prisma.adminUser.upsert({
        where: { username: user.username },
        update: {
          password_hash: user.password_hash,
          role: user.role,
          created_at: new Date(user.created_at)
        },
        create: {
          username: user.username,
          password_hash: user.password_hash,
          role: user.role,
          created_at: new Date(user.created_at)
        }
      });
    }
    console.log(`✅ Migrated ${adminUsers.length} admin users`);

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mysqlConnection?.end();
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToPostgreSQL()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToPostgreSQL }; 