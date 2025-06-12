# Database Seeding dengan Backup

Dokumentasi ini menjelaskan cara melakukan seeding database dengan sistem backup otomatis untuk project KASEP Backend API.

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Persiapan](#persiapan)
- [Script yang Tersedia](#script-yang-tersedia)
- [Cara Penggunaan](#cara-penggunaan)
- [Jenis Seeding](#jenis-seeding)
- [Troubleshooting](#troubleshooting)

## ✨ Fitur

- **Backup Otomatis**: Setiap seeding akan melakukan backup data yang ada terlebih dahulu
- **Seed dengan Data Sample**: Menambahkan data sample untuk testing
- **Seed dengan Data Resep**: Menggunakan data resep dari parser SQL
- **Restore dari Backup**: Kemampuan untuk restore data dari file backup
- **Clear Selective**: Menghapus hanya data seed tertentu

## 🔧 Persiapan

1. **Install Dependencies** (jika belum):
   ```bash
   npm install
   ```

2. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

3. **Setup Database** (jika belum):
   ```bash
   npm run db:migrate
   ```

## 📜 Script yang Tersedia

### Backup & Restore
```bash
# Backup manual data database
npm run db:backup

# Restore data dari backup file
npm run db:restore <path-to-backup-file>
```

### Seeding Sample Data
```bash
# Seed dengan data sample (otomatis backup)
npm run db:seed

# Hapus hanya data sample seed
npm run db:seed:clear
```

### Seeding dengan Data Resep
```bash
# Seed dengan data resep dari parser (otomatis backup)
npm run db:seed:recipes

# Hapus semua data (termasuk resep)
npm run db:seed:recipes:clear
```

## 🚀 Cara Penggunaan

### 1. Seeding Data Sample

Untuk menambahkan data sample tanpa data resep:

```bash
npm run db:seed
```

**Data yang akan ditambahkan:**
- 3 User Profile sample
- 3 Resep sample sederhana
- BMI Records untuk setiap user
- Ideal Targets
- Sample histories

### 2. Seeding dengan Data Resep Lengkap

Untuk menambahkan data sample + data resep dari parser:

```bash
# Pertama, pastikan data resep sudah di-parse
cd scripts/parser-data-receipts
node parseSQLToDatabase.js test

# Kembali ke root directory
cd ../..

# Jalankan seeding dengan resep
npm run db:seed:recipes
```

**Data yang akan ditambahkan:**
- 3 User Profile sample
- Semua resep dari parser (~165 resep)
- Ingredients, Steps, StepImages dari parser
- BMI Records untuk setiap user
- Ideal Targets
- Sample histories dengan resep yang ada

### 3. Backup Manual

Untuk backup manual tanpa seeding:

```bash
npm run db:backup
```

Backup akan disimpan di `prisma/backups/backup-[timestamp].json`

### 4. Restore dari Backup

Jika terjadi masalah atau ingin kembali ke data sebelumnya:

```bash
npm run db:restore prisma/backups/backup-2024-01-15T10-30-00-000Z.json
```

## 📊 Jenis Seeding

### A. Sample Data Seed (`seed.js`)

**User Profiles:**
- John Doe (`john.doe@example.com`)
- Jane Smith (`jane.smith@example.com`) 
- Google User (`googleuser@gmail.com`)

**Sample Receipts:**
- Nasi Goreng Sederhana
- Gado-gado Jakarta
- Soto Ayam

### B. Recipes Data Seed (`seed-with-recipes.js`)

**User Profiles:** (sama seperti sample data)

**Recipes:** Data lengkap dari parser SQL (~165 resep) dengan:
- Informasi nutrisi lengkap
- Bahan-bahan detail
- Langkah-langkah memasak
- Gambar untuk setiap langkah

## 🔍 Struktur Backup

File backup menggunakan format JSON dengan struktur:

```json
{
  "metadata": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0",
    "tables": ["UserProfile", "BMIRecord", ...]
  },
  "data": {
    "userProfiles": [...],
    "receipts": [...],
    "ingredients": [...],
    ...
  },
  "counts": {
    "userProfiles": 5,
    "receipts": 168,
    ...
  }
}
```

## 🛠️ Troubleshooting

### Error: "File parsed_recipes.json tidak ditemukan"

**Solusi:**
```bash
cd scripts/parser-data-receipts
node parseSQLToDatabase.js test
cd ../..
npm run db:seed:recipes
```

### Error: Database connection issues

**Solusi:**
1. Pastikan PostgreSQL running
2. Check connection string di `.env`
3. Pastikan database exists

### Error: "Prisma client not generated"

**Solusi:**
```bash
npm run db:generate
```

### Ingin Menghapus Semua Data

**Untuk menghapus semua data:**
```bash
npm run db:seed:recipes:clear
```

**Untuk menghapus hanya sample data:**
```bash
npm run db:seed:clear
```

### Restore ke Kondisi Sebelum Seeding

```bash
# Cari file backup terbaru di prisma/backups/
ls -la prisma/backups/

# Restore dari backup
npm run db:restore prisma/backups/backup-[timestamp].json
```

## ⚠️ Important Notes

1. **Backup Otomatis**: Setiap kali menjalankan seeding, backup akan dibuat otomatis
2. **skipDuplicates**: Script menggunakan `skipDuplicates: true` untuk menghindari duplicate data
3. **Transaction Safety**: Operasi database menggunakan transaction untuk data consistency
4. **ID Collision**: Script menggunakan prefix ID untuk menghindari collision dengan data production

## 🎯 Best Practices

1. **Selalu backup manual** sebelum operasi besar
2. **Test di development** sebelum production
3. **Monitor disk space** karena backup files bisa besar
4. **Cleanup old backups** secara berkala
5. **Verify data** setelah seeding/restore

## 📞 Support

Jika mengalami masalah, silakan:
1. Check log error di console
2. Verify database connection
3. Pastikan semua dependencies terinstall
4. Check file permissions untuk backup directory 