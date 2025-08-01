const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
    });
  }

  try {
    // Simple token validation (you can use JWT here)
    if (token !== 'admin_token') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the React app (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

// Initialize Prisma Client with error handling
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
} catch (error) {
  console.error('❌ Failed to initialize Prisma Client:', error);
  console.error('This usually means Prisma Client was not generated properly.');
  console.error('Please ensure prisma generate is run during build.');
  
  // Try to regenerate Prisma Client
  const { execSync } = require('child_process');
  try {
    console.log('🔄 Attempting to regenerate Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  } catch (regenerateError) {
    console.error('❌ Failed to regenerate Prisma Client:', regenerateError);
    console.error('Please check your DATABASE_URL and schema.prisma configuration.');
    process.exit(1);
  }
}

// Test database connection with better error handling
let isDatabaseConnected = false;
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
    isDatabaseConnected = true;
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    console.error('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    isDatabaseConnected = false;
    // Don't exit, let the app continue with fallback handling
  });

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

// Rate limiting - lebih longgar untuk development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174', 
  'http://localhost:5175', 
  'http://localhost:3000',
  'https://project-4-vyl4.vercel.app', // Update dengan domain Vercel kamu
  'https://*.vercel.app'                // Allow all Vercel subdomains
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Tambahkan parser text/plain agar import tetap bisa walau Content-Type salah
app.use(express.text({ type: 'text/plain' }));
app.use((req, res, next) => {
  if (
    req.headers['content-type'] &&
    req.headers['content-type'].includes('text/plain') &&
    typeof req.body === 'string' &&
    req.body.trim().startsWith('[')
  ) {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      req.body = [];
    }
  }
  next();
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error dengan detail yang lebih lengkap
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Track error untuk monitoring
  if (!global.errorCount) global.errorCount = 0;
  global.errorCount++;

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString(),
    errorId: Date.now(), // Untuk tracking
  });
};

// Cache middleware for GET requests
const cache = new Map();
const cacheMiddleware = (duration = 300) => (req, res, next) => {
  if (req.method !== 'GET') return next();
  
  const key = req.originalUrl;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < duration * 1000) {
    return res.json(cached.data);
}
  
  const originalSend = res.json;
  res.json = function(data) {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
    originalSend.call(this, data);
  };
  next();
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    let dbStatus = 'disconnected';
    if (isDatabaseConnected) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
      } catch (dbError) {
        dbStatus = 'error';
        console.error('Database health check failed:', dbError);
      }
    }

    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbStatus,
      prismaReady: !!prisma.substation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
}
});

// Monitoring endpoint
app.get('/api/monitoring', (req, res) => {
  res.json({
    success: true,
    data: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: isDatabaseConnected,
      prismaReady: !!prisma.substation,
      errorCount: global.errorCount || 0,
      timestamp: new Date().toISOString(),
    },
    message: 'System monitoring data',
  });
});

