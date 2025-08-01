module.exports = async (req, res) => {
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
    const { username, password } = req.body;
    
    console.log('👤 Login attempt:', { username, password: password ? '***' : 'undefined' });

    // Simple hardcoded check for testing
    if (username === 'admin' && password === 'admin123') {
      console.log('✅ Login successful');
      res.json({
        success: true,
        data: {
          user: {
            id: 1,
            username: 'admin',
            role: 'admin',
          },
          token: 'admin_token',
        },
        message: 'Login successful',
      });
    } else {
      console.log('❌ Invalid credentials');
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }
  } catch (err) {
    console.error('💥 Login error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message
    });
  }
}; 