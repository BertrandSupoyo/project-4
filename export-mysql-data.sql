-- Export data dari MySQL untuk migrasi ke PostgreSQL
-- Jalankan di MySQL client atau phpMyAdmin

-- Export struktur tabel
SHOW CREATE TABLE substations;
SHOW CREATE TABLE measurements_siang;
SHOW CREATE TABLE measurements_malam;
SHOW CREATE TABLE admin_users;

-- Export data substations
SELECT * FROM substations;

-- Export data measurements_siang
SELECT * FROM measurements_siang;

-- Export data measurements_malam  
SELECT * FROM measurements_malam;

-- Export data admin_users
SELECT * FROM admin_users; 