// GET /api/substations - with caching and pagination
app.get('/api/substations', cacheMiddleware(60), async (req, res, next) => {
  try {
    // Pastikan Prisma Client sudah siap
    if (!prisma || !prisma.substation) {
      console.error('Prisma Client not ready');
      return res.status(500).json({
        success: false,
        error: 'Database connection not ready',
        timestamp: new Date().toISOString(),
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    // Retry mechanism untuk database queries
    const retryQuery = async (queryFn, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await queryFn();
        } catch (error) {
          if (i === maxRetries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    };

    const [substations, total] = await Promise.all([
      retryQuery(() => prisma.substation.findMany({
        skip: offset,
        take: limit,
        include: {
          measurements_siang: true,
          measurements_malam: true,
        },
        orderBy: { no: 'asc' },
      })),
      retryQuery(() => prisma.substation.count()),
    ]);

    res.json({
      success: true,
      data: substations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      message: 'Substations retrieved successfully',
    });
  } catch (err) {
    console.error('Substations error:', err);
    // Return empty response instead of error
    res.json({
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
      },
      message: 'Substations retrieved with fallback values',
    });
  }
});

// GET /api/substations/:id - with caching
app.get('/api/substations/:id', cacheMiddleware(30), async (req, res, next) => {
  try {
    const substation = await prisma.substation.findUnique({
      where: { id: req.params.id },
      include: {
        measurements_siang: true,
        measurements_malam: true,
      },
    });

    if (!substation) {
      return res.status(404).json({
        success: false,
        error: 'Substation not found',
      });
    }

    res.json({
      success: true,
      data: substation,
      message: 'Substation retrieved successfully',
    });
  } catch (err) {
    next(err);
  }
});

// Tambah import untuk generateSubstationExcel
const { generateSubstationExcel } = require('./utils/generateSubstationExcel');

// GET /api/export/substation/:id - Export Excel custom UI
app.get('/api/export/substation/:id', async (req, res, next) => {
  try {
    const substation = await prisma.substation.findUnique({
      where: { id: req.params.id },
      include: {
        measurements_siang: true,
        measurements_malam: true,
      },
    });
    if (!substation) {
      return res.status(404).json({ success: false, error: 'Substation not found' });
    }
    // Panggil generateSubstationExcel (pastikan argumen sesuai)
    await generateSubstationExcel(
      substation,
      substation.measurements_siang || [],
      substation.measurements_malam || [],
      res
    );
    // Tidak perlu res.json, file sudah dikirim sebagai attachment
  } catch (err) {
    next(err);
  }
});

// Tambah import untuk generateRiwayatExcel
const { generateRiwayatExcel } = require('./utils/generateRiwayatExcel');

// GET /api/export/riwayat?month=YYYY-MM - Export Excel riwayat pengukuran
app.get('/api/export/riwayat', async (req, res, next) => {
  try {
    const { month } = req.query;
    // Ambil semua substation
    const substations = await prisma.substation.findMany({ orderBy: { no: 'asc' } });

    let data;
    let filename;
    if (month) {
      // Untuk setiap substation, ambil pengukuran siang & malam untuk bulan tsb
      data = await Promise.all(substations.map(async (sub) => {
        const siang = await prisma.measurementSiang.findMany({ where: { substationId: sub.id, month } });
        const malam = await prisma.measurementMalam.findMany({ where: { substationId: sub.id, month } });
        return { substation: sub, siang, malam };
      }));
      filename = `RiwayatPengukuran_${month}.xlsx`;
    } else {
      // Ambil semua pengukuran siang & malam untuk semua bulan
      data = await Promise.all(substations.map(async (sub) => {
        const siang = await prisma.measurementSiang.findMany({ where: { substationId: sub.id } });
        const malam = await prisma.measurementMalam.findMany({ where: { substationId: sub.id } });
        return { substation: sub, siang, malam };
      }));
      filename = 'RiwayatPengukuran_ALL.xlsx';
    }

    // Panggil generateRiwayatExcel
    await require('./utils/generateRiwayatExcel').generateRiwayatExcel(data, month || 'ALL', res, filename);
  } catch (err) {
    next(err);
  }
});

// Endpoint export riwayat custom (hanya data yang difilter frontend)
app.post('/api/export/riwayat/custom', async (req, res, next) => {
  try {
    const data = req.body; // array of substation/riwayat hasil filter frontend
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ success: false, message: 'No data provided for export.' });
    }
    // Panggil generateRiwayatExcel, gunakan 'CUSTOM' sebagai label bulan
    await require('./utils/generateRiwayatExcel').generateRiwayatExcel(data, 'CUSTOM', res, 'Riwayat_Filtered.xlsx');
    // File dikirim sebagai attachment oleh generateRiwayatExcel
  } catch (err) {
    console.error('ERROR export custom riwayat:', err);
    if (!res.headersSent) {
      res.status(500).send('Error generating custom Excel report.');
    }
  }
});

// Fungsi untuk parsing tanggal ke GMT+8
function parseToGmt8(dateStr) {
  if (!dateStr) return new Date();
  
  // Jika sudah ada offset atau Z, biarkan
  if (typeof dateStr === 'string' && dateStr.includes('T') && (dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr))) {
    return new Date(dateStr);
  }
  
  // Jika format 'YYYY-MM-DD', treat as local GMT+8
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T00:00:00+08:00');
  }
  
  // Jika format 'DD-MMM-YYYY' (seperti 25-apr-2025)
  if (typeof dateStr === 'string' && /^\d{1,2}-[a-zA-Z]{3}-\d{4}$/.test(dateStr)) {
    const months = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };
    
    const parts = dateStr.toLowerCase().split('-');
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      const date = new Date(year, month, day);
      return new Date(date.getTime() + (8 * 60 * 60 * 1000)); // GMT+8
    }
  }
  
  // Jika Date object atau string lain, fallback
  return new Date(dateStr);
}

