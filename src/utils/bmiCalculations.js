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

module.exports = {
  ACTIVITY_LEVELS,
  calculateBMI,
  calculateBMR,
  getBMICategory,
  getHealthStatus,
  getActivityMultiplier,
  getTargetCalories
}; 