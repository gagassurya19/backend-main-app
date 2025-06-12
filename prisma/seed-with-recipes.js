const { PrismaClient } = require('@prisma/client');
const { backupDatabase } = require('./backup');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

/**
 * Sample user data
 */
const sampleUsers = [
  {
    id: 'user-sample-1',
    userAlias: 'john_doe_001',
    email: 'john.doe@example.com',
    username: 'johndoe',
    password: 'password123', // akan di-hash
    avatar: 'https://example.com/avatars/john.jpg',
    firstName: 'John',
    lastName: 'Doe',
    birthDate: new Date('1990-01-15'),
    gender: 'male',
    height: 175,
    weight: 70,
    targetCalories: 2000,
    activityLevel: 'moderate',
    authProvider: 'local'
  },
  {
    id: 'user-sample-2',
    userAlias: 'jane_smith_002',
    email: 'jane.smith@example.com',
    username: 'janesmith',
    password: 'password456', // akan di-hash
    avatar: 'https://example.com/avatars/jane.jpg',
    firstName: 'Jane',
    lastName: 'Smith',
    birthDate: new Date('1992-03-22'),
    gender: 'female',
    height: 165,
    weight: 60,
    targetCalories: 1800,
    activityLevel: 'active',
    authProvider: 'local'
  },
  {
    id: 'user-sample-3',
    userAlias: 'admin_user_003',
    email: 'admin@kasep.com',
    username: 'admin',
    password: 'admin123', // akan di-hash
    avatar: 'https://example.com/avatars/admin.jpg',
    firstName: 'Admin',
    lastName: 'KASEP',
    birthDate: new Date('1985-05-10'),
    gender: 'male',
    height: 170,
    weight: 65,
    targetCalories: 1900,
    activityLevel: 'light',
    authProvider: 'local'
  }
];

/**
 * Hash password function
 */
async function hashPassword(password) {
  if (!password) return null;
  return await bcrypt.hash(password, 10);
}

/**
 * Generate BMI Records
 */
function generateBMIRecords(userProfiles) {
  return userProfiles.map((user) => {
    const bmi = user.weight / Math.pow(user.height / 100, 2);
    let category = 'Normal';
    let healthStatus = 'Sehat';
    
    if (bmi < 18.5) {
      category = 'Underweight';
      healthStatus = 'Kurang Berat Badan';
    } else if (bmi >= 25) {
      category = 'Overweight';
      healthStatus = 'Kelebihan Berat Badan';
    }
    
    return {
      id: `bmi-record-${user.id}`,
      date: new Date(),
      height: user.height,
      weight: user.weight,
      age: new Date().getFullYear() - new Date(user.birthDate).getFullYear(),
      gender: user.gender,
      activityLevel: user.activityLevel,
      bmi: Math.round(bmi * 100) / 100,
      category,
      healthStatus,
      targetCalories: user.targetCalories,
      hasGoals: true,
      userId: user.id
    };
  });
}

/**
 * Generate Ideal Targets
 */
function generateIdealTargets(bmiRecords) {
  return bmiRecords.map(record => ({
    id: `ideal-target-${record.id}`,
    weightRange: `${record.weight - 5} - ${record.weight + 5} kg`,
    targetWeight: record.weight,
    targetBMI: '18.5 - 24.9',
    targetCalories: record.targetCalories,
    timeEstimate: '3-6 bulan',
    bmiRecordId: record.id
  }));
}

/**
 * Generate sample histories
 */
