# Setup Database untuk Monitoring Gardu Distribusi

Panduan lengkap untuk mengintegrasikan aplikasi monitoring gardu distribusi dengan database.

## Prerequisites

- Node.js (versi 16 atau lebih baru)
- npm atau yarn
- Database server (SQLite, PostgreSQL, MySQL, atau MongoDB)

## Opsi 1: Menggunakan SQLite (Demo/Development)

### 1. Setup Backend Server

```bash
# Masuk ke direktori server
cd server

# Install dependencies
npm install

# Jalankan server
npm run dev
```

Server akan berjalan di `http://localhost:3001` dengan database SQLite otomatis dibuat.

### 2. Setup Frontend

```bash
# Kembali ke root directory
cd ..

# Install dependencies frontend
npm install

# Buat file .env
echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env

# Jalankan aplikasi
npm run dev
```

## Opsi 2: Menggunakan Database Production (PostgreSQL/MySQL)

### 1. Setup Database

#### PostgreSQL
```sql
-- Buat database
CREATE DATABASE substation_monitoring;

-- Buat tabel substations
CREATE TABLE substations (
  id VARCHAR(255) PRIMARY KEY,
  no INTEGER NOT NULL,
  ulp VARCHAR(255) NOT NULL,
  no_gardu VARCHAR(255) NOT NULL,
  nama_lokasi_gardu TEXT NOT NULL,
  jenis VARCHAR(100) NOT NULL,
  merek VARCHAR(100) NOT NULL,
  daya VARCHAR(50) NOT NULL,
  tahun VARCHAR(10) NOT NULL,
  phasa VARCHAR(10) NOT NULL,
  jumlah_trafo_distribusi VARCHAR(10) NOT NULL,
  seksi_gardu VARCHAR(100) NOT NULL,
  penyulang VARCHAR(100) NOT NULL,
  arah_sequence VARCHAR(100) NOT NULL,
  jurusan_raya_kota VARCHAR(255) NOT NULL,
  tanggal DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'normal',
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel measurements
CREATE TABLE measurements (
  id SERIAL PRIMARY KEY,
  substation_id VARCHAR(255) REFERENCES substations(id) ON DELETE CASCADE,
  month VARCHAR(10) NOT NULL,
  r DECIMAL(10,2) NOT NULL,
  s DECIMAL(10,2) NOT NULL,
  t DECIMAL(10,2) NOT NULL,
  n DECIMAL(10,2) NOT NULL,
  rn DECIMAL(10,2) NOT NULL,
  sn DECIMAL(10,2) NOT NULL,
  tn DECIMAL(10,2) NOT NULL,
  pp DECIMAL(10,2) NOT NULL,
  pn DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buat index untuk performa
CREATE INDEX idx_substations_status ON substations(status);
CREATE INDEX idx_substations_ulp ON substations(ulp);
CREATE INDEX idx_measurements_substation_id ON measurements(substation_id);
```

#### MySQL
```sql
-- Buat database
CREATE DATABASE substation_monitoring;

-- Gunakan database
USE substation_monitoring;

-- Buat tabel substations
CREATE TABLE substations (
  id VARCHAR(255) PRIMARY KEY,
  no INT NOT NULL,
  ulp VARCHAR(255) NOT NULL,
  no_gardu VARCHAR(255) NOT NULL,
  nama_lokasi_gardu TEXT NOT NULL,
  jenis VARCHAR(100) NOT NULL,
  merek VARCHAR(100) NOT NULL,
  daya VARCHAR(50) NOT NULL,
  tahun VARCHAR(10) NOT NULL,
  phasa VARCHAR(10) NOT NULL,
  jumlah_trafo_distribusi VARCHAR(10) NOT NULL,
  seksi_gardu VARCHAR(100) NOT NULL,
  penyulang VARCHAR(100) NOT NULL,
  arah_sequence VARCHAR(100) NOT NULL,
  jurusan_raya_kota VARCHAR(255) NOT NULL,
  tanggal DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'normal',
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Buat tabel measurements
CREATE TABLE measurements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  substation_id VARCHAR(255),
  month VARCHAR(10) NOT NULL,
  r DECIMAL(10,2) NOT NULL,
  s DECIMAL(10,2) NOT NULL,
  t DECIMAL(10,2) NOT NULL,
  n DECIMAL(10,2) NOT NULL,
  rn DECIMAL(10,2) NOT NULL,
  sn DECIMAL(10,2) NOT NULL,
  tn DECIMAL(10,2) NOT NULL,
  pp DECIMAL(10,2) NOT NULL,
  pn DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (substation_id) REFERENCES substations(id) ON DELETE CASCADE
);

-- Buat index untuk performa
CREATE INDEX idx_substations_status ON substations(status);
CREATE INDEX idx_substations_ulp ON substations(ulp);
CREATE INDEX idx_measurements_substation_id ON measurements(substation_id);
```

### 2. Update Backend untuk Database Production

#### Untuk PostgreSQL
```bash
cd server
npm install pg
```

Update `server.js`:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});
```

#### Untuk MySQL
```bash
cd server
npm install mysql2
```

Update `server.js`:
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});
```

### 3. Environment Variables

Buat file `.env` di direktori server:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432  # atau 3306 untuk MySQL
DB_NAME=substation_monitoring
DB_USER=your_username
DB_PASSWORD=your_password

