const fs = require('fs');
const path = require('path');

/**
 * Parser untuk mengubah file SQL recipes.sql menjadi objek-objek untuk database
 */
class RecipeSQLParser {
  constructor() {
    this.receipts = [];
    this.ingredients = [];
    this.steps = [];
    this.stepImages = [];
  }

  /**
   * Parse file SQL dan mengubahnya menjadi objek-objek database
   * @param {string} sqlFilePath - Path ke file recipes.sql
   * @returns {Object} - Objek berisi semua data yang sudah diparsing
   */
  async parseSQL(sqlFilePath) {
    try {
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
      
      // Extract INSERT statements untuk tabel receipts
      const insertStatements = this.extractInsertStatements(sqlContent);
      
      // Parse setiap INSERT statement
      insertStatements.forEach((statement, index) => {
        this.parseInsertStatement(statement, index);
      });

      return {
        receipts: this.receipts,
        ingredients: this.ingredients,
        steps: this.steps,
        stepImages: this.stepImages
      };
    } catch (error) {
      throw new Error(`Error parsing SQL file: ${error.message}`);
    }
  }

  /**
   * Extract semua INSERT statements dari content SQL
   * @param {string} sqlContent - Isi file SQL
   * @returns {Array} - Array berisi INSERT statements
   */
  extractInsertStatements(sqlContent) {
    const statements = [];
    let index = 0;
    
    while (index < sqlContent.length) {
      // Find next INSERT statement
      const insertStart = sqlContent.indexOf('INSERT INTO receipts', index);
      if (insertStart === -1) break;
      
      // Find VALUES position
      const valuesStart = sqlContent.indexOf('VALUES', insertStart);
      if (valuesStart === -1) break;
      
      // Find opening parenthesis after VALUES
      const openParenIndex = sqlContent.indexOf('(', valuesStart);
      if (openParenIndex === -1) break;
      
      // Parse to find matching closing parenthesis and semicolon
      let parenDepth = 0;
      let inString = false;
      let stringChar = '';
      let currentIndex = openParenIndex;
      
      while (currentIndex < sqlContent.length) {
        const char = sqlContent[currentIndex];
        const nextChar = sqlContent[currentIndex + 1];
        
        if (!inString && (char === "'" || char === '"')) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar) {
          // Check for escaped quotes
          if (nextChar === stringChar) {
            currentIndex++; // Skip next character
          } else {
            inString = false;
          }
        } else if (!inString && char === '(') {
          parenDepth++;
        } else if (!inString && char === ')') {
          parenDepth--;
          if (parenDepth === 0) {
            // Found the closing parenthesis, now look for semicolon
            const semicolonIndex = sqlContent.indexOf(';', currentIndex);
            if (semicolonIndex !== -1) {
              // Extract the values part (content between parentheses)
              const valuesContent = sqlContent.substring(openParenIndex + 1, currentIndex);
              statements.push(valuesContent);
              index = semicolonIndex + 1;
              break;
            }
          }
        }
        currentIndex++;
      }
      
      // Safety check to prevent infinite loop
      if (currentIndex >= sqlContent.length) {
        index = sqlContent.length;
      }
    }
    
