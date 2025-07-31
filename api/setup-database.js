const { setupDatabase } = require('../../setup-database');

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
    await setupDatabase();
    
    res.status(200).json({
      success: true,
      message: 'Database setup completed successfully'
    });
  } catch (error) {
    console.error('Setup database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database setup failed',
      details: error.message
    });
  }
}; 