# 🍳 Recipe SQL Parser Project

## 📖 Quick Overview

Project ini berisi tools untuk mem-parse dan mengimport data resep dari file SQL ke database menggunakan Prisma ORM. Parser dapat menangani **100 resep** lengkap dengan struktur data yang kompleks.

## 🚀 Quick Start

```bash
# 1. Masuk ke direktori scripts
cd scripts

# 2. Jalankan parser (mode default)
node parseSQLToDatabase.js

# 3. Verifikasi hasil
npx prisma studio
```

## 📊 Hasil Parser

| Data Type | Jumlah | Deskripsi |
|-----------|--------|-----------|
| **Receipts** | 100 | Resep utama |
| **Ingredients** | 1,075 | Bahan-bahan |
| **Steps** | 560 | Langkah memasak |
| **Step Images** | 935 | Gambar panduan |

## 🎯 Use Cases

- **Data Migration**: Import bulk recipe data ke database baru
- **Data Backup/Restore**: Backup dan restore data resep
- **Development**: Populate database dengan sample data untuk testing
- **Content Management**: Import data resep dari sumber eksternal

## 📋 Mode Operasi

| Command | Fungsi | Use Case |
|---------|--------|----------|
| `node parseSQLToDatabase.js` | Parse + Insert | Production import |
| `node parseSQLToDatabase.js test` | Parse only | Debugging/Preview |
| `node parseSQLToDatabase.js clear` | Clear database | Reset data |

## 📁 File Structure

```
project-root/
├── scripts/
│   ├── README.md                  # 📖 Dokumentasi lengkap
│   ├── parseSQLToDatabase.js      # 🔧 Main script
│   ├── recipes.sql                # 📄 Data source
│   └── utils/
│       └── sqlParser.js           # ⚙️ Core parser
├── prisma/
│   └── schema.prisma              # 🗃️ Database schema
└── RECIPE_SQL_PARSER.md           # 📋 Overview ini
```

## 🔍 Features Highlights

- ✅ **100% Data Integrity**: Semua 100 resep ter-parse dengan sempurna
- ⚡ **Batch Processing**: Optimized untuk performance
- 🧪 **Test Mode**: Safe testing tanpa mengubah database
- 📁 **JSON Export**: Debug-friendly output
- 🔄 **Auto-cleanup**: Batch processing dengan progress tracking

## ⚠️ Important Notes

1. **Backup Database** sebelum running parser di production
2. **Test Mode** sangat direkomendasikan untuk validasi data
3. **File `recipes.sql`** harus ada di direktori `scripts/`
4. **Prisma Schema** harus sesuai dengan expected structure

## 🔗 Related Documentation

- [📖 Detailed Documentation](scripts/README.md) - Dokumentasi lengkap
- [🗃️ Database Schema](prisma/schema.prisma) - Prisma schema definition
- [⚙️ Parser Implementation](scripts/utils/sqlParser.js) - Core parsing logic

## 🆘 Quick Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| "File not found" | Pastikan `recipes.sql` ada di `scripts/` |
| "0 recipes parsed" | Run `node parseSQLToDatabase.js test` untuk debug |
| Database error | Check `.env` dan `npx prisma generate` |
| Memory error | Add `--max-old-space-size=4096` |

## 📞 Need Help?

1. 📖 Baca [dokumentasi lengkap](scripts/README.md)
2. 🧪 Jalankan test mode: `node parseSQLToDatabase.js test`
3. 🔍 Check logs untuk error details
4. 💾 Validate database schema dan connection

---

💡 **Pro Tip**: Selalu jalankan mode `test` terlebih dahulu untuk memastikan parsing berjalan dengan benar sebelum insert ke production database! 