// POST /api/substations - create new substation
app.post('/api/substations', async (req, res, next) => {
  try {
    const sub = req.body;
    console.log('DATA MASUK POST /api/substations:', JSON.stringify(sub, null, 2));
    
    const id = uuidv4();
    const now = new Date();
    const month = now.toISOString().slice(0, 7); // format YYYY-MM

    // Create substation with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create substation
      const substation = await tx.substation.create({
        data: {
          id,
          no: sub.no,
          ulp: sub.ulp,
          noGardu: sub.noGardu,
          namaLokasiGardu: sub.namaLokasiGardu,
          jenis: sub.jenis,
          merek: sub.merek,
          daya: sub.daya,
          tahun: sub.tahun,
          phasa: sub.phasa,
          tap_trafo_max_tap: sub.tap_trafo_max_tap,
          penyulang: sub.penyulang,
          arahSequence: sub.arahSequence,
          tanggal: sub.tanggal ? parseToGmt8(sub.tanggal) : new Date(),
          status: sub.status || 'normal',
          lastUpdate: now,
          ugb: sub.ugb !== undefined ? sub.ugb : 0, // Default UGB non-aktif
          latitude: sub.latitude !== undefined ? parseFloat(sub.latitude) : null,
          longitude: sub.longitude !== undefined ? parseFloat(sub.longitude) : null,
        },
      });

      // Create default measurements for siang and malam
    const rowNames = ['induk', '1', '2', '3', '4'];
      const measurementData = rowNames.map(row_name => ({
        substationId: id,
        month,
        r: 0, s: 0, t: 0, n: 0,
        rn: 0, sn: 0, tn: 0, pp: 0, pn: 0,
        row_name,
        rata2: 0, kva: 0, persen: 0, unbalanced: 0,
      }));

      // Perbaiki: gunakan measurementSiang dan measurementMalam
      await tx.measurementSiang.createMany({
        data: measurementData,
        skipDuplicates: true,
      });

      await tx.measurementMalam.createMany({
        data: measurementData,
        skipDuplicates: true,
      });

    // Update with frontend data if provided
    if (sub.measurements_siang && sub.measurements_siang.length > 0) {
      for (const m of sub.measurements_siang) {
        const safe = v => (v === undefined || v === null || v === '' ? 0 : v);
        await tx.measurementSiang.updateMany({
            where: {
              substationId: id,
              row_name: m.row_name,
              month: m.month,
            },
            data: {
              r: safe(m.r), s: safe(m.s), t: safe(m.t), n: safe(m.n),
              rn: safe(m.rn), sn: safe(m.sn), tn: safe(m.tn),
              pp: safe(m.pp), pn: safe(m.pn),
            },
          });
      }
    }

    if (sub.measurements_malam && sub.measurements_malam.length > 0) {
      for (const m of sub.measurements_malam) {
        const safe = v => (v === undefined || v === null || v === '' ? 0 : v);
        await tx.measurementMalam.updateMany({
            where: {
              substationId: id,
              row_name: m.row_name,
              month: m.month,
            },
            data: {
              r: safe(m.r), s: safe(m.s), t: safe(m.t), n: safe(m.n),
              rn: safe(m.rn), sn: safe(m.sn), tn: safe(m.tn),
              pp: safe(m.pp), pn: safe(m.pn),
            },
          });
      }
    }

      return substation;
    });

    // Clear cache for substations list
    cache.clear();

    const substationWithMeasurements = await prisma.substation.findUnique({
      where: { id },
      include: {
        measurements_siang: true,
        measurements_malam: true,
      },
    });

    res.status(201).json({
      success: true,
      data: substationWithMeasurements,
      message: 'Substation created successfully',
    });
  } catch (err) {
    console.error('ERROR saat menambah substation:', err);
    next(err);
  }
});

