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
    
    if (!Array.isArray(substationsData)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format. Expected array of substations.'
      });
    }
    
    console.log(`📝 Importing ${substationsData.length} substations`);
    console.log('📊 Sample data structure:', JSON.stringify(substationsData[0], null, 2));

    const createdSubstations = [];
    const errors = [];

    // Process sequentially to avoid complexity
    for (let i = 0; i < substationsData.length; i++) {
      try {
        const data = substationsData[i];
        
        // Validate required fields
        if (!data.namaLokasiGardu || !data.noGardu || !data.ulp) {
          console.warn(`⚠️ Skipping substation ${i + 1}: Missing required fields`);
          errors.push({
            index: i,
            data: data,
            error: 'Missing required fields: namaLokasiGardu, noGardu, or ulp'
          });
          continue;
        }
        
        console.log(`🔄 Processing substation ${i + 1}/${substationsData.length}: ${data.namaLokasiGardu}`);
        
        // Clean and validate data - sesuai dengan format dari SubstationImportModal
        const cleanData = {
          no: parseInt(data.no) || i + 1,
          ulp: String(data.ulp || '').trim(),
          noGardu: String(data.noGardu || '').trim(),
          namaLokasiGardu: String(data.namaLokasiGardu || '').trim(),
          jenis: String(data.jenis || '').trim(),
          merek: String(data.merek || '').trim(),
          daya: String(data.daya || '').trim(),
          tahun: (() => {
            const tahunValue = String(data.tahun || '').trim();
            // Handle truncated or corrupted tahun values
            if (!tahunValue || tahunValue.length === 0) return '0';
            // If tahun is truncated (less than 4 digits), return '0'
            if (tahunValue.length < 4) return '0';
            // If tahun is valid (4 digits), return it
            if (/^\d{4}$/.test(tahunValue)) return tahunValue;
            // If tahun is longer than 4 digits, take first 4
            if (tahunValue.length > 4) return tahunValue.substring(0, 4);
            // Default fallback
            return '0';
          })(),
          phasa: String(data.phasa || '').trim(),
          tap_trafo_max_tap: (() => {
            const tapValue = String(data.tap_trafo_max_tap || '').trim();
            // Handle truncated or corrupted tap values
            if (!tapValue || tapValue.length === 0) return '0';
            // If it's a valid number, return it
            if (/^\d+$/.test(tapValue)) return tapValue;
            // If it's truncated, try to extract valid part
            const validPart = tapValue.match(/^\d+/);
            return validPart ? validPart[0] : '0';
          })(),
          penyulang: String(data.penyulang || '').trim(),
          arahSequence: String(data.arahSequence || '').trim(),
          tanggal: data.tanggal ? new Date(data.tanggal) : new Date(),
          status: data.status || 'normal',
          is_active: data.is_active || 1,
          ugb: data.ugb || 0,
          latitude: data.latitude ? parseFloat(data.latitude) : null,
          longitude: data.longitude ? parseFloat(data.longitude) : null
        };
        
        // Create substation
        const newSubstation = await db.substation.create({
          data: cleanData
        });

        console.log(`✅ Created substation: ${newSubstation.id} - ${newSubstation.namaLokasiGardu}`);

        // Process measurements if provided - sesuai dengan format dari SubstationImportModal
        const month = new Date(cleanData.tanggal).toISOString().slice(0, 7); // Format: YYYY-MM
        
        // Process siang measurements - frontend sudah mengirim array lengkap dengan 5 measurements
        if (data.measurements_siang && Array.isArray(data.measurements_siang) && data.measurements_siang.length > 0) {
          const siangMeasurements = data.measurements_siang.map(measurement => ({
            substationId: newSubstation.id,
            row_name: String(measurement.row_name || 'induk').toLowerCase(),
            month: month,
            r: parseFloat(measurement.r) || 0,
            s: parseFloat(measurement.s) || 0,
            t: parseFloat(measurement.t) || 0,
            n: parseFloat(measurement.n) || 0,
            rn: parseFloat(measurement.rn) || 0,
            sn: parseFloat(measurement.sn) || 0,
            tn: parseFloat(measurement.tn) || 0,
            pp: parseFloat(measurement.pp) || 0,
            pn: parseFloat(measurement.pn) || 0,
            rata2: parseFloat(measurement.rata2) || 0,
            kva: parseFloat(measurement.kva) || 0,
            persen: parseFloat(measurement.persen) || 0,
            unbalanced: parseFloat(measurement.unbalanced) || 0,
            lastUpdate: new Date()
          }));

          await db.measurementSiang.createMany({
            data: siangMeasurements
          });

          console.log(`✅ Created ${siangMeasurements.length} siang measurements for substation ${newSubstation.id}`);
        }

        // Process malam measurements - frontend sudah mengirim array lengkap dengan 5 measurements
        if (data.measurements_malam && Array.isArray(data.measurements_malam) && data.measurements_malam.length > 0) {
          const malamMeasurements = data.measurements_malam.map(measurement => ({
            substationId: newSubstation.id,
            row_name: String(measurement.row_name || 'induk').toLowerCase(),
            month: month,
            r: parseFloat(measurement.r) || 0,
            s: parseFloat(measurement.s) || 0,
            t: parseFloat(measurement.t) || 0,
            n: parseFloat(measurement.n) || 0,
            rn: parseFloat(measurement.rn) || 0,
            sn: parseFloat(measurement.sn) || 0,
            tn: parseFloat(measurement.tn) || 0,
            pp: parseFloat(measurement.pp) || 0,
            pn: parseFloat(measurement.pn) || 0,
            rata2: parseFloat(measurement.rata2) || 0,
            kva: parseFloat(measurement.kva) || 0,
            persen: parseFloat(measurement.persen) || 0,
            unbalanced: parseFloat(measurement.unbalanced) || 0,
            lastUpdate: new Date()
          }));

          await db.measurementMalam.createMany({
            data: malamMeasurements
          });

          console.log(`✅ Created ${malamMeasurements.length} malam measurements for substation ${newSubstation.id}`);
        }

        // Jika tidak ada measurements dari frontend, buat default (seharusnya tidak terjadi karena frontend selalu mengirim)
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

        createdSubstations.push(newSubstation);
        console.log(`✅ Completed substation ${i + 1}/${substationsData.length}:`, newSubstation.id);
      } catch (error) {
        console.error(`❌ Error creating substation ${i + 1}:`, error);
        errors.push({
          index: i,
          data: substationsData[i],
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