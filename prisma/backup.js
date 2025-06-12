const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

/**
 * Function untuk backup semua data dari database
 */
async function backupDatabase() {
  try {
    console.log('🔄 Memulai backup database...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backups');
    
    // Buat folder backup jika belum ada
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }
    
    // Backup semua data
    console.log('📊 Mengambil data dari database...');
    
    const [
      userProfiles,
      bmiRecords,
      idealTargets,
      receipts,
      ingredients,
      steps,
      stepImages,
      histories
    ] = await Promise.all([
      prisma.userProfile.findMany({
        include: {
          bmiRecords: {
            include: {
              idealTargets: true
            }
          },
          History: true
        }
      }),
      prisma.bMIRecord.findMany({
        include: {
          idealTargets: true,
          userProfile: true
        }
      }),
      prisma.idealTargets.findMany({
        include: {
          bmiRecord: true
        }
      }),
      prisma.receipt.findMany({
        include: {
          ingredients: true,
          steps: {
            include: {
              images: true
            }
          },
          History: true
        }
      }),
      prisma.ingredient.findMany({
        include: {
          receipt: true
        }
      }),
      prisma.step.findMany({
        include: {
          receipt: true,
          images: true
        }
      }),
      prisma.stepImage.findMany({
        include: {
          step: true
        }
      }),
      prisma.history.findMany({
        include: {
          user: true,
          receipt: true
        }
      })
    ]);
    
    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        tables: [
          'UserProfile',
          'BMIRecord', 
          'IdealTargets',
          'Receipt',
          'Ingredient',
          'Step',
          'StepImage',
          'History'
        ]
      },
      data: {
        userProfiles,
        bmiRecords,
        idealTargets,
        receipts,
        ingredients,
        steps,
        stepImages,
        histories
      },
      counts: {
        userProfiles: userProfiles.length,
        bmiRecords: bmiRecords.length,
        idealTargets: idealTargets.length,
        receipts: receipts.length,
        ingredients: ingredients.length,
        steps: steps.length,
        stepImages: stepImages.length,
        histories: histories.length
      }
    };
    
    // Simpan backup ke file
    const backupFileName = `backup-${timestamp}.json`;
    const backupFilePath = path.join(backupDir, backupFileName);
    
    await fs.writeFile(backupFilePath, JSON.stringify(backupData, null, 2));
    
    console.log('✅ Backup berhasil disimpan!');
    console.log(`📁 File backup: ${backupFilePath}`);
    console.log('📊 Data yang dibackup:');
    console.log(`   - UserProfiles: ${backupData.counts.userProfiles}`);
    console.log(`   - BMIRecords: ${backupData.counts.bmiRecords}`);
    console.log(`   - IdealTargets: ${backupData.counts.idealTargets}`);
    console.log(`   - Receipts: ${backupData.counts.receipts}`);
    console.log(`   - Ingredients: ${backupData.counts.ingredients}`);
    console.log(`   - Steps: ${backupData.counts.steps}`);
    console.log(`   - StepImages: ${backupData.counts.stepImages}`);
    console.log(`   - Histories: ${backupData.counts.histories}`);
    
    return backupFilePath;
    
  } catch (error) {
    console.error('❌ Error saat backup:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Function untuk restore data dari backup file
 */
async function restoreDatabase(backupFilePath) {
  try {
    console.log('🔄 Memulai restore database...');
    console.log(`📁 Menggunakan backup: ${backupFilePath}`);
    
    // Baca file backup
    const backupContent = await fs.readFile(backupFilePath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    // Verifikasi struktur backup
    if (!backupData.data || !backupData.metadata) {
      throw new Error('Format backup file tidak valid');
    }
    
    console.log('🗑️ Menghapus data yang ada...');
    
    // Hapus data dalam urutan yang benar (reverse dependency)
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
    
    console.log('📝 Memulai restore data...');
    
    // Restore data dalam urutan yang benar
    const { data } = backupData;
    
    // 1. UserProfiles
    if (data.userProfiles && data.userProfiles.length > 0) {
      console.log(`   Restoring ${data.userProfiles.length} UserProfiles...`);
      const userProfilesData = data.userProfiles.map(user => {
        const { bmiRecords, History, ...userData } = user;
        return userData;
      });
      await prisma.userProfile.createMany({ data: userProfilesData });
    }
    
    // 2. Receipts
    if (data.receipts && data.receipts.length > 0) {
      console.log(`   Restoring ${data.receipts.length} Receipts...`);
      const receiptsData = data.receipts.map(receipt => {
        const { ingredients, steps, History, ...receiptData } = receipt;
        return receiptData;
      });
      await prisma.receipt.createMany({ data: receiptsData });
    }
    
    // 3. BMIRecords
    if (data.bmiRecords && data.bmiRecords.length > 0) {
      console.log(`   Restoring ${data.bmiRecords.length} BMIRecords...`);
      const bmiRecordsData = data.bmiRecords.map(record => {
        const { idealTargets, userProfile, ...recordData } = record;
        return recordData;
      });
      await prisma.bMIRecord.createMany({ data: bmiRecordsData });
    }
    
    // 4. IdealTargets
    if (data.idealTargets && data.idealTargets.length > 0) {
      console.log(`   Restoring ${data.idealTargets.length} IdealTargets...`);
      const idealTargetsData = data.idealTargets.map(target => {
        const { bmiRecord, ...targetData } = target;
        return targetData;
      });
      await prisma.idealTargets.createMany({ data: idealTargetsData });
    }
    
    // 5. Ingredients
    if (data.ingredients && data.ingredients.length > 0) {
      console.log(`   Restoring ${data.ingredients.length} Ingredients...`);
      const ingredientsData = data.ingredients.map(ingredient => {
        const { receipt, ...ingredientData } = ingredient;
        return ingredientData;
      });
      await prisma.ingredient.createMany({ data: ingredientsData });
    }
    
    // 6. Steps
    if (data.steps && data.steps.length > 0) {
      console.log(`   Restoring ${data.steps.length} Steps...`);
      const stepsData = data.steps.map(step => {
        const { receipt, images, ...stepData } = step;
        return stepData;
      });
      await prisma.step.createMany({ data: stepsData });
    }
    
    // 7. StepImages
    if (data.stepImages && data.stepImages.length > 0) {
      console.log(`   Restoring ${data.stepImages.length} StepImages...`);
      const stepImagesData = data.stepImages.map(image => {
        const { step, ...imageData } = image;
        return imageData;
      });
      await prisma.stepImage.createMany({ data: stepImagesData });
    }
    
    // 8. Histories
    if (data.histories && data.histories.length > 0) {
      console.log(`   Restoring ${data.histories.length} Histories...`);
      const historiesData = data.histories.map(history => {
        const { user, receipt, ...historyData } = history;
        return historyData;
      });
      await prisma.history.createMany({ data: historiesData });
    }
    
    console.log('✅ Restore database berhasil!');
    
  } catch (error) {
    console.error('❌ Error saat restore:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line handling
const command = process.argv[2];
const backupFile = process.argv[3];

switch (command) {
  case 'backup':
    backupDatabase();
    break;
  case 'restore':
    if (!backupFile) {
      console.error('❌ Harap berikan path file backup: node backup.js restore <backup-file>');
      process.exit(1);
    }
    restoreDatabase(backupFile);
    break;
  default:
    console.log('Usage:');
    console.log('  node backup.js backup    - Backup semua data');
    console.log('  node backup.js restore <file> - Restore data dari backup file');
    break;
}

module.exports = {
  backupDatabase,
  restoreDatabase
}; 