// POST /api/substations/import - bulk import from Excel
app.post('/api/substations/import', authenticateAdmin, async (req, res, next) => {
  console.log('IMPORT HEADERS:', req.headers);
  console.log('IMPORT PAYLOAD:', JSON.stringify(req.body, null, 2));
  try {
    let substations = req.body; // Expect an array of substation objects
    if (!Array.isArray(substations) || substations.length === 0) {
      return res.status(400).json({ success: false, message: 'No data provided or data is not an array.' });
    }

    // Normalisasi field tap_trafo_max_tap
    substations = substations.map(sub => {
      // Cek beberapa kemungkinan nama field dari frontend
      let tap_trafo_max_tap = sub.tap_trafo_max_tap || sub.taptrafomaxtap || sub.taptrafo_max_tap || '';
      // Jika masih tidak ada, coba dari header normalisasi
      if (!tap_trafo_max_tap && sub['taptrafomaxtap']) tap_trafo_max_tap = sub['taptrafomaxtap'];
      // Pastikan field tap_trafo_max_tap ada
      // --- PATCH TANGGAL GMT+8 ---
      const tanggal = sub.tanggal ? parseToGmt8(sub.tanggal) : new Date();
      return {
        ...sub,
        tap_trafo_max_tap: tap_trafo_max_tap,
        tanggal,
      };
    });

    const now = new Date();
    const month = now.toISOString().slice(0, 7);

    const createdSubstations = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const sub of substations) {
        const id = uuidv4();
        const dayaTrafo = parseFloat(sub.daya || '0');
        const newSubstation = await tx.substation.create({
          data: {
            id,
            no: parseInt(sub.no) || 0,
            ulp: sub.ulp || '',
            noGardu: sub.noGardu || '',
            namaLokasiGardu: sub.namaLokasiGardu || '',
            jenis: sub.jenis || '',
            merek: sub.merek || '',
            daya: String(sub.daya || '0'),
            tahun: String(sub.tahun || '0'),
            phasa: String(sub.phasa || '0'),
            tap_trafo_max_tap: String(sub.tap_trafo_max_tap || ''),
            penyulang: sub.penyulang || '',
            arahSequence: sub.arahSequence || '',
            tanggal: sub.tanggal ? new Date(sub.tanggal) : now,
            status: sub.status || 'normal',
            is_active: sub.is_active !== undefined ? parseInt(sub.is_active) : 1,
            ugb: sub.ugb !== undefined ? parseInt(sub.ugb) : 0,
            latitude: sub.latitude !== undefined ? parseFloat(sub.latitude) : null,
            longitude: sub.longitude !== undefined ? parseFloat(sub.longitude) : null,
            lastUpdate: now,
          },
        });

        // Handle data pengukuran siang jika ada
        if (sub.measurements_siang && Array.isArray(sub.measurements_siang)) {
          const siangData = sub.measurements_siang.map(measurement => {
            const r = Number(measurement.r) || 0;
            const s = Number(measurement.s) || 0;
            const t = Number(measurement.t) || 0;
            const n = Number(measurement.n) || 0;
            const pp = measurement.pp !== undefined ? Number(measurement.pp) : 0;
            const rn = measurement.rn !== undefined ? Number(measurement.rn) : r - n;
            const sn = measurement.sn !== undefined ? Number(measurement.sn) : s - n;
            const tn = measurement.tn !== undefined ? Number(measurement.tn) : t - n;
            const pn = measurement.pn !== undefined ? Number(measurement.pn) : 0;
            // Rumus baru sesuai permintaan user
            const rata2 = (r + s + t) / 3;
            // KVA pakai pp (P-P nilai), bukan pn
            const kva = (rata2 * pp * 1.73) / 1000;
            const persen = dayaTrafo ? (kva / dayaTrafo) * 100 : 0;
            // UNBALANCED: sesuai rumus Excel user
            // (ABS((r/rata2)-1)) + (ABS((s/rata2)-1)) + (ABS(t/rata2)-1)
            const unbalanced = rata2 !== 0
              ? (Math.abs((r / rata2) - 1) + Math.abs((s / rata2) - 1) + (Math.abs(t / rata2) - 1)) * 100
              : 0;
            return {
              substationId: id,
              month,
              row_name: measurement.row_name || 'induk',
              r, s, t, n,
              rn,
              sn,
              tn,
              pp,
              pn,
              rata2,
              kva,
              persen,
              unbalanced,
            };
          });
          
          await tx.measurementSiang.createMany({
            data: siangData,
            skipDuplicates: true,
          });
        } else {
          // Default measurement data jika tidak ada
          const rowNames = ['induk', '1', '2', '3', '4'];
          const measurementData = rowNames.map(row_name => ({
            substationId: id,
            month,
            row_name,
            r: 0, s: 0, t: 0, n: 0, rn: 0, sn: 0, tn: 0, pp: 0, pn: 0, rata2: 0, kva: 0, persen: 0, unbalanced: 0
          }));

          await tx.measurementSiang.createMany({
            data: measurementData,
            skipDuplicates: true,
          });
        }

        // Handle data pengukuran malam jika ada
        if (sub.measurements_malam && Array.isArray(sub.measurements_malam)) {
          const malamData = sub.measurements_malam.map(measurement => {
            const r = Number(measurement.r) || 0;
            const s = Number(measurement.s) || 0;
            const t = Number(measurement.t) || 0;
            const n = Number(measurement.n) || 0;
            const pp = measurement.pp !== undefined ? Number(measurement.pp) : 0;
            const rn = measurement.rn !== undefined ? Number(measurement.rn) : r - n;
            const sn = measurement.sn !== undefined ? Number(measurement.sn) : s - n;
            const tn = measurement.tn !== undefined ? Number(measurement.tn) : t - n;
            const pn = measurement.pn !== undefined ? Number(measurement.pn) : 0;
            // Rumus baru sesuai permintaan user
            const rata2 = (r + s + t) / 3;
            // KVA pakai pp (P-P nilai), bukan pn
            const kva = (rata2 * pp * 1.73) / 1000;
            const persen = dayaTrafo ? (kva / dayaTrafo) * 100 : 0;
            // UNBALANCED: sesuai rumus Excel user
            // (ABS((r/rata2)-1)) + (ABS((s/rata2)-1)) + (ABS(t/rata2)-1)
            const unbalanced = rata2 !== 0
              ? (Math.abs((r / rata2) - 1) + Math.abs((s / rata2) - 1) + (Math.abs(t / rata2) - 1)) * 100
              : 0;
            return {
              substationId: id,
              month,
              row_name: measurement.row_name || 'induk',
              r, s, t, n,
              rn,
              sn,
              tn,
              pp,
              pn,
              rata2,
              kva,
              persen,
              unbalanced,
            };
          });
          
          await tx.measurementMalam.createMany({
            data: malamData,
            skipDuplicates: true,
          });
        } else {
          // Default measurement data jika tidak ada
          const rowNames = ['induk', '1', '2', '3', '4'];
          const measurementData = rowNames.map(row_name => ({
            substationId: id,
            month,
            row_name,
            r: 0, s: 0, t: 0, n: 0, rn: 0, sn: 0, tn: 0, pp: 0, pn: 0, rata2: 0, kva: 0, persen: 0, unbalanced: 0
          }));

          await tx.measurementMalam.createMany({
            data: measurementData,
            skipDuplicates: true,
          });
        }
        
        results.push(newSubstation);
      }
      return results;
    });

    cache.clear();

    res.status(201).json({
      success: true,
      data: {
        count: createdSubstations.length,
        substations: createdSubstations,
      },
      message: `${createdSubstations.length} substations imported successfully.`,
    });
  } catch (err) {
    console.error('ERROR during bulk import:', err, JSON.stringify(req.body, null, 2));
    res.status(500).json({ success: false, error: err.message || 'Unknown error' });
    // next(err); // opsional, bisa dihapus agar error tidak dilempar ke error handler global
  }
});