# Server Configuration
PORT=3001
NODE_ENV=production
```

## Opsi 3: Menggunakan MongoDB

### 1. Setup MongoDB

```bash
# Install MongoDB driver
cd server
npm install mongodb
```

### 2. Database Schema

```javascript
// Substations Collection
{
  _id: ObjectId,
  no: Number,
  ulp: String,
  noGardu: String,
  namaLokasiGardu: String,
  jenis: String,
  merek: String,
  daya: String,
  tahun: String,
  phasa: String,
  jumlahTrafoDistribusi: String,
  seksiGardu: String,
  penyulang: String,
  arahSequence: String,
  jurusanRayaKota: String,
  tanggal: Date,
  status: String,
  lastUpdate: Date,
  measurements: [
    {
      month: String,
      r: Number,
      s: Number,
      t: Number,
      n: Number,
      rn: Number,
      sn: Number,
      tn: Number,
      pp: Number,
      pn: Number
    }
  ]
}
```

## Data Migration

### 1. Import Data dari Excel/CSV

Buat script untuk import data:

```javascript
// scripts/import-data.js
const csv = require('csv-parser');
const fs = require('fs');
const { Pool } = require('pg'); // atau mysql2

const pool = new Pool({
  // database configuration
});

fs.createReadStream('data/substations.csv')
  .pipe(csv())
  .on('data', async (row) => {
    // Insert data ke database
    await pool.query(`
      INSERT INTO substations (
        no, ulp, no_gardu, nama_lokasi_gardu, jenis, merek, daya,
        tahun, phasa, jumlah_trafo_distribusi, seksi_gardu,
        penyulang, arah_sequence, jurusan_raya_kota, tanggal, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `, [
      row.no, row.ulp, row.no_gardu, row.nama_lokasi_gardu,
      row.jenis, row.merek, row.daya, row.tahun, row.phasa,
      row.jumlah_trafo_distribusi, row.seksi_gardu, row.penyulang,
      row.arah_sequence, row.jurusan_raya_kota, row.tanggal, row.status
    ]);
  });
```

### 2. Export Data

```javascript
// scripts/export-data.js
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  // database configuration
});

async function exportData() {
  const result = await pool.query(`
    SELECT s.*, 
           json_agg(m.*) as measurements
    FROM substations s
    LEFT JOIN measurements m ON s.id = m.substation_id
    GROUP BY s.id
  `);
  
  fs.writeFileSync('export/substations.json', JSON.stringify(result.rows, null, 2));
}

exportData();
```

## Testing Database Connection

### 1. Test API Endpoints

```bash
# Test health check
curl http://localhost:3001/api/health

# Test get all substations
curl http://localhost:3001/api/substations

# Test get substation by ID
curl http://localhost:3001/api/substations/1

# Test create substation
curl -X POST http://localhost:3001/api/substations \
  -H "Content-Type: application/json" \
  -d '{
    "no": 4,
    "ulp": "MANADO SELATAN",
    "noGardu": "M 462",
    "namaLokasiGardu": "SISIP POS MAKMUD KOMP",
    "jenis": "CANTOL",
    "merek": "B&D",
    "daya": "50",
    "tahun": "2017",
    "phasa": "3",
    "jumlahTrafoDistribusi": "3",
    "seksiGardu": "P-KBR",
    "penyulang": "SR-4",
    "arahSequence": "INDUK",
    "jurusanRayaKota": "15-May-25",
    "tanggal": "2024-01-15",
    "status": "normal"
  }'
```

### 2. Test Frontend Integration

1. Buka browser ke `http://localhost:5173`
2. Periksa apakah data gardu muncul
3. Test fitur filter dan pencarian
4. Test update status dan daya gardu
5. Periksa console browser untuk error

## Troubleshooting

### 1. Database Connection Error

```bash
# Periksa konfigurasi database
echo $DB_HOST
echo $DB_USER
echo $DB_PASSWORD

# Test koneksi database
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
# atau
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME
```

### 2. CORS Error

Pastikan backend server mengizinkan CORS dari frontend:

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

### 3. Data Tidak Muncul

1. Periksa response API di browser developer tools
2. Periksa format data sesuai dengan interface `SubstationData`
3. Periksa error di console backend server

### 4. Performance Issues

1. Tambahkan index pada kolom yang sering di-query
2. Implementasi pagination untuk data besar
3. Gunakan connection pooling
4. Implementasi caching untuk data yang jarang berubah

## Monitoring dan Maintenance

### 1. Database Backup

```bash
# PostgreSQL
pg_dump -h localhost -U username -d substation_monitoring > backup.sql

# MySQL
mysqldump -h localhost -u username -p substation_monitoring > backup.sql

# SQLite
cp substations.db backup_$(date +%Y%m%d_%H%M%S).db
```

### 2. Log Monitoring

```javascript
// Tambahkan logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 3. Performance Monitoring

```javascript
// Tambahkan metrics
const responseTime = require('response-time');

app.use(responseTime((req, res, time) => {
  logger.info(`${req.method} ${req.url} - ${time}ms`);
}));
```

## Security Considerations

1. **Environment Variables**: Jangan hardcode database credentials
2. **Input Validation**: Validasi semua input dari user
3. **SQL Injection**: Gunakan parameterized queries
4. **Authentication**: Implementasi sistem login jika diperlukan
5. **HTTPS**: Gunakan HTTPS di production
6. **Rate Limiting**: Batasi request rate untuk mencegah abuse

## Deployment

### 1. Production Environment

```bash
# Build frontend
npm run build

# Setup production database
# Jalankan migration scripts

# Start production server
NODE_ENV=production npm start
```

### 2. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_USER=postgres
      - DB_PASSWORD=password
      - DB_NAME=substation_monitoring
    depends_on:
      - postgres
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=substation_monitoring
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Dengan setup ini, aplikasi monitoring gardu distribusi Anda akan terintegrasi penuh dengan database dan dapat mengelola data gardu secara real-time. 