function generateHistories(userProfiles, receipts) {
  const histories = [];
  const categories = ['Sarapan', 'Makan Siang', 'Makan Malam', 'Snack'];
  
  userProfiles.forEach(user => {
    // Generate 3-5 histories per user
    const historyCount = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < historyCount; i++) {
      const randomReceipt = receipts[Math.floor(Math.random() * receipts.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      histories.push({
        id: `history-${user.id}-${i + 1}`,
        userId: user.id,
        receiptId: randomReceipt.id,
        detectedLabels: randomReceipt.labelBahan,
        photoUrl: `https://example.com/detection/${user.id}-${i + 1}.jpg`,
        selectedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random dalam 30 hari terakhir
        category: randomCategory,
        notes: `Makan ${randomReceipt.judul} untuk ${randomCategory.toLowerCase()}`,
        bahanUtama: randomReceipt.labelBahan,
        bahanKurang: JSON.stringify([])
      });
    }
  });
  
  return histories;
}

/**
 * Load parsed recipes data
 */
async function loadParsedRecipes() {
  try {
    const recipesPath = path.join(__dirname, '../scripts/parser-data-receipts/parsed_recipes.json');
    
    // Check if file exists
    try {
      await fs.access(recipesPath);
    } catch {
      console.log('❌ File parsed_recipes.json tidak ditemukan');
      console.log('💡 Jalankan dulu parser untuk generate data resep:');
      console.log('   cd scripts/parser-data-receipts && node parseSQLToDatabase.js test');
      return null;
    }
    
    const data = await fs.readFile(recipesPath, 'utf8');
    const parsedData = JSON.parse(data);
    
    console.log(`✅ Loaded ${parsedData.receipts?.length || 0} receipts from parser`);
    
    return parsedData;
  } catch (error) {
    console.error('❌ Error loading parsed recipes:', error.message);
    return null;
  }
}

/**
 * Main seed function dengan backup otomatis dan data dari parser
 */
async function seedWithRecipes() {
  try {
    console.log('🌱 Memulai proses seeding dengan data resep...');
    
    // 1. Backup data yang ada
    console.log('💾 Melakukan backup data yang ada...');
    const backupFilePath = await backupDatabase();
    console.log(`✅ Backup selesai: ${backupFilePath}`);
    
    // 2. Load parsed recipes data
    console.log('📖 Memuat data resep dari parser...');
    const parsedRecipes = await loadParsedRecipes();
    
    if (!parsedRecipes) {
      throw new Error('Tidak dapat memuat data resep. Harap jalankan parser terlebih dahulu.');
    }
    
    // 3. Hash passwords untuk sample users
    console.log('🔐 Memproses password...');
    for (const user of sampleUsers) {
      if (user.password) {
        user.password = await hashPassword(user.password);
      }
    }
    
    // 4. Generate additional data
    console.log('🔧 Menggenerate data tambahan...');
    
    // Generate BMI records untuk sample users
    const bmiRecords = generateBMIRecords(sampleUsers);
    
    // Generate ideal targets
    const idealTargets = generateIdealTargets(bmiRecords);
    
    // Generate histories dengan resep yang ada
    const histories = generateHistories(sampleUsers, parsedRecipes.receipts);
    
    console.log('📊 Data yang akan di-seed:');
    console.log(`   - UserProfiles: ${sampleUsers.length}`);
    console.log(`   - Receipts: ${parsedRecipes.receipts.length}`);
    console.log(`   - Ingredients: ${parsedRecipes.ingredients.length}`);
    console.log(`   - Steps: ${parsedRecipes.steps.length}`);
    console.log(`   - StepImages: ${parsedRecipes.stepImages.length}`);
    console.log(`   - BMIRecords: ${bmiRecords.length}`);
    console.log(`   - IdealTargets: ${idealTargets.length}`);
    console.log(`   - Histories: ${histories.length}`);
    
    // 5. Insert data ke database dalam urutan yang benar
    console.log('📝 Memulai insert data ke database...');
    
    // UserProfiles first
    console.log('   Inserting UserProfiles...');
    await prisma.userProfile.createMany({
      data: sampleUsers,
      skipDuplicates: true
    });
    
    // Receipts
    console.log('   Inserting Receipts...');
    const batchSize = 100;
    for (let i = 0; i < parsedRecipes.receipts.length; i += batchSize) {
      const batch = parsedRecipes.receipts.slice(i, i + batchSize);
      await prisma.receipt.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`     Processed ${Math.min(i + batchSize, parsedRecipes.receipts.length)}/${parsedRecipes.receipts.length} receipts`);
    }
    
    // BMI Records
    console.log('   Inserting BMI Records...');
    await prisma.bMIRecord.createMany({
      data: bmiRecords,
      skipDuplicates: true
    });
    
    // Ideal Targets
    console.log('   Inserting Ideal Targets...');
    await prisma.idealTargets.createMany({
      data: idealTargets,
      skipDuplicates: true
    });
    
    // Ingredients
    console.log('   Inserting Ingredients...');
    for (let i = 0; i < parsedRecipes.ingredients.length; i += batchSize) {
      const batch = parsedRecipes.ingredients.slice(i, i + batchSize);
      await prisma.ingredient.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`     Processed ${Math.min(i + batchSize, parsedRecipes.ingredients.length)}/${parsedRecipes.ingredients.length} ingredients`);
    }
    
    // Steps
    console.log('   Inserting Steps...');
    for (let i = 0; i < parsedRecipes.steps.length; i += batchSize) {
      const batch = parsedRecipes.steps.slice(i, i + batchSize);
      await prisma.step.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`     Processed ${Math.min(i + batchSize, parsedRecipes.steps.length)}/${parsedRecipes.steps.length} steps`);
    }
    
    // Step Images
    console.log('   Inserting Step Images...');
    for (let i = 0; i < parsedRecipes.stepImages.length; i += batchSize) {
      const batch = parsedRecipes.stepImages.slice(i, i + batchSize);
      await prisma.stepImage.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`     Processed ${Math.min(i + batchSize, parsedRecipes.stepImages.length)}/${parsedRecipes.stepImages.length} step images`);
    }
    
    // Histories
    console.log('   Inserting Histories...');
    await prisma.history.createMany({
      data: histories,
      skipDuplicates: true
    });
    
    console.log('🎉 Seeding berhasil!');
    
    // 6. Verifikasi hasil
    console.log('🔍 Verifikasi data di database:');
    const counts = await Promise.all([
      prisma.userProfile.count(),
      prisma.receipt.count(),
      prisma.ingredient.count(),
      prisma.step.count(),
      prisma.stepImage.count(),
      prisma.bMIRecord.count(),
      prisma.idealTargets.count(),
      prisma.history.count()
    ]);
    
    console.log(`   - UserProfiles: ${counts[0]}`);
    console.log(`   - Receipts: ${counts[1]}`);
    console.log(`   - Ingredients: ${counts[2]}`);
    console.log(`   - Steps: ${counts[3]}`);
    console.log(`   - StepImages: ${counts[4]}`);
    console.log(`   - BMIRecords: ${counts[5]}`);
    console.log(`   - IdealTargets: ${counts[6]}`);
    console.log(`   - Histories: ${counts[7]}`);
    
    console.log('✨ Seeding selesai! Data backup tersimpan di:', backupFilePath);
    console.log('');
    console.log('👤 Sample users yang dibuat:');
    sampleUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`);
    });
    
  } catch (error) {
    console.error('❌ Error saat seeding:', error.message);
    console.log('💡 Anda dapat me-restore data dari backup jika diperlukan');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clear all data function
 */
async function clearAllData() {
  try {
    console.log('🗑️ Menghapus semua data...');
    
    // Hapus dalam urutan reverse dependency
    await prisma.$transaction([
      prisma.history.deleteMany(),
      prisma.stepImage.deleteMany(),
      prisma.step.deleteMany(),
      prisma.ingredient.deleteMany(),
      prisma.idealTargets.deleteMany(),
      prisma.bMIRecord.deleteMany(),
      prisma.receipt.deleteMany(),
      prisma.userProfile.deleteMany()
    ]);
    
    console.log('✅ Semua data berhasil dihapus');
    
  } catch (error) {
    console.error('❌ Error saat menghapus data:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line handling
const command = process.argv[2];

switch (command) {
  case 'clear':
    clearAllData();
    break;
  case 'seed':
  default:
    seedWithRecipes();
    break;
}

module.exports = {
  seedWithRecipes,
  clearAllData
}; 