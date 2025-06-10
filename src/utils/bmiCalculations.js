const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', description: 'Sedikit atau tidak ada olahraga', multiplier: 1.2 },
  { value: 'light', label: 'Light', description: 'Olahraga ringan 1-3 hari/minggu', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderate', description: 'Olahraga sedang 3-5 hari/minggu', multiplier: 1.55 },
  { value: 'active', label: 'Active', description: 'Olahraga berat 6-7 hari/minggu', multiplier: 1.725 },
  { value: 'very_active', label: 'Very Active', description: 'Olahraga sangat berat + pekerjaan fisik', multiplier: 1.9 }
];

/**
 * Calculate BMI based on height and weight
 * @param {number} height - Height in centimeters
 * @param {number} weight - Weight in kilograms
 * @returns {number} BMI value
 */
const calculateBMI = (height, weight) => {
  const heightInMeters = height / 100;
  if (heightInMeters > 0 && weight > 0) {
    return weight / (heightInMeters * heightInMeters);
  }
  return 0;
};

/**
 * Calculate Basal Metabolic Rate (BMR)
 * @param {number} weight - Weight in kilograms
 * @param {number} height - Height in centimeters
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR value
 */
const calculateBMR = (weight, height, age, gender) => {
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
};

/**
 * Get BMI category based on BMI value
 * @param {number} bmi - BMI value
 * @returns {string} BMI category
 */
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * Get health status in Indonesian language
 * @param {number} bmi - BMI value
 * @returns {string} Health status
 */
const getHealthStatus = (bmi) => {
  if (bmi < 18.5) return 'Berat Badan Kurang';
  if (bmi < 25) return 'Berat Badan Ideal';
  if (bmi < 30) return 'Berat Badan Berlebih';
  return 'Obesitas';
};

/**
 * Get activity multiplier for calorie calculation
 * @param {string} activityLevel - Activity level key
 * @returns {number} Activity multiplier
 */
const getActivityMultiplier = (activityLevel) => {
  const selectedActivity = ACTIVITY_LEVELS.find(level => level.value === activityLevel);
  return selectedActivity ? selectedActivity.multiplier : 1.55;
};

/**
 * Calculate target calories based on BMI and activity level
 * @param {number} weight - Weight in kilograms
 * @param {number} height - Height in centimeters
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @param {string} activityLevel - Activity level key
 * @param {number} bmi - BMI value
 * @returns {number} Target calories
 */
const getTargetCalories = (weight, height, age, gender, activityLevel, bmi) => {
  const bmr = calculateBMR(weight, height, age, gender);
  const activityMultiplier = getActivityMultiplier(activityLevel);
  const dailyCalories = bmr * activityMultiplier;
  
  if (bmi < 18.5) {
    return Math.round(dailyCalories + 300);
  } else if (bmi < 25) {
    return Math.round(dailyCalories);
  } else if (bmi < 30) {
    return Math.round(dailyCalories - 300);
  } else {
    return Math.round(dailyCalories - 500);
  }
};

/**
 * Calculate ideal targets for weight management
 * @param {number} height - Height in centimeters
 * @param {number} weight - Current weight in kilograms
 * @param {string} activityLevel - Activity level key
 * @param {string} gender - 'male' or 'female'
 * @param {number} age - Age in years
 * @returns {object} Ideal targets object
 */
const getIdealTargets = (height, weight, activityLevel, gender, age) => {
  const heightInMeters = height / 100;
  const currentBMI = calculateBMI(height, weight);
  
  // BMI ideal range: 18.5 - 24.9
  const minIdealWeight = Math.round(18.5 * heightInMeters * heightInMeters);
  const maxIdealWeight = Math.round(24.9 * heightInMeters * heightInMeters);
  const idealWeightRange = `${minIdealWeight}-${maxIdealWeight} kg`;
  
  // Target based on current condition
  let targetWeight;
  if (currentBMI < 18.5) {
    targetWeight = Math.round(20 * heightInMeters * heightInMeters);
  } else if (currentBMI > 24.9) {
    targetWeight = Math.round(23 * heightInMeters * heightInMeters);
  } else {
    targetWeight = weight;
  }
  
  const targetBMI = '21.0';
  
  // Target calories to reach ideal weight
  const bmr = calculateBMR(weight, height, age, gender);
  const activityMultiplier = getActivityMultiplier(activityLevel);
  const maintenanceCalories = bmr * activityMultiplier;
  
  let targetCalories;
  if (currentBMI < 18.5) {
    targetCalories = Math.round(maintenanceCalories + 400);
  } else if (currentBMI > 24.9) {
    targetCalories = Math.round(maintenanceCalories - 400);
  } else {
    targetCalories = Math.round(maintenanceCalories);
  }
  
  const weightDifference = Math.abs(targetWeight - weight);
  const timeEstimate = weightDifference <= 2 ? '1-2 bulan' : 
                     weightDifference <= 5 ? '2-4 bulan' :
                     weightDifference <= 10 ? '4-8 bulan' : '8-12 bulan';
  
  return {
    weightRange: idealWeightRange,
    targetWeight,
    targetBMI,
    targetCalories,
    timeEstimate
  };
};

/**
 * Get activity level text in Indonesian
 * @param {string} activityLevel - Activity level key
 * @returns {string} Activity level text
 */
const getActivityLevelText = (activityLevel) => {
  switch (activityLevel.toLowerCase()) {
    case 'sedentary': return 'Tidak Aktif';
    case 'light': return 'Ringan';
    case 'moderate': return 'Sedang';
    case 'active': return 'Aktif';
    case 'very_active': return 'Sangat Aktif';
    default: return activityLevel;
  }
};

/**
 * Process form data and calculate BMI metrics
 * @param {object} formData - Form data object
 * @returns {object} Processed BMI data
 */
const processFormData = (formData) => {
  const height = parseFloat(formData.height);
  const weight = parseFloat(formData.weight);
  const age = parseFloat(formData.age);
  
  const bmi = calculateBMI(height, weight);
  const category = getBMICategory(bmi);
  const healthStatus = getHealthStatus(bmi);
  const bmr = calculateBMR(weight, height, age, formData.gender);
  const targetCalories = getTargetCalories(weight, height, age, formData.gender, formData.activityLevel, bmi);
  
  return {
    bmi,
    category,
    healthStatus,
    targetCalories,
    bmr
  };
};

module.exports = {
  // Constants
  ACTIVITY_LEVELS,
  
  // Core calculations
  calculateBMI,
  calculateBMR,
  
  // Categories and status
  getBMICategory,
  getHealthStatus,
  
  // Activity helpers
  getActivityMultiplier,
  getActivityLevelText,
  
  // Calorie calculations
  getTargetCalories,
  
  // Advanced calculations
  getIdealTargets,
  
  // Data processing
  processFormData
}; 