# Monitoring Gardu Distribusi

Aplikasi monitoring gardu distribusi yang terintegrasi dengan database untuk manajemen data gardu distribusi secara real-time.

## 🚀 Quick Start

### Cara Paling Mudah (Menggunakan Script)

```bash
# Jalankan script otomatis
./start-app.sh
```

Script ini akan:
- ✅ Memeriksa instalasi Node.js dan npm
- 📦 Menginstall semua dependencies
- 🔧 Menjalankan backend server dengan SQLite database
- 🌐 Menjalankan frontend application
- 📊 Membuka aplikasi di browser

### Cara Manual

#### 1. Setup Backend Server

```bash
# Masuk ke direktori server
cd server

# Install dependencies
npm install

# Jalankan server
npm run dev
```

Server akan berjalan di `http://localhost:3001` dengan database SQLite otomatis dibuat.

#### 2. Setup Frontend

```bash
# Kembali ke root directory
cd ..

# Install dependencies
npm install

# Buat file .env
echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env

# Jalankan aplikasi
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 📊 Fitur Utama

- 📊 Dashboard dengan statistik real-time
- 📋 Daftar gardu distribusi dengan filter dan pencarian
- 📈 Grafik pengukuran tegangan
- 🔧 Manajemen status gardu (Normal, Warning, Critical, Non-Active)
- 📝 Detail informasi gardu dengan simulasi pengukuran
- 🔄 Sinkronisasi data dengan database
- 📱 Responsive design
- 🗄️ CRUD operations lengkap
- 🔍 Advanced filtering dan searching
- 📤 Export data capabilities

## 🗄️ Database Integration

Aplikasi ini sekarang terintegrasi penuh dengan database dan mendukung:

### Database yang Didukung
- ✅ **SQLite** (Development/Demo) - Otomatis setup
- ✅ **PostgreSQL** (Production)
- ✅ **MySQL** (Production)
- ✅ **MongoDB** (Production)

### Fitur Database
- 🔄 **Real-time Data Loading** - Data dimuat otomatis dari database
- 📝 **CRUD Operations** - Create, Read, Update, Delete gardu
- 🔍 **Advanced Filtering** - Filter berdasarkan status, ULP, jenis
- 🔎 **Search Functionality** - Pencarian berdasarkan nama, ULP, nomor gardu
- 📊 **Statistics** - Statistik real-time dari database
- 🚨 **Error Handling** - Penanganan error koneksi database
- ⚡ **Loading States** - Indikator loading saat operasi database

## 🏗️ Struktur Project

```
project/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   │   ├── ui/            # UI components (Button, Card, Badge, etc.)
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── SubstationTable.tsx
│   │   ├── SubstationDetailModal.tsx
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   │   └── useSubstations.ts
│   ├── services/          # API services
│   │   └── api.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── config/            # Configuration files
│   │   └── environment.ts
│   ├── data/              # Mock data (for development)
│   │   └── mockData.ts
│   └── App.tsx            # Main application component
├── server/                # Backend API server
│   ├── server.js          # Express.js server dengan SQLite
│   └── package.json       # Backend dependencies
├── start-app.sh           # Script untuk menjalankan aplikasi
├── SETUP_DATABASE.md      # Panduan setup database lengkap
└── README.md              # Dokumentasi ini
```

## 🔧 API Endpoints

### Substations
- `GET /api/substations` - Mengambil semua data gardu
- `GET /api/substations/:id` - Mengambil data gardu berdasarkan ID
- `POST /api/substations` - Menambah gardu baru
- `PUT /api/substations/:id` - Mengupdate data gardu
- `DELETE /api/substations/:id` - Menghapus gardu

### Status & Power Management
- `PATCH /api/substations/:id/status` - Mengupdate status gardu
- `PATCH /api/substations/:id/power` - Mengupdate daya gardu

### Dashboard & Filtering
- `GET /api/dashboard/stats` - Mengambil statistik dashboard
- `GET /api/substations/filter` - Filter gardu berdasarkan kriteria

### Health Check
- `GET /api/health` - Status API server

## 📋 Struktur Data

```typescript
interface SubstationData {
  id: string;
  no: number;
  ulp: string;
  noGardu: string;
  namaLokasiGardu: string;
  jenis: string;
  merek: string;
  daya: string;
  tahun: string;
  phasa: string;
  jumlahTrafoDistribusi: string;
  seksiGardu: string;
  penyulang: string;
  arahSequence: string;
  jurusanRayaKota: string;
  tanggal: string;
  measurements: {
    month: string;
    r: number;
    s: number;
    t: number;
    n: number;
    rn: number;
    sn: number;
    tn: number;
    pp: number;
    pn: number;
  }[];
  status: 'normal' | 'warning' | 'critical' | 'non-active';
  lastUpdate: string;
}
```

## 🗄️ Database Setup

### SQLite (Default - Development)
Database SQLite otomatis dibuat saat menjalankan backend server.

### PostgreSQL/MySQL (Production)
Lihat file `SETUP_DATABASE.md` untuk panduan lengkap setup database production.

## 🔍 Testing

### Test API Endpoints
```bash
# Health check
curl http://localhost:3001/api/health

# Get all substations
curl http://localhost:3001/api/substations

# Get substation by ID
curl http://localhost:3001/api/substations/1
```

### Test Frontend
1. Buka browser ke `http://localhost:5173`
2. Periksa apakah data gardu muncul
3. Test fitur filter dan pencarian
4. Test update status dan daya gardu
5. Periksa console browser untuk error

## 🛠️ Development

### Environment Variables
Buat file `.env` di root project:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# App Configuration
VITE_APP_NAME="Monitoring Gardu Distribusi"
VITE_APP_VERSION=1.0.0

# Feature flags
VITE_ENABLE_REALTIME_UPDATES=true
VITE_ENABLE_EXPORT=true

# Timeout configurations
VITE_API_TIMEOUT=10000
VITE_REFRESH_INTERVAL=30000
```

### Available Scripts

#### Frontend
```bash
npm run dev          # Development server
npm run build        # Build untuk production
npm run preview      # Preview build production
```

#### Backend
```bash
cd server
npm run dev          # Development server dengan nodemon
npm start            # Production server
```

## 🚨 Troubleshooting

### Database Connection Error
- Periksa apakah backend server berjalan di port 3001
- Periksa konfigurasi `VITE_API_BASE_URL` di file `.env`
- Periksa console browser untuk error details

### Data Tidak Muncul
- Periksa response API di browser developer tools
- Pastikan format data sesuai dengan interface `SubstationData`
- Periksa error di console backend server

### CORS Error
- Pastikan backend server mengizinkan CORS dari frontend
- Periksa konfigurasi CORS di `server/server.js`

## 📚 Dokumentasi Lengkap

- 📖 [Setup Database](SETUP_DATABASE.md) - Panduan lengkap setup database
- 🔧 [API Documentation](#api-endpoints) - Dokumentasi API endpoints
- 🗄️ [Database Schema](#struktur-data) - Struktur data dan schema

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🆘 Support

Untuk bantuan dan pertanyaan:
- 📧 Buat issue di repository ini
- 📖 Baca dokumentasi di `SETUP_DATABASE.md`
- 🔧 Periksa troubleshooting section

---

**🎉 Selamat! Aplikasi monitoring gardu distribusi Anda sekarang terintegrasi penuh dengan database dan siap digunakan!** 