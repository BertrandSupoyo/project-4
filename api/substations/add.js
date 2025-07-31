const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const substationData = req.body;

    // Validate required fields
    if (!substationData.namaLokasiGardu || !substationData.noGardu) {
      return res.status(400).json({
        success: false,
        error: 'Nama lokasi gardu dan nomor gardu are required'
      });
    }

    // Set default values
    const newSubstation = await prisma.substation.create({
      data: {
        namaLokasiGardu: substationData.namaLokasiGardu,
        noGardu: substationData.noGardu,
        ulp: substationData.ulp || '',
        is_active: substationData.is_active !== undefined ? substationData.is_active : 1,
        ugb: substationData.ugb !== undefined ? substationData.ugb : 0,
        latitude: substationData.latitude || null,
        longitude: substationData.longitude || null,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    res.status(201).json({
      success: true,
      data: newSubstation
    });
  } catch (error) {
    console.error('Add substation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 