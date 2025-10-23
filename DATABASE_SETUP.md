# Setup Database PostgreSQL

## Prerequisites

1. **PostgreSQL** sudah terinstall dan berjalan
2. **Node.js** dan **npm** sudah terinstall
3. **Prisma CLI** sudah terinstall

## Langkah-langkah Setup

### 1. Install Dependencies

```bash
npm install
npm install pg @types/pg
```

### 2. Setup Database PostgreSQL

#### Opsi A: Menggunakan Script Otomatis

```bash
# Edit file scripts/createDatabase.js
# Ganti username dan password dengan kredensial PostgreSQL Anda
# Kemudian jalankan:
node scripts/createDatabase.js
```

#### Opsi B: Manual Setup

```sql
-- Login ke PostgreSQL
psql -U postgres

-- Buat database
CREATE DATABASE substation_monitoring;

-- Buat user (opsional)
CREATE USER substation_user WITH PASSWORD 'substation_password';
GRANT ALL PRIVILEGES ON DATABASE substation_monitoring TO substation_user;

-- Keluar dari psql
\q
```

### 3. Update DATABASE_URL

Buat file `.env.local` di root project:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/substation_monitoring"
```

Atau update di file API:
- `api/admin/login.js`
- `api/users/index.js`

Ganti `username`, `password`, dan `substation_monitoring` dengan kredensial Anda.

### 4. Jalankan Migration

```bash
# Generate Prisma client
npx prisma generate

# Jalankan migration
npx prisma migrate dev --name init

# Atau gunakan script
node scripts/runMigration.js
```

### 5. Setup Data Awal

```bash
# Buat user admin, petugas, dan viewer
node scripts/setupPostgreSQL.js
```

## Testing

### 1. Test Database Connection

```bash
node scripts/testDatabase.js
```

### 2. Test API

```bash
# Test login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test get users
curl http://localhost:3000/api/users
```

### 3. Test Frontend

1. Buka browser ke `http://localhost:5173`
2. Login dengan kredensial:
   - **Admin**: username=admin, password=admin123
   - **Petugas**: username=petugas, password=petugas123
   - **Viewer**: username=viewer, password=viewer123
3. Test fitur user management

## Troubleshooting

### Error: Database Connection Failed

```bash
# Periksa status PostgreSQL
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Periksa port
netstat -tlnp | grep 5432
```

### Error: Database Does Not Exist

```sql
-- Login ke PostgreSQL
psql -U postgres

-- Buat database
CREATE DATABASE substation_monitoring;

-- Keluar
\q
```

### Error: Permission Denied

```sql
-- Login sebagai superuser
psql -U postgres

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE substation_monitoring TO your_username;
```

### Error: Prisma Migration Failed

```bash
# Reset database
npx prisma migrate reset

# Jalankan migration lagi
npx prisma migrate dev --name init
```

## Production Setup

### 1. Environment Variables

```env
DATABASE_URL="postgresql://username:password@host:5432/substation_monitoring"
NODE_ENV=production
```

### 2. Vercel Deployment

1. Set `DATABASE_URL` di Vercel Environment Variables
2. Deploy aplikasi
3. Jalankan migration di production

### 3. Database Security

1. Gunakan strong password
2. Enable SSL connection
3. Restrict database access
4. Regular backup

## Monitoring

### 1. Database Performance

```sql
-- Check active connections
SELECT * FROM pg_stat_activity WHERE datname = 'substation_monitoring';

-- Check table sizes
SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables WHERE schemaname = 'public';
```

### 2. Application Logs

```bash
# Check API logs
tail -f logs/api.log

# Check error logs
tail -f logs/error.log
```

## Backup & Restore

### Backup

```bash
# Full backup
pg_dump -h localhost -U username -d substation_monitoring > backup.sql

# Schema only
pg_dump -h localhost -U username -d substation_monitoring --schema-only > schema.sql

# Data only
pg_dump -h localhost -U username -d substation_monitoring --data-only > data.sql
```

### Restore

```bash
# Restore from backup
psql -h localhost -U username -d substation_monitoring < backup.sql
```

Dengan setup ini, aplikasi PowerGrid Monitor akan terintegrasi penuh dengan database PostgreSQL dan siap digunakan! 🚀
