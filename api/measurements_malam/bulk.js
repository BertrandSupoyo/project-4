import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma;

// IDENTICAL: Same initialization as import API
async function initPrisma() {
    if (!prisma) {
        console.log('🔧 Menginisialisasi Prisma Client...');
        try {
            prisma = new PrismaClient().$extends(withAccelerate());
            await prisma.$connect();
            console.log('✅ Koneksi database berhasil');
        } catch (error) {
            console.error('❌ Koneksi database gagal:', error);
            throw error;
        }
    }
    return prisma;
}

// IDENTICAL: Same calculation function as import API
function calculateMeasurements(phaseR, phaseS, phaseT, neutralValue, rnValue, snValue, tnValue, ppCurrent, pnCurrent, powerRating) {
    try {
        const averageVoltage = (phaseR + phaseS + phaseT) / 3;
        const kvaCalculated = (averageVoltage * ppCurrent * 1.73) / 1000;
        const percentageLoad = powerRating ? (kvaCalculated / powerRating) * 100 : 0;
        
        // CONSISTENT: Use Excel formula (same as import)
        const unbalancedCalculated = averageVoltage !== 0
            ? (Math.abs((phaseR / averageVoltage) - 1) + Math.abs((phaseS / averageVoltage) - 1) + Math.abs((phaseT / averageVoltage) - 1)) * 100
            : 0;

        return { 
            rata2: Number(averageVoltage.toFixed(2)), 
            kva: Number(kvaCalculated.toFixed(2)), 
            persen: Number(percentageLoad.toFixed(2)), 
            unbalanced: Number(unbalancedCalculated.toFixed(2)) 
        };
    } catch (calcError) {
        console.warn('Calculation error:', calcError);
        return { rata2: 0, kva: 0, persen: 0, unbalanced: 0 };
    }
}

export default async function handler(req, res) {
    // CONSISTENT: Same CORS setup as import API
    const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'PATCH') {
        return res.status(405).json({ success: false, error: 'Metode tidak diizinkan' });
    }

    try {
        // IDENTICAL: Same database initialization as import
        const database = await initPrisma();
        const measurements = req.body;

        if (!Array.isArray(measurements)) {
            return res.status(400).json({ success: false, error: 'Request body must be an array' });
        }

        // OPTIMIZATION: Get all substations at once (better than original import)
        const substationIds = [...new Set(measurements.map(m => m.substationId))];
        const substations = await database.substation.findMany({
            where: { id: { in: substationIds } },
            select: { id: true, daya: true }
        });
        
        const substationMap = new Map(substations.map(sub => [sub.id, sub]));
        
        console.log(`📊 Processing ${measurements.length} malam measurements for ${substationIds.length} substations`);

        const updatedMeasurements = [];
        const processingErrors = [];

        // IDENTICAL: Same data processing pattern as import
        for (let index = 0; index < measurements.length; index++) {
            const measurementData = measurements[index];
            
            try {
                if (!measurementData.substationId || !measurementData.row_name || !measurementData.month) {
                    processingErrors.push({ 
                        index: index,
                        row: measurementData, 
                        error: 'Missing required fields: substationId, row_name, month' 
                    });
                    continue;
                }

                // CONSISTENT: Get substation data (same pattern as import)
                const substationRecord = substationMap.get(measurementData.substationId);
                if (!substationRecord) {
                    processingErrors.push({
                        index: index,
                        row: measurementData,
                        error: `Substation with ID ${measurementData.substationId} not found`
                    });
                    continue;
                }
                
                const powerRating = parseFloat(substationRecord.daya || 0);

                // IDENTICAL: Same variable extraction pattern as import
                const phaseRValue = Number(measurementData.r) || 0;
                const phaseSValue = Number(measurementData.s) || 0;
                const phaseTValue = Number(measurementData.t) || 0;
                const neutralValue = Number(measurementData.n) || 0;
                const rnValue = Number(measurementData.rn) || 0;
                const snValue = Number(measurementData.sn) || 0;
                const tnValue = Number(measurementData.tn) || 0;
                const ppCurrentValue = Number(measurementData.pp) || 0;
                const pnCurrentValue = Number(measurementData.pn) || 0;
                
                // IDENTICAL: Same calculation call as import
                const calculationResults = calculateMeasurements(
                    phaseRValue, phaseSValue, phaseTValue, neutralValue, 
                    rnValue, snValue, tnValue, ppCurrentValue, pnCurrentValue, powerRating
                );

                // Find existing measurement (for malam specifically)
                const existingMeasurement = await database.measurementMalam.findFirst({
                    where: {
                        substationId: measurementData.substationId,
                        row_name: measurementData.row_name,
                        month: measurementData.month,
                    }
                });

                // IDENTICAL: Same data structure as import
                const measurementPayload = {
                    r: phaseRValue,
                    s: phaseSValue,
                    t: phaseTValue,
                    n: neutralValue,
                    rn: rnValue,
                    sn: snValue,
                    tn: tnValue,
                    pp: ppCurrentValue,
                    pn: pnCurrentValue,
                    rata2: calculationResults.rata2,
                    kva: calculationResults.kva,
                    persen: calculationResults.persen,
                    unbalanced: calculationResults.unbalanced,
                };

                let savedMeasurement;
                if (existingMeasurement) {
                    // Update existing
                    savedMeasurement = await database.measurementMalam.update({
                        where: { id: existingMeasurement.id },
                        data: {
                            ...measurementPayload,
                            lastUpdate: new Date(),
                        }
                    });
                } else {
                    // Create new
                    savedMeasurement = await database.measurementMalam.create({
                        data: {
                            substationId: measurementData.substationId,
                            row_name: measurementData.row_name,
                            month: measurementData.month,
                            ...measurementPayload,
                            lastUpdate: new Date(),
                        }
                    });
                }

                updatedMeasurements.push(savedMeasurement);
                
            } catch (processingError) {
                console.error(`❌ Error processing measurement ${index + 1}:`, processingError);
                processingErrors.push({ 
                    index: index,
                    row: measurementData, 
                    error: processingError.message || 'Unknown processing error' 
                });
            }
        }

        // CONSISTENT: Same response format as import
        if (updatedMeasurements.length > 0) {
            console.log(`✅ Bulk update berhasil. ${updatedMeasurements.length} measurements berhasil diupdate WITH CALCULATIONS.`);
            return res.status(200).json({
                success: true,
                message: `Bulk update selesai. ${updatedMeasurements.length} measurements berhasil diupdate dengan kalkulasi otomatis.`,
                data: { 
                    updatedCount: updatedMeasurements.length, 
                    errors: processingErrors.length > 0 ? processingErrors : [] 
                },
            });
        } else {
            return res.status(400).json({
                success: false,
                error: 'Tidak ada measurements yang berhasil diupdate',
                data: { errors: processingErrors }
            });
        }

    } catch (mainError) {
        console.error('💥 Terjadi kesalahan kritis:', mainError);
        return res.status(500).json({ 
            success: false, 
            error: 'Gagal memproses bulk update di server.', 
            details: mainError.message 
        });
    }
}