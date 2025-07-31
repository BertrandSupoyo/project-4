module.exports = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Simple API is working!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
}; 