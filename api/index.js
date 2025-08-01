const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
let prisma;

// Initialize Prisma Client
async function initPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
    }
  }
  return prisma;
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:3000',
    'https://project-4-vyl4.vercel.app',
    'https://project-4.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const db = await initPrisma();
    await db.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const db = await initPrisma();
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username, password: password ? '***' : 'undefined' });
    
    const user = await db.adminUser.findUnique({
      where: { username },
    });

    console.log('User found:', user ? { id: user.id, username: user.username, role: user.role } : 'null');

    if (!user || user.password_hash !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        token: 'admin_token',
      },
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message
    });
  }
});

// Substations endpoints
app.get('/api/substations', async (req, res) => {
  try {
    const db = await initPrisma();
    const { limit = 100, page = 1, search, status, ulp, jenis } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { namaLokasiGardu: { contains: search, mode: 'insensitive' } },
        { ulp: { contains: search, mode: 'insensitive' } },
        { noGardu: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) where.status = status;
    if (ulp) where.ulp = ulp;
    if (jenis) where.jenis = jenis;

    const substations = await db.substation.findMany({
      where,
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: { no: 'asc' }
    });

    res.json({
      success: true,
      data: substations
    });
  } catch (err) {
    console.error('Substations error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const db = await initPrisma();
    const totalSubstations = await db.substation.count();
    const activeSubstations = await db.substation.count({
      where: { is_active: 1 }
    });
    const ugbActive = await db.substation.count({
      where: { ugb: 1 }
    });

    res.json({
      success: true,
      data: {
        totalSubstations,
        activeSubstations,
        inactiveSubstations: totalSubstations - activeSubstations,
        ugbActive,
        criticalIssues: 0,
        monthlyMeasurements: 0
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Export for Vercel
module.exports = app; 