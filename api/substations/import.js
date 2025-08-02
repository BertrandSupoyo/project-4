import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma;

async function initPrisma() {
  if (!prisma) {
    console.log('🔧 Initializing Prisma Client...');
    try {
      prisma = new PrismaClient().$extends(withAccelerate());
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
  return prisma;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Importing substations...');
    
    const db = await initPrisma();
    const substationsData = req.body;
    
    console.log(`📝 Importing ${substationsData.length} substations`);
    console.log('📊 Sample data structure:', JSON.stringify(substationsData[0], null, 2));

    const createdSubstations = [];
    const errors = [];

    // Process in smaller batches to avoid timeout
    const BATCH_SIZE = 5; // Process 5 substations at a time
    
    for (let batchStart = 0; batchStart < substationsData.length; batchStart += BATCH_SIZE) {
      const batch = substationsData.slice(batchStart, batchStart + BATCH_SIZE);
      console.log(`🔄 Processing batch ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(substationsData.length / BATCH_SIZE)}`);
      
      // Process batch in parallel
      const batchPromises = batch.map(async (data, batchIndex) => {
        const globalIndex = batchStart + batchIndex;
        try {
          // Create substation
          const newSubstation = await db.substation.create({
            data: {
              no: data.no,
              ulp: data.ulp,
              noGardu: data.noGardu,
              namaLokasiGardu: data.namaLokasiGardu,
              jenis: data.jenis,
              merek: data.merek,
              daya: data.daya,
              tahun: data.tahun,
              phasa: data.phasa,
              tap_trafo_max_tap: data.tap_trafo_max_tap,
              penyulang: data.penyulang,
              arahSequence: data.arahSequence,
              tanggal: data.tanggal ? new Date(data.tanggal) : new Date(),
              status: data.status || 'normal',
              is_active: data.is_active || 1,
              ugb: data.ugb || 0,
              latitude: data.latitude,
              longitude: data.longitude
            }
          });

          console.log(`✅ Created substation: ${newSubstation.id} - ${newSubstation.namaLokasiGardu}`);

          // Process measurements if provided
          const month = new Date(data.tanggal || new Date()).toISOString().slice(0, 7); // Format: YYYY-MM
          
          // Process siang measurements
          if (data.measurements_siang && Array.isArray(data.measurements_siang)) {
            const siangMeasurements = data.measurements_siang.map(measurement => ({
              substationId: newSubstation.id,
              row_name: measurement.row_name,
              month: month,
              r: measurement.r || 0,
              s: measurement.s || 0,
              t: measurement.t || 0,
              n: measurement.n || 0,
              rn: measurement.rn || 0,
              sn: measurement.sn || 0,
              tn: measurement.tn || 0,
              pp: measurement.pp || 0,
              pn: measurement.pn || 0,
              rata2: measurement.rata2 || 0,
              kva: measurement.kva || 0,
              persen: measurement.persen || 0,
              unbalanced: measurement.unbalanced || 0,
              lastUpdate: new Date()
            }));

            await db.measurementSiang.createMany({
              data: siangMeasurements
            });

            console.log(`✅ Created ${siangMeasurements.length} siang measurements for substation ${newSubstation.id}`);
          }

          // Process malam measurements
          if (data.measurements_malam && Array.isArray(data.measurements_malam)) {
            const malamMeasurements = data.measurements_malam.map(measurement => ({
              substationId: newSubstation.id,
              row_name: measurement.row_name,
              month: month,
              r: measurement.r || 0,
              s: measurement.s || 0,
              t: measurement.t || 0,
              n: measurement.n || 0,
              rn: measurement.rn || 0,
              sn: measurement.sn || 0,
              tn: measurement.tn || 0,
              pp: measurement.pp || 0,
              pn: measurement.pn || 0,
              rata2: measurement.rata2 || 0,
              kva: measurement.kva || 0,
              persen: measurement.persen || 0,
              unbalanced: measurement.unbalanced || 0,
              lastUpdate: new Date()
            }));

            await db.measurementMalam.createMany({
              data: malamMeasurements
            });

            console.log(`✅ Created ${malamMeasurements.length} malam measurements for substation ${newSubstation.id}`);
          }

          // If no measurements provided, create default empty measurements
          if ((!data.measurements_siang || data.measurements_siang.length === 0) && 
              (!data.measurements_malam || data.measurements_malam.length === 0)) {
            const rowNames = ['induk', '1', '2', '3', '4'];
            
            // Create default siang measurements
            const defaultSiangMeasurements = rowNames.map(rowName => ({
              substationId: newSubstation.id,
              row_name: rowName,
              month: month,
              r: 0, s: 0, t: 0, n: 0,
              rn: 0, sn: 0, tn: 0,
              pp: 0, pn: 0,
              rata2: 0, kva: 0, persen: 0, unbalanced: 0,
              lastUpdate: new Date()
            }));

            // Create default malam measurements
            const defaultMalamMeasurements = rowNames.map(rowName => ({
              substationId: newSubstation.id,
              row_name: rowName,
              month: month,
              r: 0, s: 0, t: 0, n: 0,
              rn: 0, sn: 0, tn: 0,
              pp: 0, pn: 0,
              rata2: 0, kva: 0, persen: 0, unbalanced: 0,
              lastUpdate: new Date()
            }));

            await Promise.all([
              db.measurementSiang.createMany({
                data: defaultSiangMeasurements
              }),
              db.measurementMalam.createMany({
                data: defaultMalamMeasurements
              })
            ]);

            console.log(`✅ Created default measurements for substation ${newSubstation.id}`);
          }

          return { success: true, substation: newSubstation };
        } catch (error) {
          console.error(`❌ Error creating substation ${globalIndex + 1}:`, error);
          return { 
            success: false, 
            error: error.message,
            data: data,
            index: globalIndex
          };
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Process results
      batchResults.forEach(result => {
        if (result.success) {
          createdSubstations.push(result.substation);
        } else {
          errors.push({
            index: result.index,
            data: result.data,
            error: result.error
          });
        }
      });

      console.log(`✅ Batch completed: ${batchResults.filter(r => r.success).length} success, ${batchResults.filter(r => !r.success).length} errors`);
    }

    console.log(`✅ Import completed: ${createdSubstations.length} created, ${errors.length} errors`);

    res.json({
      success: true,
      data: {
        count: createdSubstations.length,
        created: createdSubstations,
        errors: errors
      },
      message: `Imported ${createdSubstations.length} substations successfully`
    });
  } catch (err) {
    console.error('💥 Import error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message
    });
  }
} 