# Troubleshooting: Checkbox Aktif Gardu dan UGB

## Masalah
Checkbox "Aktif Gardu" dan "Aktif UGB" tidak berfungsi karena tidak mengirim data ke database.

## Solusi yang Sudah Diterapkan

### 1. Membuat Dynamic Route untuk Vercel
- ✅ Membuat file `api/substations/[id].js` untuk handle PATCH dan DELETE requests
- ✅ Menghapus PATCH dan DELETE dari `api/substations.js`
- ✅ Update `vercel.json` untuk menambahkan konfigurasi dynamic route

### 2. Menambahkan Logging untuk Debug
- ✅ Menambahkan console.log di `SubstationTable.tsx` untuk tracking checkbox clicks
- ✅ Menambahkan console.log di `ApiService` untuk tracking API requests
- ✅ Menambahkan console.log di method `request` untuk tracking HTTP responses

### 3. Memastikan Field Filtering
- ✅ Menambahkan allowed fields filter di backend: `['is_active', 'status', 'daya', 'lastUpdate', 'ugb', 'latitude', 'longitude', 'tanggal']`

## Cara Test

### 1. Buka Browser Developer Tools
1. Buka aplikasi di browser
2. Tekan F12 untuk membuka Developer Tools
3. Pilih tab "Console"

### 2. Test Checkbox
1. Login sebagai admin
2. Cari gardu di tabel
3. Klik checkbox "Aktif" atau "UGB"
4. Perhatikan log di console:
   - `🔥 Checkbox clicked!` - checkbox diklik
   - `🔗 PATCH to API with:` - data yang dikirim
   - `🔗 API URL:` - URL API yang digunakan
   - `🔗 Making API request to:` - request HTTP
   - `🔗 Response status:` - status response
   - `✅ Update successful` - berhasil atau `❌ Update failed` - gagal

### 3. Periksa Network Tab
1. Di Developer Tools, pilih tab "Network"
2. Klik checkbox
3. Cari request PATCH ke `/api/substations/[id]`
4. Periksa:
   - Request payload (body)
   - Response status
   - Response data

## Kemungkinan Masalah

### 1. Environment Variable
- Pastikan `VITE_API_BASE_URL` sudah benar di Vercel
- Untuk production: `https://your-app.vercel.app/api`
- Untuk development: `http://localhost:3001/api`

### 2. CORS Issues
- Backend sudah dikonfigurasi untuk allow CORS
- Periksa apakah ada error CORS di console

### 3. Database Connection
- Pastikan database PostgreSQL sudah terhubung
- Periksa log di Vercel Function untuk error database

### 4. Authentication
- Pastikan user sudah login sebagai admin
- Periksa apakah `isReadOnly` bernilai `false`

## Debug Commands

### Test API Endpoint
```bash
# Test PATCH request
curl -X PATCH https://your-app.vercel.app/api/substations/YOUR_SUBSTATION_ID \
  -H "Content-Type: application/json" \
  -d '{"is_active": 1, "ugb": 0}'
```

### Test Database Connection
```bash
# Test GET request
curl https://your-app.vercel.app/api/substations
```

## File yang Dimodifikasi

1. `api/substations/[id].js` - Dynamic route untuk PATCH/DELETE
2. `api/substations.js` - Menghapus PATCH/DELETE
3. `vercel.json` - Menambahkan konfigurasi dynamic route
4. `src/components/SubstationTable.tsx` - Menambahkan logging
5. `src/services/api.ts` - Menambahkan logging

## Next Steps

Jika masih bermasalah:
1. Periksa log di Vercel Function
2. Test API endpoint secara manual
3. Periksa database schema dan data
4. Pastikan environment variables sudah benar 