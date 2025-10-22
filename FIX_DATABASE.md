# 🔧 Database Fix Guide

## Masalah yang Ditemukan

Error 500 pada `/api/admin/login` disebabkan oleh:
1. **Schema mismatch**: Field `name` ditambahkan ke schema tetapi belum ada di database
2. **Inconsistent password hashing**: Perbedaan hashing antara API endpoints
3. **Missing database migration**: Perubahan schema memerlukan migrasi database

## Solusi yang Telah Diimplementasikan

### 1. ✅ Perbaikan API Login
- Menambahkan field `name` ke response login
- Konsistensi password hashing menggunakan SHA-256
- Update kedua endpoint login (`api/admin/login.js` dan `api/index.js`)

### 2. ✅ Script Migrasi Database
- `scripts/migrateAddNameField.js` - Menambahkan kolom name
- `scripts/setupDatabase.js` - Setup database lengkap
- `scripts/runMigration.js` - Menjalankan Prisma migration
- `scripts/fixDatabase.js` - Script master untuk semua perbaikan

## 🚀 Cara Menjalankan Perbaikan

### Opsi 1: Menggunakan Script Master (Recommended)
```bash
cd /Users/betran/Downloads/project\ 4
node scripts/fixDatabase.js
```

### Opsi 2: Manual Step by Step

#### Step 1: Jalankan Prisma Migration
```bash
cd api
npx prisma generate
npx prisma migrate dev --name add_name_field
```

#### Step 2: Setup Database
```bash
cd ..
node scripts/setupDatabase.js
```

### Opsi 3: Manual SQL (Jika Prisma migration gagal)
```sql
-- Tambahkan kolom name ke tabel admin_users
ALTER TABLE admin_users ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '';

-- Update existing records
UPDATE admin_users SET name = username WHERE name = '' OR name IS NULL;
```

## 🔍 Verifikasi Perbaikan

### 1. Cek Database Schema
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;
```

### 2. Test API Login
```bash
curl -X POST https://project-4-vyl4.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 3. Cek Response
Response yang benar harus mengandung:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Administrator",
      "role": "admin"
    },
    "token": "admin_token"
  }
}
```

## 📝 Default Admin Credentials

Setelah setup, default admin user:
- **Username**: `admin`
- **Password**: `admin123`
- **Name**: `Administrator`
- **Role**: `admin`

## 🚨 Troubleshooting

### Error: "Column 'name' does not exist"
- Jalankan script migrasi: `node scripts/fixDatabase.js`

### Error: "Table 'admin_users' does not exist"
- Jalankan Prisma migration terlebih dahulu
- Pastikan database connection string benar

### Error: "Invalid credentials"
- Pastikan password di-hash dengan SHA-256
- Cek apakah user ada di database

### Error: "500 Internal Server Error"
- Cek logs di Vercel dashboard
- Pastikan semua dependencies terinstall
- Verifikasi database connection

## 📋 Checklist Setelah Perbaikan

- [ ] Database migration berhasil
- [ ] API login mengembalikan response 200
- [ ] Field `name` tersedia di response
- [ ] Admin dashboard dapat diakses
- [ ] User management berfungsi
- [ ] Dapat membuat user baru

## 🔄 Deploy ke Production

1. **Commit semua perubahan**:
   ```bash
   git add .
   git commit -m "Fix database schema and login API"
   git push
   ```

2. **Deploy ke Vercel**:
   - Vercel akan otomatis deploy dari git push
   - Atau manual deploy dari Vercel dashboard

3. **Test di production**:
   - Test login admin
   - Test user management
   - Test semua fitur

## 📞 Support

Jika masih ada masalah:
1. Cek logs di Vercel dashboard
2. Test API endpoints secara manual
3. Verifikasi database schema
4. Pastikan semua dependencies terinstall
