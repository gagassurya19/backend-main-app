const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Pre-generate UUIDs untuk consistency
const userIds = {
  john: uuidv4(),
  jane: uuidv4(),  
  google: uuidv4()
};

const receiptIds = {
  nasiGoreng: uuidv4(),
  gadoGado: uuidv4(),
  sotoAyam: uuidv4()
};

/**
 * Hash password function
 */
async function hashPassword(password) {
  if (!password) return null;
  return await bcrypt.hash(password, 10);
}

/**
 * Fix seeding dengan UUID proper
 */
async function seedWithProperUUIDs() {
  try {
    console.log('🔧 Fixing seed data dengan UUID proper...');
    
    // 1. Clear existing data
    console.log('🗑️ Clearing existing seed data...');
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
    
    // 2. Create new data dengan UUID
    console.log('📝 Creating new data dengan proper UUIDs...');
    
    // UserProfiles dengan UUID
    const users = [
      {
        id: userIds.john,
        userAlias: 'john_doe_001',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: await hashPassword('password123'),
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
        id: userIds.jane,
        userAlias: 'jane_smith_002',
        email: 'jane.smith@example.com',
        username: 'janesmith',
        password: await hashPassword('password456'),
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
        id: userIds.google,
        userAlias: 'google_user_003',
        email: 'googleuser@gmail.com',
        username: 'googleuser',
        password: null,
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
    ];

    // Receipts dengan UUID
    const receipts = [
      {
        id: receiptIds.nasiGoreng,
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
        id: receiptIds.gadoGado,
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
        id: receiptIds.sotoAyam,
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
    ];

    // Insert users
    console.log('   Inserting Users...');
    await prisma.userProfile.createMany({ data: users });

    // Insert receipts
    console.log('   Inserting Receipts...');
    await prisma.receipt.createMany({ data: receipts });

    // Generate related data dengan UUID
    const ingredients = [];
    const steps = [];
    const stepImages = [];

    receipts.forEach(receipt => {
      const bahanList = JSON.parse(receipt.labelBahan);
      
      // Ingredients dengan UUID
      bahanList.forEach(bahan => {
        ingredients.push({
          id: uuidv4(),
          receiptId: receipt.id,
          bahan
        });
      });

      // Steps dengan UUID
      const stepCount = Math.floor(Math.random() * 3) + 3; // 3-5 steps
      for (let i = 1; i <= stepCount; i++) {
        const stepId = uuidv4();
        steps.push({
          id: stepId,
          receiptId: receipt.id,
          stepNumber: i,
          description: `Langkah ${i} untuk ${receipt.judul}`
        });

        // Step images dengan UUID
        const imageCount = Math.random() > 0.5 ? 2 : 1;
        for (let j = 1; j <= imageCount; j++) {
          stepImages.push({
            id: uuidv4(),
            stepId: stepId,
            url: `https://example.com/steps/${receipt.id}/step-${i}-${j}.jpg`,
            order: j
          });
        }
      }
    });

    // BMI Records dengan UUID
    const bmiRecords = users.map(user => {
      const bmi = user.weight / Math.pow(user.height / 100, 2);
      return {
        id: uuidv4(),
        date: new Date(),
        height: user.height,
        weight: user.weight,
        age: new Date().getFullYear() - new Date(user.birthDate).getFullYear(),
        gender: user.gender,
        activityLevel: user.activityLevel,
        bmi: Math.round(bmi * 100) / 100,
        category: bmi < 18.5 ? 'Underweight' : bmi >= 25 ? 'Overweight' : 'Normal',
        healthStatus: bmi < 18.5 ? 'Kurang Berat Badan' : bmi >= 25 ? 'Kelebihan Berat Badan' : 'Sehat',
        targetCalories: user.targetCalories,
        hasGoals: true,
        userId: user.id
      };
    });

    // Ideal targets dengan UUID
    const idealTargets = bmiRecords.map(record => ({
      id: uuidv4(),
      weightRange: `${record.weight - 5} - ${record.weight + 5} kg`,
      targetWeight: record.weight,
      targetBMI: '18.5 - 24.9',
      targetCalories: record.targetCalories,
      timeEstimate: '3-6 bulan',
      bmiRecordId: record.id
    }));

    // Histories dengan UUID
    const histories = [];
    const categories = ['Sarapan', 'Makan Siang', 'Makan Malam', 'Snack'];
    
    users.forEach(user => {
      for (let i = 0; i < 3; i++) {
        const randomReceipt = receipts[Math.floor(Math.random() * receipts.length)];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        histories.push({
          id: uuidv4(),
          userId: user.id,
          receiptId: randomReceipt.id,
          detectedLabels: randomReceipt.labelBahan,
          photoUrl: `https://example.com/detection/${user.userAlias}-${i + 1}.jpg`,
          selectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          category: randomCategory,
          notes: `Makan ${randomReceipt.judul} untuk ${randomCategory.toLowerCase()}`,
          bahanUtama: randomReceipt.labelBahan,
          bahanKurang: JSON.stringify([])
        });
      }
    });

    // Insert all data
    console.log('   Inserting BMI Records...');
    await prisma.bMIRecord.createMany({ data: bmiRecords });

    console.log('   Inserting Ideal Targets...');
    await prisma.idealTargets.createMany({ data: idealTargets });

    console.log('   Inserting Ingredients...');
    await prisma.ingredient.createMany({ data: ingredients });

    console.log('   Inserting Steps...');
    await prisma.step.createMany({ data: steps });

    console.log('   Inserting Step Images...');
    await prisma.stepImage.createMany({ data: stepImages });

    console.log('   Inserting Histories...');
    await prisma.history.createMany({ data: histories });

    // Show sample data untuk testing
    const sampleHistories = await prisma.history.findMany({
      take: 5,
      include: {
        user: { select: { userAlias: true, firstName: true, lastName: true } },
        receipt: { select: { judul: true } }
      }
    });

    console.log('✅ Seeding dengan UUID berhasil!');
    console.log('');
    console.log('🧪 Sample History IDs untuk testing:');
    console.log('=====================================');
    
    sampleHistories.forEach((history, index) => {
      console.log(`${index + 1}. ID: ${history.id}`);
      console.log(`   User: ${history.user.firstName} ${history.user.lastName}`);
      console.log(`   Recipe: ${history.receipt.judul}`);
      console.log(`   CURL Test:`);
      console.log(`   curl -X GET "http://localhost:3000/history/${history.id}" \\`);
      console.log(`     -H "authorization: Bearer YOUR_TOKEN"`);
      console.log('');
    });

    console.log('🔑 Login untuk mendapatkan token:');
    console.log('================================');
    console.log('curl -X POST "http://localhost:3000/auth/login" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email": "john.doe@example.com", "password": "password123"}\'');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedWithProperUUIDs();