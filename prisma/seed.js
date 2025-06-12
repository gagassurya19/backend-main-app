const { PrismaClient } = require('@prisma/client');
const { backupDatabase } = require('./backup');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

/**
 * Sample data untuk seeding
 */
const seedData = {
  // Sample UserProfiles
  userProfiles: [
    {
      id: 'user-sample-1',
      userAlias: 'john_doe_001',
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'hashedpassword123', // akan di-hash
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
      password: 'hashedpassword456', // akan di-hash
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
      userAlias: 'google_user_003',
      email: 'googleuser@gmail.com',
      username: 'googleuser',
      password: null, // Google OAuth user
      avatar: 'https://lh3.googleusercontent.com/sample-avatar',
      firstName: 'Google',
      lastName: 'User',
      birthDate: new Date('1988-07-10'),
      gender: 'male',
      height: 180,
      weight: 75,
      targetCalories: 2200,
      activityLevel: 'light',
      authProvider: 'google',
      providerId: 'google_123456789'
    }
  ],

  // Sample Receipts
  receipts: [
    {
      id: 'receipt-sample-1',
      judul: 'Nasi Goreng Sederhana',
      gambar: 'https://example.com/images/nasi-goreng.jpg',
      deskripsi: 'Nasi goreng Indonesia yang mudah dibuat dengan bahan-bahan sederhana',
      labelBahan: JSON.stringify(['nasi', 'telur', 'bawang merah', 'bawang putih', 'kecap manis', 'garam']),
      metodeMemasak: JSON.stringify(['tumis', 'goreng']),
      kalori: 350.5,
      protein: 12.5,
      lemak: 8.2,
      karbohidrat: 58.3
    },
    {
      id: 'receipt-sample-2',
      judul: 'Gado-gado Jakarta',
      gambar: 'https://example.com/images/gado-gado.jpg',
      deskripsi: 'Salad Indonesia dengan bumbu kacang yang lezat',
      labelBahan: JSON.stringify(['sayuran', 'tahu', 'tempe', 'kacang tanah', 'kerupuk']),
      metodeMemasak: JSON.stringify(['rebus', 'kukus', 'goreng']),
      kalori: 280.0,
      protein: 15.8,
      lemak: 12.4,
      karbohidrat: 32.1
    },
    {
      id: 'receipt-sample-3',
      judul: 'Soto Ayam',
      gambar: 'https://example.com/images/soto-ayam.jpg',
      deskripsi: 'Sup ayam khas Indonesia dengan rempah-rempah',
      labelBahan: JSON.stringify(['ayam', 'mie', 'tauge', 'seledri', 'bawang goreng']),
      metodeMemasak: JSON.stringify(['rebus', 'goreng']),
      kalori: 220.8,
      protein: 18.5,
      lemak: 6.8,
      karbohidrat: 25.2
    }
  ]
};

/**
 * Hash password function
 */
async function hashPassword(password) {
  if (!password) return null;
  return await bcrypt.hash(password, 10);
}

/**
 * Generate ingredients based on receipt
 */
function generateIngredients(receiptId, labelBahan) {
  const ingredients = JSON.parse(labelBahan);
  return ingredients.map((bahan, index) => ({
    id: `ingredient-${receiptId}-${index + 1}`,
    receiptId,
    bahan
  }));
}

/**
 * Generate steps for receipts
 */
function generateSteps(receiptId, receiptTitle) {
  const stepTemplates = {
    'Nasi Goreng Sederhana': [
      'Siapkan nasi putih yang sudah dingin',
      'Potong bawang merah dan bawang putih',
      'Panaskan minyak, tumis bawang hingga harum',
      'Masukkan telur, orak-arik hingga matang',
      'Tambahkan nasi, aduk rata',
      'Beri kecap manis dan garam secukupnya',
      'Aduk hingga semua tercampur rata',
      'Angkat dan sajikan'
    ],
    'Gado-gado Jakarta': [
      'Rebus sayuran seperti kangkung dan kol',
      'Goreng tahu dan tempe hingga kecoklatan',
      'Haluskan bumbu kacang',
      'Susun sayuran dalam piring',
      'Siram dengan bumbu kacang',
      'Tambahkan kerupuk sebagai pelengkap'
    ],
    'Soto Ayam': [
      'Rebus ayam dengan rempah-rempah',
      'Suwir-suwir daging ayam',
      'Rebus mie hingga matang',
      'Siapkan tauge dan seledri',
      'Susun mie dan ayam dalam mangkuk',
      'Siram dengan kuah kaldu panas',
      'Taburi bawang goreng dan seledri'
    ]
  };

  const steps = stepTemplates[receiptTitle] || ['Langkah masak default'];
  
  return steps.map((description, index) => ({
    id: `step-${receiptId}-${index + 1}`,
    receiptId,
    stepNumber: index + 1,
    description
  }));
}

/**
 * Generate step images
 */
function generateStepImages(steps) {
  const stepImages = [];
  
  steps.forEach((step, stepIndex) => {
    // Generate 1-2 images per step
    const imageCount = Math.random() > 0.5 ? 2 : 1;
    
    for (let i = 0; i < imageCount; i++) {
      stepImages.push({
        id: `stepimage-${step.id}-${i + 1}`,
        stepId: step.id,
        url: `https://example.com/steps/${step.receiptId}/step-${step.stepNumber}-${i + 1}.jpg`,
        order: i + 1
      });
    }
  });
  
  return stepImages;
}

/**
 * Generate BMI Records
 */
function generateBMIRecords(userProfiles) {
  return userProfiles.map((user, index) => {
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
    // Generate 2-3 histories per user
    const historyCount = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < historyCount; i++) {
      const randomReceipt = receipts[Math.floor(Math.random() * receipts.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      histories.push({
        id: `history-${user.id}-${i + 1}`,
        userId: user.id,
        receiptId: randomReceipt.id,
        detectedLabels: randomReceipt.labelBahan,
        photoUrl: `https://example.com/detection/${user.id}-${i + 1}.jpg`,
        selectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random dalam 7 hari terakhir
        category: randomCategory,
        notes: `Makan ${randomReceipt.judul} untuk ${randomCategory.toLowerCase()}`,
        bahanUtama: JSON.stringify(['bahan1', 'bahan2', 'bahan3']),
        bahanKurang: JSON.stringify(['bahan4', 'bahan5'])
      });
    }
  });
  
  return histories;
}

/**
 * Main seed function dengan backup otomatis
 */
async function seed() {
  try {
    console.log('🌱 Memulai proses seeding...');
    
    // 1. Backup data yang ada
    console.log('💾 Melakukan backup data yang ada...');
    const backupFilePath = await backupDatabase();
    console.log(`✅ Backup selesai: ${backupFilePath}`);
    
    // 2. Hash passwords
    console.log('🔐 Memproses password...');
    for (const user of seedData.userProfiles) {
      if (user.password) {
        user.password = await hashPassword(user.password);
      }
    }
    
    // 3. Generate additional data
    console.log('🔧 Menggenerate data tambahan...');
    
    // Generate ingredients
    const allIngredients = [];
    seedData.receipts.forEach(receipt => {
      const ingredients = generateIngredients(receipt.id, receipt.labelBahan);
      allIngredients.push(...ingredients);
    });
    
    // Generate steps
    const allSteps = [];
    seedData.receipts.forEach(receipt => {
      const steps = generateSteps(receipt.id, receipt.judul);
      allSteps.push(...steps);
    });
    
    // Generate step images
    const allStepImages = generateStepImages(allSteps);
    
    // Generate BMI records
    const bmiRecords = generateBMIRecords(seedData.userProfiles);
    
    // Generate ideal targets
    const idealTargets = generateIdealTargets(bmiRecords);
    
    // Generate histories
    const histories = generateHistories(seedData.userProfiles, seedData.receipts);
    
    console.log('📊 Data yang akan di-seed:');
    console.log(`   - UserProfiles: ${seedData.userProfiles.length}`);
    console.log(`   - Receipts: ${seedData.receipts.length}`);
    console.log(`   - Ingredients: ${allIngredients.length}`);
    console.log(`   - Steps: ${allSteps.length}`);
    console.log(`   - StepImages: ${allStepImages.length}`);
    console.log(`   - BMIRecords: ${bmiRecords.length}`);
    console.log(`   - IdealTargets: ${idealTargets.length}`);
    console.log(`   - Histories: ${histories.length}`);
    
    // 4. Insert data ke database
    console.log('📝 Memulai insert data ke database...');
    
    // Insert dalam urutan yang benar untuk menjaga referential integrity
    
    // UserProfiles first
    console.log('   Inserting UserProfiles...');
    await prisma.userProfile.createMany({
      data: seedData.userProfiles,
      skipDuplicates: true
    });
    
    // Receipts
    console.log('   Inserting Receipts...');
    await prisma.receipt.createMany({
      data: seedData.receipts,
      skipDuplicates: true
    });
    
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
    await prisma.ingredient.createMany({
      data: allIngredients,
      skipDuplicates: true
    });
    
    // Steps
    console.log('   Inserting Steps...');
    await prisma.step.createMany({
      data: allSteps,
      skipDuplicates: true
    });
    
    // Step Images
    console.log('   Inserting Step Images...');
    await prisma.stepImage.createMany({
      data: allStepImages,
      skipDuplicates: true
    });
    
    // Histories
    console.log('   Inserting Histories...');
    await prisma.history.createMany({
      data: histories,
      skipDuplicates: true
    });
    
    console.log('🎉 Seeding berhasil!');
    
    // 5. Verifikasi hasil
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
    
  } catch (error) {
    console.error('❌ Error saat seeding:', error.message);
    console.log('💡 Anda dapat me-restore data dari backup jika diperlukan');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clear database function (opsional)
 */
async function clearSeedData() {
  try {
    console.log('🗑️ Menghapus seed data...');
    
    // Hapus dalam urutan reverse dependency
    await prisma.$transaction([
      prisma.history.deleteMany({
        where: {
          id: {
            startsWith: 'history-'
          }
        }
      }),
      prisma.stepImage.deleteMany({
        where: {
          id: {
            startsWith: 'stepimage-'
          }
        }
      }),
      prisma.step.deleteMany({
        where: {
          id: {
            startsWith: 'step-'
          }
        }
      }),
      prisma.ingredient.deleteMany({
        where: {
          id: {
            startsWith: 'ingredient-'
          }
        }
      }),
      prisma.idealTargets.deleteMany({
        where: {
          id: {
            startsWith: 'ideal-target-'
          }
        }
      }),
      prisma.bMIRecord.deleteMany({
        where: {
          id: {
            startsWith: 'bmi-record-'
          }
        }
      }),
      prisma.receipt.deleteMany({
        where: {
          id: {
            startsWith: 'receipt-sample-'
          }
        }
      }),
      prisma.userProfile.deleteMany({
        where: {
          id: {
            startsWith: 'user-sample-'
          }
        }
      })
    ]);
    
    console.log('✅ Seed data berhasil dihapus');
    
  } catch (error) {
    console.error('❌ Error saat menghapus seed data:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line handling
const command = process.argv[2];

switch (command) {
  case 'clear':
    clearSeedData();
    break;
  case 'seed':
  default:
    seed();
    break;
}

module.exports = {
  seed,
  clearSeedData
}; 