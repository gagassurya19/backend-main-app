# 📊 Recipe SQL Parser Documentation

Parser untuk mengkonversi file SQL recipes menjadi data yang dapat dimasukkan ke database menggunakan Prisma ORM.

## 📋 Daftar Isi

- [Overview](#overview)
- [Fitur](#fitur)
- [Prerequisites](#prerequisites)
- [Struktur File](#struktur-file)
- [Cara Penggunaan](#cara-penggunaan)
- [Konfigurasi](#konfigurasi)
- [Output](#output)
- [Troubleshooting](#troubleshooting)
- [Technical Details](#technical-details)

## 🔍 Overview

Scripts ini dirancang untuk mem-parse file SQL (`recipes.sql`) yang berisi data resep dengan struktur kompleks dan mengkonversinya menjadi format yang sesuai dengan skema database Prisma. Parser dapat menangani:

- **100 resep lengkap** dengan semua detail
- **Nested data structures** dalam SQL
- **Multi-line content** dengan quotes dan escape characters
- **Relasi antar tabel** (Receipt → Ingredient, Step → StepImage)

## ✨ Fitur

- 🔄 **Parsing Otomatis**: Ekstraksi otomatis dari SQL INSERT statements
- 📊 **Batch Processing**: Insert data dalam batch untuk performa optimal
- 🧪 **Test Mode**: Mode testing tanpa insert ke database
- 🗑️ **Database Cleanup**: Fungsi untuk membersihkan database
- 📁 **JSON Export**: Export hasil parsing ke file JSON untuk debugging
- 📈 **Progress Tracking**: Real-time progress monitoring saat insert
- 🔐 **Error Handling**: Comprehensive error handling dan logging

## 📋 Prerequisites

- Node.js (v14+)
- Prisma CLI
- Database yang sudah dikonfigurasi (PostgreSQL/MySQL/SQLite)
- File `recipes.sql` di direktori scripts

## 📁 Struktur File

```
scripts/
├── README.md                    # Dokumentasi ini
├── parseSQLToDatabase.js        # Main script untuk parsing dan insert
├── recipes.sql                  # File SQL sumber data
├── parsed_recipes.json          # Output JSON hasil parsing
├── test_parsed_recipes.json     # Output JSON mode testing
└── utils/
    └── sqlParser.js            # Core parser class
```

### File Utama

#### `parseSQLToDatabase.js`
Main script dengan 3 mode operasi:
- **Default/Parse**: Parsing dan insert ke database
- **Test**: Parsing only tanpa insert
- **Clear**: Membersihkan database

#### `utils/sqlParser.js`
Core parser class dengan metode:
- `parseSQL()`: Main parsing function
- `extractInsertStatements()`: Extract INSERT statements
- `parseValues()`: Parse VALUES dari statement
- `parseIngredients()`: Extract ingredients
- `parseSteps()`: Extract cooking steps
- `generateDatabaseObjects()`: Generate Prisma-compatible objects

## 🚀 Cara Penggunaan

### 1. Setup Awal

```bash
# Pastikan berada di direktori scripts
cd scripts

# Pastikan file recipes.sql ada
ls recipes.sql
```

### 2. Mode Operasi

#### **Mode Default** - Parse dan Insert ke Database
```bash
node parseSQLToDatabase.js
# atau
node parseSQLToDatabase.js parse
```

**Output:**
```
🚀 Memulai parsing file SQL...
📄 Membaca dan parsing file SQL...
✅ Berhasil parsing data:
   - 100 resep
   - 1075 bahan
   - 560 langkah
   - 935 gambar langkah
💾 Memulai proses insert ke database...
📝 Inserting receipts...
🥕 Inserting ingredients...
   Processed 100/1075 ingredients
   ...
🎉 Semua data berhasil diinsert ke database!
```

#### **Mode Test** - Parsing Only (Tanpa Insert)
```bash
node parseSQLToDatabase.js test
```

**Berguna untuk:**
- Debugging parsing logic
- Melihat struktur data hasil parsing
- Validasi data sebelum insert

#### **Mode Clear** - Bersihkan Database
```bash
node parseSQLToDatabase.js clear
```

**⚠️ HATI-HATI:** Akan menghapus semua data dari tabel:
- `stepImages`
- `steps` 
- `ingredients`
- `receipts`

### 3. Memeriksa Hasil

#### Database Verification
```bash
# Menggunakan Prisma Studio
npx prisma studio

# Atau check via code
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const count = await prisma.receipt.count();
  console.log('Total recipes:', count);
  await prisma.\$disconnect();
}
check();
"
```

#### JSON Output Files
- `parsed_recipes.json`: Full data untuk database insertion
- `test_parsed_recipes.json`: Data dari mode test

## ⚙️ Konfigurasi

### Path File SQL
Edit di `parseSQLToDatabase.js`:
```javascript
// Line ~16
const sqlFilePath = './recipes.sql';  // Sesuaikan path jika berbeda
```

### Batch Size
Edit di `parseSQLToDatabase.js`:
```javascript
// Line ~43
const batchSize = 100;  // Sesuaikan untuk performa optimal
```

### Database Schema
Pastikan schema Prisma sesuai:

```prisma
model Receipt {
  id            String @id
  judul         String
  gambar        String
  labelBahan    String
  metodeMemasak String
  kalori        Float
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  ingredients   Ingredient[]
  steps         Step[]
}

model Ingredient {
  id        String @id
  receiptId String
  bahan     String
  
  receipt   Receipt @relation(fields: [receiptId], references: [id], onDelete: Cascade)
}

model Step {
  id          String @id
  receiptId   String
  stepNumber  Int
  description String
  
  receipt     Receipt @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  images      StepImage[]
}

model StepImage {
  id     String @id
  stepId String
  url    String
  order  Int
  
  step   Step @relation(fields: [stepId], references: [id], onDelete: Cascade)
}
```

## 📊 Output

### Expected Results
Setelah parsing berhasil, Anda akan mendapat:

| Data Type | Jumlah | Deskripsi |
|-----------|--------|-----------|
| **Receipts** | 100 | Resep utama dengan metadata |
| **Ingredients** | ~1,075 | Bahan-bahan untuk setiap resep |
| **Steps** | ~560 | Langkah-langkah memasak |
| **Step Images** | ~935 | Gambar untuk langkah memasak |

### Sample Data Structure

#### Receipt
```json
{
  "id": "receipt-1",
  "judul": "Anabolic Improved Recipe Pumpkin Pie",
  "gambar": "https://img-global.cpcdn.com/recipes/...",
  "labelBahan": "[\"erythritol\", \"protein\", ...]",
  "metodeMemasak": "[\"simpan dingin\", \"campur\", ...]",
  "kalori": 1727
}
```

#### Ingredient
```json
{
  "id": "ingredient-receipt-1-1",
  "receiptId": "receipt-1",
  "bahan": "120 gram tepung almond"
}
```

#### Step
```json
{
  "id": "step-receipt-1-1",
  "receiptId": "receipt-1",
  "stepNumber": 1,
  "description": "Campurkan semua bahan kering..."
}
```

#### Step Image
```json
{
  "id": "stepimg-step-receipt-1-1-1",
  "stepId": "step-receipt-1-1",
  "url": "https://img-global.cpcdn.com/steps/...",
  "order": 1
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. **File `recipes.sql` tidak ditemukan**
```
Error: ENOENT: no such file or directory
```
**Solusi:** Pastikan file `recipes.sql` ada di direktori scripts

#### 2. **Database connection error**
```
Error: Can't reach database server
```
**Solusi:** 
- Check koneksi database di `.env`
- Pastikan database server running
- Run `npx prisma generate` dan `npx prisma db push`

#### 3. **Parsing menghasilkan 0 resep**
```
✅ Berhasil parsing data:
   - 0 resep
```
**Solusi:**
- Check format file SQL
- Pastikan ada INSERT statements dengan pattern yang benar
- Run mode test untuk debugging

#### 4. **Transaction timeout**
```
Transaction not found. Transaction ID is invalid
```
**Solusi:** Sudah diatasi dengan batch processing. Jika masih terjadi, kurangi `batchSize`

#### 5. **Memory issues dengan file SQL besar**
**Solusi:**
- Increase Node.js memory: `node --max-old-space-size=4096 parseSQLToDatabase.js`
- Split file SQL menjadi chunks kecil

### Debug Mode

Untuk debugging detailed:

```bash
# Enable debug logging
DEBUG=true node parseSQLToDatabase.js test

# Atau tambahkan console.log di parser
node -e "
const parser = require('../utils/sqlParser.js');
// Debug specific functions
"
```

### Data Validation

Validasi data setelah insert:

```javascript
// Check for duplicate IDs
SELECT id, COUNT(*) FROM receipts GROUP BY id HAVING COUNT(*) > 1;

// Check for orphaned data
SELECT * FROM ingredients WHERE receiptId NOT IN (SELECT id FROM receipts);
SELECT * FROM steps WHERE receiptId NOT IN (SELECT id FROM receipts);
SELECT * FROM step_images WHERE stepId NOT IN (SELECT id FROM steps);

// Check data completeness
SELECT 
  (SELECT COUNT(*) FROM receipts) as receipts,
  (SELECT COUNT(*) FROM ingredients) as ingredients,
  (SELECT COUNT(*) FROM steps) as steps,
  (SELECT COUNT(*) FROM step_images) as step_images;
```

## 🛠️ Technical Details

### Parsing Algorithm

1. **Statement Extraction**: Character-by-character parsing dengan tracking:
   - Parentheses depth
   - String boundaries (quotes)
   - Escape characters

2. **Value Parsing**: Handling nested structures:
   - Arrays dalam strings
   - Escaped quotes dan special characters
   - Multi-line content

3. **Data Transformation**: 
   - Clean strings dari quotes dan escapes
   - Extract images dari step descriptions
   - Generate unique IDs dengan proper relationships

### Performance Optimizations

- **Batch Processing**: Insert dalam chunks 100 items
- **Skip Duplicates**: Flag `skipDuplicates` pada insert
- **Memory Efficient**: Stream-based processing untuk file besar
- **Progress Tracking**: Real-time progress untuk monitoring

### Security Considerations

- **SQL Injection**: Parser tidak mengeksekusi SQL langsung
- **Path Traversal**: Validasi path file input
- **Memory DoS**: Limits pada file size dan parsing depth

## 📞 Support

Jika mengalami issues:

1. **Check logs** untuk error messages specific
2. **Run test mode** untuk isolasi masalah parsing
3. **Validate schema** Prisma dan database connection
4. **Check file format** dari `recipes.sql`

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Compatibility:** Node.js 14+, Prisma 4+ 