// PUT /api/substations/:id - update substation (aktif/tidak aktif)
app.patch('/api/substations/:id', async (req, res, next) => {
  console.log('PATCH /api/substations/:id', req.params.id, req.body); // DEBUG LOG
  try {
    // Hanya izinkan field tertentu untuk diupdate
    const allowedFields = ['is_active', 'status', 'daya', 'lastUpdate', 'ugb', 'latitude', 'longitude', 'tanggal'];
    const dataToUpdate = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) dataToUpdate[key] = req.body[key];
    }
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }
    const updated = await prisma.substation.update({
      where: { id: req.params.id },
      data: dataToUpdate,
    });
    cache.clear();
    res.json({
      success: true,
      data: updated,
      message: 'Substation updated successfully',
    });
  } catch (err) {
    console.error('PATCH /api/substations/:id ERROR:', err); // Tambah log error detail
    next(err);
  }
});

// DELETE /api/substations/:id
app.delete('/api/substations/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const deleted = await prisma.substation.delete({
      where: { id: req.params.id },
    });

    // Clear cache
    cache.clear();

    res.json({
      success: true,
      message: 'Substation deleted successfully',
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/substations/:id/status - update status
app.patch('/api/substations/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const updated = await prisma.substation.update({
      where: { id: req.params.id },
      data: { 
        status,
        lastUpdate: new Date(),
      },
    });

    // Clear cache
    cache.clear();

    res.json({
      success: true,
      data: updated,
      message: 'Status updated successfully',
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/substations/:id/power - update daya
app.patch('/api/substations/:id/power', async (req, res, next) => {
  try {
    const { daya } = req.body;
    const substationId = req.params.id;
    
    const updated = await prisma.substation.update({
      where: { id: substationId },
      data: { 
        daya,
        lastUpdate: new Date(),
      },
    });

    // Update perhitungan persentase di measurements siang
    const measurementsSiang = await prisma.measurementSiang.findMany({
      where: { substationId }
    });

    for (const measurement of measurementsSiang) {
      const rata2 = (measurement.r + measurement.s + measurement.t) / 3;
      const kva = (rata2 * measurement.pp * 1.73) / 1000;
      const persen = daya ? (kva / daya) * 100 : 0;
      
      await prisma.measurementSiang.update({
        where: { id: measurement.id },
        data: { persen }
      });
    }

    // Update perhitungan persentase di measurements malam
    const measurementsMalam = await prisma.measurementMalam.findMany({
      where: { substationId }
    });

    for (const measurement of measurementsMalam) {
      const rata2 = (measurement.r + measurement.s + measurement.t) / 3;
      const kva = (rata2 * measurement.pp * 1.73) / 1000;
      const persen = daya ? (kva / daya) * 100 : 0;
      
      await prisma.measurementMalam.update({
        where: { id: measurement.id },
        data: { persen }
      });
    }

    // Clear cache
    cache.clear();

    res.json({
      success: true,
      data: updated,
      message: 'Power updated successfully and percentage recalculated',
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/measurements_siang/bulk - bulk update measurements siang
app.patch('/api/measurements_siang/bulk', async (req, res, next) => {
  try {
    const measurements = req.body;
    if (!Array.isArray(measurements) || measurements.length === 0) {
      return res.status(400).json({ success: false, message: 'No data provided.' });
    }
    const updatedMeasurements = [];
    const errors = [];
    for (const m of measurements) {
      try {
        if (!m.substationId || !m.row_name || !m.month) {
          errors.push({ row: m, error: 'Missing substationId, row_name, or month' });
          continue;
        }
        // Ambil daya substation
        const substation = await prisma.substation.findUnique({ where: { id: m.substationId } });
        const daya = parseFloat(substation?.daya || 0);
        // Hitung rumus
        const r = Number(m.r) || 0;
        const s = Number(m.s) || 0;
        const t = Number(m.t) || 0;
        const n = Number(m.n) || 0;
        const rn = Number(m.rn) || 0; // Ambil dari frontend
        const sn = Number(m.sn) || 0; // Ambil dari frontend
        const tn = Number(m.tn) || 0; // Ambil dari frontend
        const pp = Number(m.pp) || 0;
        const pn = Number(m.pn) || 0;
        const rata2 = (r + s + t) / 3;
        const kva = (rata2 * pp * 1.73) / 1000;
        const persen = daya ? (kva / daya) * 100 : 0;
        // UNBALANCED: sesuai rumus Excel user
        // (ABS((r/rata2)-1)) + (ABS((s/rata2)-1)) + (ABS(t/rata2)-1)
        const unbalanced = rata2 !== 0
          ? (Math.abs((r / rata2) - 1) + Math.abs((s / rata2) - 1) + (Math.abs(t / rata2) - 1)) * 100
          : 0;
        const updated = await prisma.measurementSiang.updateMany({
          where: {
            substationId: m.substationId,
            row_name: m.row_name,
            month: m.month,
          },
          data: {
            r, s, t, n,
            rn, sn, tn, // dari frontend
            pp, pn, // pn dari frontend
            rata2, kva, persen, unbalanced,
            lastUpdate: new Date(),
          },
        });
        if (updated.count === 0) {
          errors.push({ row: m, error: 'Measurement not found for update' });
        } else {
          updatedMeasurements.push({ ...m, rata2, kva, persen, unbalanced });
        }
      } catch (err) {
        errors.push({ row: m, error: err.message || 'Unknown error' });
      }
    }
    if (updatedMeasurements.length > 0) {
      return res.json({
        success: true,
        data: updatedMeasurements,
        errors,
        message: `Bulk measurement siang updated successfully. Updated: ${updatedMeasurements.length}, Errors: ${errors.length}`,
      });
    } else {
      return res.status(400).json({
        success: false,
        errors,
        message: 'No valid measurements found to update',
      });
    }
  } catch (err) {
    next(err);
  }
});

// PATCH /api/measurements_siang/:id - update siang measurement with calculations
app.patch('/api/measurements_siang/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, error: 'Invalid or missing id' });
    }
    // Pastikan semua nilai numerik dikonversi ke number
    const r = Number(req.body.r) || 0;
    const s = Number(req.body.s) || 0;
    const t = Number(req.body.t) || 0;
    const n = Number(req.body.n) || 0;
    const pp = Number(req.body.pp) || 0;
    // Get substation daya for calculations
    const measurement = await prisma.measurementSiang.findUnique({
      where: { id },
      include: {
        substation: true, // Perbaiki: gunakan 'substation' sesuai relasi Prisma
      },
    });
    if (!measurement) {
      return res.status(404).json({
        success: false,
        error: 'Measurement not found',
      });
    }
    // Calculate results (konsisten dengan proses import)
    const rata2 = (r + s + t) / 3;
    const kva = (rata2 * pp * 1.73) / 1000;
    const daya = parseFloat(measurement.substation?.daya || 0);
    const persen = daya ? (kva / daya) * 100 : 0;
    // UNBALANCED: sesuai rumus Excel user
    // (ABS((r/rata2)-1)) + (ABS((s/rata2)-1)) + (ABS(t/rata2)-1)
    const unbalanced = rata2 !== 0
      ? (Math.abs((r / rata2) - 1) + Math.abs((s / rata2) - 1) + (Math.abs(t / rata2) - 1)) * 100
      : 0;
    const updated = await prisma.measurementSiang.update({
      where: { id },
      data: {
        r, s, t, n, pp,
        rn: r - n, sn: s - n, tn: t - n, pn: rata2 - n,
        rata2, kva, persen, unbalanced,
      },
    });
    // Clear cache
    cache.clear();
    res.json({
      success: true,
      data: updated,
      message: 'Measurement updated successfully',
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/measurements_malam/bulk - bulk update measurements malam
app.patch('/api/measurements_malam/bulk', async (req, res, next) => {
  try {
    const measurements = req.body;
    if (!Array.isArray(measurements) || measurements.length === 0) {
      return res.status(400).json({ success: false, message: 'No data provided.' });
    }
    const updatedMeasurements = [];
    const errors = [];
    for (const m of measurements) {
      try {
        if (!m.substationId || !m.row_name || !m.month) {
          errors.push({ row: m, error: 'Missing substationId, row_name, or month' });
          continue;
        }
        // Ambil daya substation
        const substation = await prisma.substation.findUnique({ where: { id: m.substationId } });
        const daya = parseFloat(substation?.daya || 0);
        // Hitung rumus
        const r = Number(m.r) || 0;
        const s = Number(m.s) || 0;
        const t = Number(m.t) || 0;
        const n = Number(m.n) || 0;
        const rn = Number(m.rn) || 0; // Ambil dari frontend
        const sn = Number(m.sn) || 0; // Ambil dari frontend
        const tn = Number(m.tn) || 0; // Ambil dari frontend
        const pp = Number(m.pp) || 0;
        const pn = Number(m.pn) || 0;
        const rata2 = (r + s + t) / 3;
        const kva = (rata2 * pp * 1.73) / 1000;
        const persen = daya ? (kva / daya) * 100 : 0;
        // UNBALANCED: sesuai rumus Excel user
        // (ABS((r/rata2)-1)) + (ABS((s/rata2)-1)) + (ABS(t/rata2)-1)
        const unbalanced = rata2 !== 0
          ? (Math.abs((r / rata2) - 1) + Math.abs((s / rata2) - 1) + (Math.abs(t / rata2) - 1)) * 100
          : 0;
        const updated = await prisma.measurementMalam.updateMany({
          where: {
            substationId: m.substationId,
            row_name: m.row_name,
            month: m.month,
          },
          data: {
            r, s, t, n,
            rn, sn, tn, // dari frontend
            pp, pn, // pn dari frontend
            rata2, kva, persen, unbalanced,
            lastUpdate: new Date(),
          },
        });
        if (updated.count === 0) {
          errors.push({ row: m, error: 'Measurement not found for update' });
        } else {
          updatedMeasurements.push({ ...m, rata2, kva, persen, unbalanced });
        }
      } catch (err) {
        errors.push({ row: m, error: err.message || 'Unknown error' });
      }
    }
    if (updatedMeasurements.length > 0) {
      return res.json({
        success: true,
        data: updatedMeasurements,
        errors,
        message: `Bulk measurement malam updated successfully. Updated: ${updatedMeasurements.length}, Errors: ${errors.length}`,
      });
    } else {
      return res.status(400).json({
        success: false,
        errors,
        message: 'No valid measurements found to update',
      });
    }
  } catch (err) {
    next(err);
  }
});

// PATCH /api/measurements_malam/:id - update malam measurement with calculations
app.patch('/api/measurements_malam/:id', async (req, res, next) => {
  try {
    const { r, s, t, n, pp } = req.body;
    // Get substation daya for calculations
    const measurement = await prisma.measurementMalam.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        substation: true,
      },
    });
    if (!measurement) {
      return res.status(404).json({
        success: false,
        error: 'Measurement not found',
      });
    }
    // Calculate results (konsisten dengan proses import)
    const rata2 = (r + s + t) / 3;
    const kva = (rata2 * pp * 1.73) / 1000;
    const daya = parseFloat(measurement.substation?.daya || 0);
    const persen = daya ? (kva / daya) * 100 : 0;
    // UNBALANCED: sesuai rumus Excel user
    // (ABS((r/rata2)-1)) + (ABS((s/rata2)-1)) + (ABS(t/rata2)-1)
    const unbalanced = rata2 !== 0
      ? (Math.abs((r / rata2) - 1) + Math.abs((s / rata2) - 1) + (Math.abs(t / rata2) - 1)) * 100
      : 0;
    const updated = await prisma.measurementMalam.update({
      where: { id: parseInt(req.params.id) },
      data: {
        r, s, t, n, pp,
        rn: r - n, sn: s - n, tn: t - n, pn: rata2 - n,
        rata2, kva, persen, unbalanced,
      },
    });
    // Clear cache
    cache.clear();
    res.json({
      success: true,
      data: updated,
      message: 'Measurement updated successfully',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/measurements_siang - create new siang measurement
app.post('/api/measurements_siang', async (req, res, next) => {
  try {
    const { substationId, row_name, month } = req.body;
    if (!substationId || !row_name) {
      return res.status(400).json({ success: false, error: 'substationId dan row_name wajib diisi' });
    }
    const created = await prisma.measurementSiang.create({
      data: {
        substationId,
        row_name,
        month: month || new Date().toISOString().slice(0, 7),
        r: 0, s: 0, t: 0, n: 0, rn: 0, sn: 0, tn: 0, pp: 0, pn: 0,
        rata2: 0, kva: 0, persen: 0, unbalanced: 0,
        lastUpdate: new Date(),
      }
    });
    res.json(created);
  } catch (err) {
    next(err);
  }
});

// POST /api/measurements_malam - create new malam measurement
app.post('/api/measurements_malam', async (req, res, next) => {
  try {
    const { substationId, row_name, month } = req.body;
    if (!substationId || !row_name) {
      return res.status(400).json({ success: false, error: 'substationId dan row_name wajib diisi' });
    }
    const created = await prisma.measurementMalam.create({
      data: {
        substationId,
        row_name,
        month: month || new Date().toISOString().slice(0, 7),
        r: 0, s: 0, t: 0, n: 0, rn: 0, sn: 0, tn: 0, pp: 0, pn: 0,
        rata2: 0, kva: 0, persen: 0, unbalanced: 0,
        lastUpdate: new Date(),
      }
    });
    res.json(created);
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/stats - dashboard statistics
app.get('/api/dashboard/stats', async (req, res, next) => {
  try {
    // Fallback values jika Prisma Client bermasalah
    let totalSubstations = 0;
    let activeSubstations = 0;
    let criticalIssues = 0;
    let measurementsCount = 0;
    let ugbActive = 0;

    // Coba ambil data dari database jika Prisma Client siap
    if (prisma && prisma.substation && isDatabaseConnected) {
      try {
        // Retry mechanism untuk database queries
        const retryQuery = async (queryFn, maxRetries = 3) => {
          for (let i = 0; i < maxRetries; i++) {
            try {
              return await queryFn();
            } catch (error) {
              if (i === maxRetries - 1) throw error;
              await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
        };

        [totalSubstations, activeSubstations, criticalIssues, measurementsCount, ugbActive] = await Promise.all([
          retryQuery(() => prisma.substation.count()),
          retryQuery(() => prisma.substation.count({ where: { is_active: 1 } })),
          retryQuery(() => prisma.substation.count({ where: { status: 'critical' } })),
          retryQuery(() => prisma.measurementSiang.count()),
          retryQuery(() => prisma.substation.count({ where: { ugb: 1 } })),
        ]);
      } catch (dbError) {
        console.error('Database query error:', dbError);
        // Gunakan fallback values
      }
    } else {
      console.log('Prisma Client not available, using fallback values');
    }

    res.json({
      success: true,
      data: {
        totalSubstations,
        activeSubstations,
        inactiveSubstations: totalSubstations - activeSubstations,
        criticalIssues,
        monthlyMeasurements: measurementsCount,
        ugbActive,
      },
      message: 'Dashboard stats retrieved successfully',
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    // Return fallback response instead of error
    res.json({
      success: true,
      data: {
        totalSubstations: 0,
        activeSubstations: 0,
        inactiveSubstations: 0,
        criticalIssues: 0,
        monthlyMeasurements: 0,
        ugbActive: 0,
      },
      message: 'Dashboard stats retrieved with fallback values',
    });
  }
});

// GET /api/substations/filter - advanced filtering with pagination
app.get('/api/substations/filter', cacheMiddleware(60), async (req, res, next) => {
  try {
    const { status, ulp, jenis, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (ulp) where.ulp = { contains: ulp };
    if (jenis) where.jenis = { contains: jenis };
    if (search) {
      where.OR = [
        { namaLokasiGardu: { contains: search } },
        { noGardu: { contains: search } },
        { ulp: { contains: search } },
      ];
      }

    const [substations, total] = await Promise.all([
      prisma.substation.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        include: {
          measurements_siang: true,
          measurements_malam: true,
        },
        orderBy: { no: 'asc' },
      }),
      prisma.substation.count({ where }),
    ]);

    res.json({
      success: true,
      data: substations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      message: 'Filtered substations retrieved successfully',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/measurements/months - daftar bulan unik dari measurementSiang dan measurementMalam
app.get('/api/measurements/months', async (req, res, next) => {
  try {
    // Ambil semua bulan unik dari measurementSiang dan measurementMalam
    const [siangMonths, malamMonths] = await Promise.all([
      prisma.measurementSiang.findMany({
        select: { month: true },
        distinct: ['month'],
      }),
      prisma.measurementMalam.findMany({
        select: { month: true },
        distinct: ['month'],
      })
    ]);
    // Gabungkan dan ambil yang unik
    const allMonths = [...siangMonths.map(m => m.month), ...malamMonths.map(m => m.month)];
    const uniqueMonths = Array.from(new Set(allMonths)).filter(Boolean).sort();
    res.json({ success: true, data: uniqueMonths });
  } catch (err) {
    next(err);
  }
});

// GET /api/measurements/history?month=YYYY-MM - daftar riwayat pengukuran gardu per bulan
app.get('/api/measurements/history', async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ success: false, error: 'month is required' });

    // Ambil semua substation
    const substations = await prisma.substation.findMany();

    // Untuk setiap substation, ambil pengukuran siang & malam untuk bulan tsb
    const data = await Promise.all(substations.map(async (sub) => {
      const siang = await prisma.measurementSiang.findMany({
        where: { substationId: sub.id, month }
      });
      const malam = await prisma.measurementMalam.findMany({
        where: { substationId: sub.id, month }
      });
      return { substation: sub, siang, malam };
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Middleware log body untuk debug PATCH bulk
app.use((req, res, next) => {
  if (req.path.includes('/measurements_siang/bulk')) {
    console.log('DEBUG MIDDLEWARE BODY:', req.body);
    }
    next();
    });

// Admin endpoints
app.post('/api/admin/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Perbaiki: gunakan prisma.adminUser (bukan admin_users)
    const user = await prisma.adminUser.findUnique({
      where: { username },
    });

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
        token: 'admin_token', // In production, use JWT
      },
      message: 'Login successful',
    });
  } catch (err) {
    next(err);
  }
});

// Apply error handler
app.use(errorHandler);

// Serve React app for any non-API routes
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Substation Monitoring System</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px; 
                background: #f5f5f5; 
            }
            .container { 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            h1 { color: #333; }
            p { color: #666; }
            .api-link { 
                color: #007bff; 
                text-decoration: none; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Substation Monitoring System</h1>
            <p>Backend API is running successfully!</p>
            <p>API Endpoints:</p>
            <ul style="text-align: left; display: inline-block;">
                <li><a href="/api/health" class="api-link">/api/health</a> - Health check</li>
                <li><a href="/api/substations" class="api-link">/api/substations</a> - Get all substations</li>
                <li><a href="/api/dashboard/stats" class="api-link">/api/dashboard/stats</a> - Dashboard stats</li>
            </ul>
            <p style="margin-top: 20px;">
                <strong>Note:</strong> This is the backend API. For the full application, 
                you need to deploy the frontend separately or build it with the backend.
            </p>
        </div>
    </body>
    </html>
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}/api`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
}); 