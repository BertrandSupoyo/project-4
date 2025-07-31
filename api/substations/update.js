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

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Substation ID is required'
      });
    }

    // Remove fields that shouldn't be updated
    delete updateData.measurements_siang;
    delete updateData.measurements_malam;

    const updatedSubstation = await prisma.substation.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      data: updatedSubstation
    });
  } catch (error) {
    console.error('Update substation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 