/* DammiGYM — Utilities */
window.DG = window.DG || {};

DG.Utils = (() => {
  // Sanitize HTML to prevent XSS
  function sanitize(str) {
    if (typeof str !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, c => map[c]);
  }

  // Get today's date as YYYY-MM-DD
  function today() {
    return new Date().toISOString().split('T')[0];
  }

  // Format date for display
  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // Format seconds to HH:MM:SS
  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // Format number with commas
  function formatNum(n) {
    return Math.round(n).toLocaleString();
  }

  // Get day of week (0=Sunday, 6=Saturday)
  function getDayOfWeek(dateStr) {
    const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
    return d.getDay();
  }

  // Day name from index
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function dayName(idx) { return DAY_NAMES[idx]; }

  // Workout split mapping (Dynamic from DB)
  function todaySplit() { return getSplit(getDayOfWeek()); }
  function getSplit(dayIdx) { 
    if (window.DG && DG.Exercises) {
      const exs = DG.Exercises.getByDay(dayIdx);
      if (exs && exs.length > 0) {
        return exs[0].split;
      }
    }
    return 'Rest';
  }

  // BMR (Mifflin-St Jeor)
  function calcBMR(weight, height, age, gender) {
    const base = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'female' ? base - 161 : base + 5;
  }

  // Activity multipliers
  const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };

  // TDEE
  function calcTDEE(bmr, activityLevel) {
    return bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55);
  }

  // Daily calorie target with deficit
  function calcTarget(tdee, deficitPct) {
    return Math.round(tdee * (1 - (deficitPct || 0.22)));
  }

  // Calories burned from exercise
  function calcCaloriesBurned(met, weightKg, durationMinutes) {
    return Math.round(met * weightKg * (durationMinutes / 60));
  }

  // BMI calculation
  function calcBMI(weightKg, heightCm) {
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
  }

  // BMI category
  function bmiCategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  // Validate number input
  function isValidNum(val, min, max) {
    const n = parseFloat(val);
    return !isNaN(n) && n >= min && n <= max;
  }

  // Get dates for last N days
  function lastNDays(n) {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }

  // Debounce
  function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  }

  return {
    sanitize, today, formatDate, formatTime, formatNum, getDayOfWeek, dayName,
    todaySplit, getSplit, calcBMR, calcTDEE, calcTarget, calcCaloriesBurned,
    calcBMI, bmiCategory, isValidNum, lastNDays, debounce, ACTIVITY_MULTIPLIERS
  };
})();
