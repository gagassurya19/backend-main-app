const { PrismaClient } = require('@prisma/client');
const RecipeSQLParser = require('./sqlParser');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Main function untuk parsing SQL dan insert ke database
 */
async function main() {
  try {
    console.log('🚀 Memulai parsing file SQL...');
    
    // Initialize parser
    const parser = new RecipeSQLParser();
    
    // Path ke file SQL (sesuaikan dengan lokasi file Anda)
    const sqlFilePath = './recipes.sql';
    
    console.log('📄 Membaca dan parsing file SQL...');
    
    // Parse SQL file
    const parsedData = await parser.parseSQL(sqlFilePath);
    
    console.log(`✅ Berhasil parsing data:`);
    console.log(`   - ${parsedData.receipts.length} resep`);
    console.log(`   - ${parsedData.ingredients.length} bahan`);
    console.log(`   - ${parsedData.steps.length} langkah`);
    console.log(`   - ${parsedData.stepImages.length} gambar langkah`);
    
    // Generate database objects
    const databaseObjects = parser.generateDatabaseObjects(parsedData);
    
    // Optional: Save ke JSON untuk debugging
    await parser.saveToJSON(databaseObjects, 'parsed_recipes.json');
    
    console.log('💾 Memulai proses insert ke database...');
    
    // Insert data ke database dalam batch untuk menghindari timeout
    try {
      // 1. Insert Receipts terlebih dahulu
      console.log('📝 Inserting receipts...');
      await prisma.receipt.createMany({
        data: databaseObjects.receipts,
        skipDuplicates: true
      });
      
      // 2. Insert Ingredients dalam batch
      console.log('🥕 Inserting ingredients...');
      const batchSize = 100;
      for (let i = 0; i < databaseObjects.ingredients.length; i += batchSize) {
        const batch = databaseObjects.ingredients.slice(i, i + batchSize);
        await prisma.ingredient.createMany({
          data: batch,
          skipDuplicates: true
        });
        console.log(`   Processed ${Math.min(i + batchSize, databaseObjects.ingredients.length)}/${databaseObjects.ingredients.length} ingredients`);
      }
      
      // 3. Insert Steps dalam batch
      console.log('👣 Inserting steps...');
      for (let i = 0; i < databaseObjects.steps.length; i += batchSize) {
        const batch = databaseObjects.steps.slice(i, i + batchSize);
        await prisma.step.createMany({
          data: batch,
          skipDuplicates: true
        });
        console.log(`   Processed ${Math.min(i + batchSize, databaseObjects.steps.length)}/${databaseObjects.steps.length} steps`);
      }
      
      // 4. Insert Step Images dalam batch
      console.log('🖼️ Inserting step images...');
      for (let i = 0; i < databaseObjects.stepImages.length; i += batchSize) {
        const batch = databaseObjects.stepImages.slice(i, i + batchSize);
        await prisma.stepImage.createMany({
          data: batch,
          skipDuplicates: true
        });
        console.log(`   Processed ${Math.min(i + batchSize, databaseObjects.stepImages.length)}/${databaseObjects.stepImages.length} step images`);
      }
    } catch (dbError) {
      console.error('❌ Database insertion error:', dbError.message);
      throw dbError;
    }
    
    console.log('🎉 Semua data berhasil diinsert ke database!');
    
    // Verifikasi hasil
    const totalReceipts = await prisma.receipt.count();
    const totalIngredients = await prisma.ingredient.count();
    const totalSteps = await prisma.step.count();
    const totalStepImages = await prisma.stepImage.count();
    
    console.log('📊 Verifikasi data di database:');
    console.log(`   - Receipts: ${totalReceipts}`);
    console.log(`   - Ingredients: ${totalIngredients}`);
    console.log(`   - Steps: ${totalSteps}`);
    console.log(`   - StepImages: ${totalStepImages}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Function untuk clear semua data (optional)
 */
async function clearDatabase() {
  try {
    console.log('🗑️ Clearing database...');
    
    await prisma.$transaction([
      prisma.stepImage.deleteMany(),
      prisma.step.deleteMany(),
      prisma.ingredient.deleteMany(),
      prisma.receipt.deleteMany()
    ]);
    
    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
  }
}

/**
 * Function untuk testing parsing saja tanpa insert
 */
async function testParsing() {
  try {
    console.log('🧪 Testing parsing only...');
    
    const parser = new RecipeSQLParser();
    const sqlFilePath = './recipes.sql';
    
    const parsedData = await parser.parseSQL(sqlFilePath);
    const databaseObjects = parser.generateDatabaseObjects(parsedData);
    
    // Save hasil parsing ke JSON
    await parser.saveToJSON(databaseObjects, 'test_parsed_recipes.json');
    
    console.log('✅ Parsing test completed! Check test_parsed_recipes.json');
    
    // Show sample data
    console.log('\n📋 Sample Receipt:');
    console.log(JSON.stringify(databaseObjects.receipts[0], null, 2));
    
    console.log('\n🥕 Sample Ingredients:');
    console.log(JSON.stringify(databaseObjects.ingredients.slice(0, 3), null, 2));
    
    console.log('\n👣 Sample Steps:');
    console.log(JSON.stringify(databaseObjects.steps.slice(0, 2), null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Command line handling
const command = process.argv[2];

switch (command) {
  case 'clear':
    clearDatabase();
    break;
  case 'test':
    testParsing();
    break;
  case 'parse':
  default:
    main();
    break;
}

module.exports = {
  main,
  clearDatabase,
  testParsing
}; 