    return statements;
  }

  /**
   * Parse single INSERT statement dan ekstrak data
   * @param {string} statement - INSERT VALUES statement
   * @param {number} index - Index untuk ID generation
   */
  parseInsertStatement(statement, index) {
    try {
      // Parse VALUES dengan handling untuk string yang mengandung koma
      const values = this.parseValues(statement);
      
      if (values.length >= 7) {
        const receiptId = `receipt-${index + 1}`;
        
        // Create receipt object
        const receipt = {
          id: receiptId,
          judul: this.cleanString(values[0]),
          gambar: this.cleanString(values[1]),
          labelBahan: this.cleanString(values[4]),
          metodeMemasak: this.cleanString(values[5]),
          kalori: parseFloat(values[6]) || 0
        };

        this.receipts.push(receipt);

        // Parse ingredients dari field "Bahan"
        const bahanText = this.cleanString(values[2]);
        this.parseIngredients(receiptId, bahanText);

        // Parse steps dari field "Langkah"
        const langkahText = this.cleanString(values[3]);
        this.parseSteps(receiptId, langkahText);
      }
    } catch (error) {
      console.error(`Error parsing statement ${index}: ${error.message}`);
    }
  }

  /**
   * Parse VALUES dari INSERT statement dengan handling untuk string kompleks
   * @param {string} statement - VALUES statement
   * @returns {Array} - Array nilai-nilai yang sudah diparsing
   */
  parseValues(statement) {
    const values = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let bracketDepth = 0;
    let parenDepth = 0;
    
    for (let i = 0; i < statement.length; i++) {
      const char = statement[i];
      const nextChar = statement[i + 1];
      
      if (!inString && (char === "'" || char === '"')) {
        inString = true;
        stringChar = char;
        current += char;
      } else if (inString && char === stringChar) {
        // Check for escaped quotes (two consecutive quotes)
        if (nextChar === stringChar) {
          current += char + nextChar;
          i++; // Skip next character
        } else {
          inString = false;
          current += char;
        }
      } else if (!inString && char === '[') {
        bracketDepth++;
        current += char;
      } else if (!inString && char === ']') {
        bracketDepth--;
        current += char;
      } else if (!inString && char === '(') {
        parenDepth++;
        current += char;
      } else if (!inString && char === ')') {
        parenDepth--;
        current += char;
      } else if (!inString && char === ',' && bracketDepth === 0 && parenDepth === 0) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      values.push(current.trim());
    }
    
    return values;
  }

  /**
   * Parse ingredients dari text bahan
   * @param {string} receiptId - ID resep
   * @param {string} bahanText - Text berisi daftar bahan
   */
  parseIngredients(receiptId, bahanText) {
    // Split berdasarkan '; ' dan filter yang kosong
    const bahanItems = bahanText.split(/[;\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    bahanItems.forEach((bahan, index) => {
      // Clean up bahan text
      const cleanBahan = bahan.replace(/^[0-9\-\s]*/, '').trim();
      
      if (cleanBahan && cleanBahan.length > 0) {
        const ingredient = {
          id: `ingredient-${receiptId}-${index + 1}`,
          receiptId: receiptId,
          bahan: cleanBahan
        };
        
        this.ingredients.push(ingredient);
      }
    });
  }

  /**
   * Parse steps dari text langkah
   * @param {string} receiptId - ID resep
   * @param {string} langkahText - Text berisi langkah-langkah
   */
  parseSteps(receiptId, langkahText) {
    try {
      // Remove outer array brackets dan quotes
      let cleanText = langkahText.replace(/^\['*|'*\]$/g, '');
      
      // Split berdasarkan pattern " | " yang memisahkan steps
      const stepItems = cleanText.split(' | ')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      stepItems.forEach((stepText, index) => {
        const stepNumber = index + 1;
        const stepId = `step-${receiptId}-${stepNumber}`;
        
        // Extract step description dan images
        const { description, images } = this.extractStepContent(stepText, stepNumber);
        
        if (description && description.length > 0) {
          const step = {
            id: stepId,
            receiptId: receiptId,
            stepNumber: stepNumber,
            description: description
          };
          
          this.steps.push(step);
          
          // Add images untuk step ini
          if (images.length > 0) {
            images.forEach((imageUrl, imgIndex) => {
              const stepImage = {
                id: `stepimg-${stepId}-${imgIndex + 1}`,
                stepId: stepId,
                url: imageUrl,
                order: imgIndex + 1
              };
              
              this.stepImages.push(stepImage);
            });
          }
        }
      });
    } catch (error) {
      console.error(`Error parsing steps for ${receiptId}: ${error.message}`);
    }
  }

  /**
   * Extract description dan images dari step text
   * @param {string} stepText - Text step yang berisi description dan images
   * @param {number} stepNumber - Nomor step
   * @returns {Object} - Object berisi description dan array images
   */
  extractStepContent(stepText, stepNumber) {
    // Remove step number dari awal jika ada
    let description = stepText.replace(/^[']*\d+\s*/, '').trim();
    const images = [];
    
    // Extract images dari [Gambar: url1, url2, ...] pattern
    const imagePattern = /\[Gambar:\s*([^\]]+)\]/g;
    let imageMatch;
    
    while ((imageMatch = imagePattern.exec(description)) !== null) {
      const imageUrls = imageMatch[1].split(',')
        .map(url => url.trim())
        .filter(url => url.startsWith('http'));
      
      images.push(...imageUrls);
    }
    
    // Remove image sections dari description
    description = description.replace(/\s*\[Gambar:[^\]]+\]/g, '').trim();
    
    // Remove quotes dari awal dan akhir
    description = description.replace(/^['"`]+|['"`]+$/g, '').trim();
    
    return { description, images };
  }

  /**
   * Clean string dengan menghapus quotes dan escape characters
   * @param {string} str - String yang akan dibersihkan
   * @returns {string} - String yang sudah bersih
   */
  cleanString(str) {
    if (!str) return '';
    
    return str
      .replace(/^['"`]+|['"`]+$/g, '') // Remove quotes dari awal dan akhir
      .replace(/\\'/g, "'") // Unescape single quotes
      .replace(/\\"/g, '"') // Unescape double quotes
      .replace(/\\\\/g, '\\') // Unescape backslashes
      .trim();
  }

  /**
   * Generate objek untuk database insertion dalam format yang kompatibel dengan Prisma
   * @param {Object} parsedData - Data hasil parsing
   * @returns {Object} - Objek berisi data untuk insertion
   */
  generateDatabaseObjects(parsedData) {
    return {
      // Data untuk Receipt model
      receipts: parsedData.receipts.map(receipt => ({
        id: receipt.id,
        judul: receipt.judul,
        gambar: receipt.gambar,
        labelBahan: receipt.labelBahan,
        metodeMemasak: receipt.metodeMemasak,
        kalori: receipt.kalori,
        createdAt: new Date(),
        updatedAt: new Date()
      })),

      // Data untuk Ingredient model
      ingredients: parsedData.ingredients.map(ingredient => ({
        id: ingredient.id,
        receiptId: ingredient.receiptId,
        bahan: ingredient.bahan
      })),

      // Data untuk Step model
      steps: parsedData.steps.map(step => ({
        id: step.id,
        receiptId: step.receiptId,
        stepNumber: step.stepNumber,
        description: step.description
      })),

      // Data untuk StepImage model
      stepImages: parsedData.stepImages.map(stepImage => ({
        id: stepImage.id,
        stepId: stepImage.stepId,
        url: stepImage.url,
        order: stepImage.order
      }))
    };
  }

  /**
   * Save parsed data ke file JSON untuk debugging
   * @param {Object} data - Data yang akan disave
   * @param {string} outputPath - Path output file
   */
  async saveToJSON(data, outputPath) {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(outputPath, jsonData, 'utf-8');
      console.log(`Data saved to ${outputPath}`);
    } catch (error) {
      throw new Error(`Error saving to JSON: ${error.message}`);
    }
  }
}

module.exports = RecipeSQLParser; 