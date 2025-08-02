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
    
    console.log('📊 Received data type:', typeof substationsData);
    console.log('📊 Received data length:', Array.isArray(substationsData) ? substationsData.length : 'not array');
    
    if (!Array.isArray(substationsData)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format. Expected array of substations.'
      });
    }
    
    console.log(`📝 Importing ${substationsData.length} substations`);

    const createdSubstations = [];
    const errors = [];

    // Process sequentially
    for (let i = 0; i < substationsData.length; i++) {
      try {
        const data = substationsData[i];
        
        // Basic validation
        if (!data.namaLokasiGardu || !data.noGardu || !data.ulp) {
          console.warn(`⚠️ Skipping substation ${i + 1}: Missing required fields`);
          errors.push({
            index: i,
            error: 'Missing required fields'
          });
          continue;
        }
        
        console.log(`🔄 Processing substation ${i + 1}/${substationsData.length}: ${data.namaLokasiGardu}`);
        
        // Simple data cleaning with robust default handling
        const cleanData = {
          no: parseInt(data.no) || i + 1,
          ulp: String(data.ulp || '').trim() || 'Unknown',
          noGardu: String(data.noGardu || '').trim() || 'Unknown',
          namaLokasiGardu: String(data.namaLokasiGardu || '').trim() || 'Unknown',
          jenis: String(data.jenis || '').trim() || 'Unknown',
          merek: String(data.merek || '').trim() || 'Unknown',
          daya: String(data.daya || '').trim() || '0',
          tahun: (() => {
            const tahunValue = String(data.tahun || '').trim();
            // If empty, invalid, or not a number, return '0'
            if (!tahunValue || tahunValue === '' || isNaN(parseInt(tahunValue))) {
              return '0';
            }
            // If valid number, return it
            return tahunValue;
          })(),
          phasa: String(data.phasa || '').trim() || '0',
          tap_trafo_max_tap: String(data.tap_trafo_max_tap || '').trim() || '0',
          penyulang: String(data.penyulang || '').trim() || 'Unknown',
          arahSequence: String(data.arahSequence || '').trim() || 'Unknown',
          tanggal: (() => {
            // Handle tanggal validation and default to current date if invalid
            if (data.tanggal) {
              const d = new Date(data.tanggal);
              if (!isNaN(d.getTime())) {
                return d;
              }
            }
            // Return current date as default
            return new Date();
          })(),
          status: data.status || 'normal',
          is_active: data.is_active || 1,
          ugb: data.ugb || 0,
          latitude: (() => {
            const lat = data.latitude;
            if (lat === null || lat === undefined || lat === '') return null;
            const parsed = parseFloat(lat);
            return isNaN(parsed) ? null : parsed;
          })(),
          longitude: (() => {
            const lng = data.longitude;
            if (lng === null || lng === undefined || lng === '') return null;
            const parsed = parseFloat(lng);
            return isNaN(parsed) ? null : parsed;
          })()
        };
        
        // Create substation
        const newSubstation = await db.substation.create({
          data: cleanData
        });

        console.log(`✅ Created substation: ${newSubstation.id} - ${newSubstation.namaLokasiGardu}`);

        // Process measurements
        const month = new Date(cleanData.tanggal).toISOString().slice(0, 7);
        
        // Process siang measurements
        if (data.measurements_siang && Array.isArray(data.measurements_siang) && data.measurements_siang.length > 0) {
          const siangMeasurements = data.measurements_siang.map(measurement => ({
            substationId: newSubstation.id,
            row_name: String(measurement.row_name || 'induk').toLowerCase(),
            month: month,
            r: (() => {
              const val = parseFloat(measurement.r);
              return isNaN(val) ? 0 : val;
            })(),
            s: (() => {
              const val = parseFloat(measurement.s);
              return isNaN(val) ? 0 : val;
            })(),
            t: (() => {
              const val = parseFloat(measurement.t);
              return isNaN(val) ? 0 : val;
            })(),
            n: (() => {
              const val = parseFloat(measurement.n);
              return isNaN(val) ? 0 : val;
            })(),
            rn: (() => {
              const val = parseFloat(measurement.rn);
              return isNaN(val) ? 0 : val;
            })(),
            sn: (() => {
              const val = parseFloat(measurement.sn);
              return isNaN(val) ? 0 : val;
            })(),
            tn: (() => {
              const val = parseFloat(measurement.tn);
              return isNaN(val) ? 0 : val;
            })(),
            pp: (() => {
              const val = parseFloat(measurement.pp);
              return isNaN(val) ? 0 : val;
            })(),
            pn: (() => {
              const val = parseFloat(measurement.pn);
              return isNaN(val) ? 0 : val;
            })(),
            rata2: (() => {
              const val = parseFloat(measurement.rata2);
              return isNaN(val) ? 0 : val;
            })(),
            kva: (() => {
              const val = parseFloat(measurement.kva);
              return isNaN(val) ? 0 : val;
            })(),
            persen: (() => {
              const val = parseFloat(measurement.persen);
              return isNaN(val) ? 0 : val;
            })(),
            unbalanced: (() => {
              const val = parseFloat(measurement.unbalanced);
              return isNaN(val) ? 0 : val;
            })(),
            lastUpdate: new Date()
          }));

          await db.measurementSiang.createMany({
            data: siangMeasurements
          });

          console.log(`✅ Created ${siangMeasurements.length} siang measurements`);
        }

        // Process malam measurements
        if (data.measurements_malam && Array.isArray(data.measurements_malam) && data.measurements_malam.length > 0) {
          const malamMeasurements = data.measurements_malam.map(measurement => ({
            substationId: newSubstation.id,
            row_name: String(measurement.row_name || 'induk').toLowerCase(),
            month: month,
            r: (() => {
              const val = parseFloat(measurement.r);
              return isNaN(val) ? 0 : val;
            })(),
            s: (() => {
              const val = parseFloat(measurement.s);
              return isNaN(val) ? 0 : val;
            })(),
            t: (() => {
              const val = parseFloat(measurement.t);
              return isNaN(val) ? 0 : val;
            })(),
            n: (() => {
              const val = parseFloat(measurement.n);
              return isNaN(val) ? 0 : val;
            })(),
            rn: (() => {
              const val = parseFloat(measurement.rn);
              return isNaN(val) ? 0 : val;
            })(),
            sn: (() => {
              const val = parseFloat(measurement.sn);
              return isNaN(val) ? 0 : val;
            })(),
            tn: (() => {
              const val = parseFloat(measurement.tn);
              return isNaN(val) ? 0 : val;
            })(),
            pp: (() => {
              const val = parseFloat(measurement.pp);
              return isNaN(val) ? 0 : val;
            })(),
            pn: (() => {
              const val = parseFloat(measurement.pn);
              return isNaN(val) ? 0 : val;
            })(),
            rata2: (() => {
              const val = parseFloat(measurement.rata2);
              return isNaN(val) ? 0 : val;
            })(),
            kva: (() => {
              const val = parseFloat(measurement.kva);
              return isNaN(val) ? 0 : val;
            })(),
            persen: (() => {
              const val = parseFloat(measurement.persen);
              return isNaN(val) ? 0 : val;
            })(),
            unbalanced: (() => {
              const val = parseFloat(measurement.unbalanced);
              return isNaN(val) ? 0 : val;
            })(),
            lastUpdate: new Date()
          }));

          await db.measurementMalam.createMany({
            data: malamMeasurements
          });

          console.log(`✅ Created ${malamMeasurements.length} malam measurements`);
        }

        // Create default measurements if none provided
        if ((!data.measurements_siang || data.measurements_siang.length === 0) && 
            (!data.measurements_malam || data.measurements_malam.length === 0)) {
          const rowNames = ['induk', '1', '2', '3', '4'];
          
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

          console.log(`✅ Created default measurements`);
        }

        createdSubstations.push(newSubstation);
        console.log(`✅ Completed substation ${i + 1}/${substationsData.length}`);
      } catch (error) {
        console.error(`❌ Error creating substation ${i + 1}:`, error);
        errors.push({
          index: i,
          error: error.message
        });
      }
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