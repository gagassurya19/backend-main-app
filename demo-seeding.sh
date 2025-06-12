#!/bin/bash

# Demo Script untuk Database Seeding dengan Backup
# KASEP Backend API

echo "🌟 Demo Database Seeding dengan Backup - KASEP Backend API"
echo "============================================================="
echo

# Function untuk menampilkan menu
show_menu() {
    echo "Pilih opsi demo:"
    echo "1. Backup manual database"
    echo "2. Seed data sample (dengan backup otomatis)"
    echo "3. Seed data dengan resep lengkap (dengan backup otomatis)"
    echo "4. Clear seed data sample"
    echo "5. Clear semua data"
    echo "6. Restore dari backup"
    echo "7. Lihat backup files"
    echo "8. Keluar"
    echo
}

# Function untuk pause
pause() {
    echo
    read -p "Tekan Enter untuk melanjutkan..."
    echo
}

# Function untuk backup manual
backup_manual() {
    echo "🔄 Melakukan backup manual..."
    npm run db:backup
    pause
}

# Function untuk seed sample
seed_sample() {
    echo "🌱 Melakukan seeding data sample (dengan backup otomatis)..."
    echo "Data yang akan ditambahkan:"
    echo "- 3 User profiles sample"
    echo "- 3 Resep sample sederhana"
    echo "- BMI records dan ideal targets"
    echo "- Sample histories"
    echo
    
    read -p "Lanjutkan? (y/n): " confirm
    if [[ $confirm == [yY] ]]; then
        npm run db:seed
    else
        echo "Dibatalkan."
    fi
    pause
}

# Function untuk seed dengan resep
seed_recipes() {
    echo "🍽️ Melakukan seeding dengan data resep lengkap..."
    echo "Data yang akan ditambahkan:"
    echo "- 3 User profiles sample"
    echo "- ~165 Resep dari parser"
    echo "- Ingredients, steps, step images lengkap"
    echo "- BMI records dan ideal targets"
    echo "- Sample histories dengan resep yang ada"
    echo
    
    echo "❗ Pastikan data resep sudah di-parse terlebih dahulu!"
    echo "Jika belum, jalankan: cd scripts/parser-data-receipts && node parseSQLToDatabase.js test"
    echo
    
    read -p "Data resep sudah siap? Lanjutkan seeding? (y/n): " confirm
    if [[ $confirm == [yY] ]]; then
        npm run db:seed:recipes
    else
        echo "Dibatalkan."
        echo "💡 Untuk generate data resep:"
        echo "   cd scripts/parser-data-receipts"
        echo "   node parseSQLToDatabase.js test"
        echo "   cd ../.."
        echo "   npm run db:seed:recipes"
    fi
    pause
}

# Function untuk clear sample data
clear_sample() {
    echo "🗑️ Menghapus seed data sample..."
    echo "⚠️  Ini hanya akan menghapus data dengan prefix 'user-sample-', 'receipt-sample-', dll."
    echo
    
    read -p "Yakin ingin menghapus seed data sample? (y/n): " confirm
    if [[ $confirm == [yY] ]]; then
        npm run db:seed:clear
    else
        echo "Dibatalkan."
    fi
    pause
}

# Function untuk clear semua data
clear_all() {
    echo "💥 Menghapus SEMUA data..."
    echo "⚠️  PERINGATAN: Ini akan menghapus SEMUA data di database!"
    echo "   Pastikan Anda sudah melakukan backup!"
    echo
    
    read -p "Yakin ingin menghapus SEMUA data? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        npm run db:seed:recipes:clear
    else
        echo "Dibatalkan."
    fi
    pause
}

# Function untuk restore
restore_backup() {
    echo "♻️ Restore dari backup..."
    echo "Backup files yang tersedia:"
    echo
    
    if [ -d "prisma/backups" ]; then
        ls -la prisma/backups/*.json 2>/dev/null || echo "Tidak ada backup files."
    else
        echo "Folder backup tidak ditemukan."
    fi
    
    echo
    read -p "Masukkan path file backup (atau tekan Enter untuk batal): " backup_file
    
    if [[ -n "$backup_file" && -f "$backup_file" ]]; then
        echo "Restore dari: $backup_file"
        read -p "Lanjutkan? (y/n): " confirm
        if [[ $confirm == [yY] ]]; then
            npm run db:restore "$backup_file"
        else
            echo "Dibatalkan."
        fi
    else
        echo "File tidak ditemukan atau dibatalkan."
    fi
    pause
}

# Function untuk lihat backup files
list_backups() {
    echo "📁 Backup files yang tersedia:"
    echo
    
    if [ -d "prisma/backups" ]; then
        if ls prisma/backups/*.json >/dev/null 2>&1; then
            for file in prisma/backups/*.json; do
                size=$(du -h "$file" | cut -f1)
                modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file" 2>/dev/null || stat -c "%y" "$file" 2>/dev/null | cut -d' ' -f1,2 | cut -d':' -f1,2)
                echo "📄 $(basename "$file")"
                echo "   Size: $size"
                echo "   Modified: $modified"
                echo
            done
        else
            echo "Tidak ada backup files."
        fi
    else
        echo "Folder backup tidak ditemukan."
        echo "💡 Jalankan backup manual untuk membuat folder backup."
    fi
    
    pause
}

# Main loop
while true; do
    clear
    echo "🌟 Demo Database Seeding dengan Backup - KASEP Backend API"
    echo "============================================================="
    echo
    show_menu
    
    read -p "Pilih opsi (1-8): " choice
    echo
    
    case $choice in
        1)
            backup_manual
            ;;
        2)
            seed_sample
            ;;
        3)
            seed_recipes
            ;;
        4)
            clear_sample
            ;;
        5)
            clear_all
            ;;
        6)
            restore_backup
            ;;
        7)
            list_backups
            ;;
        8)
            echo "👋 Terima kasih telah menggunakan demo seeding!"
            echo "📖 Baca dokumentasi lengkap di: prisma/SEEDING.md"
            exit 0
            ;;
        *)
            echo "❌ Pilihan tidak valid."
            pause
            ;;
    esac
done 