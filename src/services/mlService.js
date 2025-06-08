const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class MLService {
  constructor() {
    this.model = null;
    this.modelPath = process.env.MODEL_PATH || path.join(__dirname, '../../models/model.json');
    this.labels = [
      'Acne',
      'Eczema', 
      'Melanoma',
      'Psoriasis',
      'Rosacea',
      'Healthy Skin'
    ]; // Sesuaikan dengan label model Anda
  }

  async loadModel() {
    try {
      if (!this.model) {
        console.log('Loading ML model...');
        this.model = await tf.loadLayersModel(`file://${this.modelPath}`);
        console.log('Model loaded successfully');
      }
      return this.model;
    } catch (error) {
      console.error('Error loading model:', error);
      throw new Error('Failed to load ML model');
    }
  }

  async preprocessImage(imagePath) {
    try {
      // Resize dan normalisasi gambar
      const buffer = await sharp(imagePath)
        .resize(224, 224) // Sesuaikan dengan input size model
        .raw()
        .toBuffer();

      // Convert buffer to tensor
      const tensor = tf.tensor3d(new Uint8Array(buffer), [224, 224, 3]);
      
      // Normalisasi pixel values ke range [0, 1]
      const normalized = tensor.div(255.0);
      
      // Add batch dimension
      const batched = normalized.expandDims(0);
      
      tensor.dispose();
      normalized.dispose();
      
      return batched;
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw new Error('Failed to preprocess image');
    }
  }

  async predict(imagePath) {
    try {
      await this.loadModel();
      
      const preprocessedImage = await this.preprocessImage(imagePath);
      
      // Prediksi
      const prediction = this.model.predict(preprocessedImage);
      const scores = await prediction.data();
      
      // Find the class with highest probability
      const maxScoreIndex = scores.indexOf(Math.max(...scores));
      const confidence = scores[maxScoreIndex];
      const predictedClass = this.labels[maxScoreIndex];
      
      // Generate suggestions based on prediction
      const suggestions = this.generateSuggestions(predictedClass, confidence);
      
      // Cleanup tensors
      preprocessedImage.dispose();
      prediction.dispose();
      
      return {
        result: predictedClass,
        confidence: Math.round(confidence * 100) / 100,
        suggestions,
        allScores: this.labels.map((label, index) => ({
          label,
          score: Math.round(scores[index] * 100) / 100
        }))
      };
    } catch (error) {
      console.error('Error during prediction:', error);
      throw new Error('Prediction failed');
    }
  }

  generateSuggestions(predictedClass, confidence) {
    const suggestions = {
      'Acne': [
        'Gunakan pembersih wajah yang lembut',
        'Hindari memencet jerawat',
        'Gunakan produk non-comedogenic',
        'Konsultasi dengan dermatologis jika parah'
      ],
      'Eczema': [
        'Jaga kelembaban kulit dengan moisturizer',
        'Hindari trigger seperti sabun keras',
        'Gunakan air hangat untuk mandi',
        'Konsultasi dengan dokter untuk pengobatan'
      ],
      'Melanoma': [
        'SEGERA konsultasi dengan dokter spesialis kulit',
        'Hindari paparan sinar matahari langsung',
        'Gunakan sunscreen SPF tinggi',
        'Lakukan pemeriksaan rutin'
      ],
      'Psoriasis': [
        'Jaga kelembaban kulit',
        'Hindari stress berlebihan',
        'Konsultasi dengan dermatologis',
        'Gunakan obat topikal sesuai resep dokter'
      ],
      'Rosacea': [
        'Hindari trigger seperti alkohol dan makanan pedas',
        'Gunakan sunscreen setiap hari',
        'Pilih produk skincare yang lembut',
        'Konsultasi dengan dermatologis'
      ],
      'Healthy Skin': [
        'Pertahankan rutinitas skincare yang baik',
        'Gunakan sunscreen setiap hari',
        'Minum air yang cukup',
        'Konsumsi makanan bergizi'
      ]
    };

    const baseSuggestions = suggestions[predictedClass] || [
      'Konsultasi dengan profesional kesehatan kulit',
      'Jaga kebersihan dan kelembaban kulit',
      'Hindari paparan sinar matahari berlebihan'
    ];

    if (confidence < 0.7) {
      baseSuggestions.unshift('Hasil prediksi kurang akurat, disarankan konsultasi dengan dokter');
    }

    return baseSuggestions;
  }
}

module.exports = new MLService();

