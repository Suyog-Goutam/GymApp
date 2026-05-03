/* DammiGYM — Profile Setup (First Login Wizard) */
window.DG = window.DG || {};

DG.Profile = (() => {
  let selectedGender = '';

  function render() {
    selectedGender = '';
    return `
    <div class="auth-page">
      <div class="logo">DAMMI<span style="color:#fff">GYM</span></div>
      <p style="color:var(--text2);margin-bottom:32px;text-align:center">Let's set up your profile to calculate your goals</p>
      <div class="auth-form">
        <div class="wizard-progress" id="wizard-progress"></div>

        <div class="wizard-step active" data-step="1">
          <h3 style="margin-bottom:20px">Basic Info</h3>
          <div class="form-group">
            <label class="form-label">Age</label>
            <input type="number" class="form-input" id="prof-age" placeholder="e.g. 25" min="14" max="80">
          </div>
          <div class="form-group">
            <label class="form-label">Gender</label>
            <div class="gender-selector" id="gender-selector">
              <div class="gender-card" data-gender="male" onclick="DG.Profile.selectGender('male')">
                <span class="gender-icon">🚹</span>
                <span class="gender-label">Male</span>
              </div>
              <div class="gender-card" data-gender="female" onclick="DG.Profile.selectGender('female')">
                <span class="gender-icon">🚺</span>
                <span class="gender-label">Female</span>
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-block mt-lg" onclick="DG.Profile.next(1)">Continue</button>
        </div>

        <div class="wizard-step" data-step="2">
          <h3 style="margin-bottom:20px">Body Stats</h3>
          <div class="form-group">
            <label class="form-label">Weight (kg)</label>
            <input type="number" class="form-input" id="prof-weight" placeholder="e.g. 80" min="30" max="300" step="0.1">
          </div>
          <div class="form-group">
            <label class="form-label">Height (cm)</label>
            <input type="number" class="form-input" id="prof-height" placeholder="e.g. 175" min="100" max="250">
          </div>
          <div style="display:flex;gap:12px">
            <button class="btn btn-ghost" onclick="DG.Profile.prev(2)" style="flex:1">Back</button>
            <button class="btn btn-primary" onclick="DG.Profile.next(2)" style="flex:2">Continue</button>
          </div>
        </div>

        <div class="wizard-step" data-step="3">
          <h3 style="margin-bottom:20px">Activity & Goal</h3>
          <div class="form-group">
            <label class="form-label">Activity Level</label>
            <select class="form-input form-select" id="prof-activity">
              <option value="">Select level</option>
              <option value="sedentary">Sedentary (desk job)</option>
              <option value="light">Light (1-2 days/week)</option>
              <option value="moderate">Moderate (3-5 days/week)</option>
              <option value="active">Active (6-7 days/week)</option>
              <option value="very_active">Very Active (2x/day)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Goal</label>
            <select class="form-input form-select" id="prof-goal">
              <option value="fat_loss" selected>Fat Loss</option>
              <option value="maintenance">Maintenance</option>
              <option value="muscle_gain">Muscle Gain</option>
            </select>
          </div>
          <div style="display:flex;gap:12px">
            <button class="btn btn-ghost" onclick="DG.Profile.prev(3)" style="flex:1">Back</button>
            <button class="btn btn-primary" onclick="DG.Profile.save()" style="flex:2">Complete Setup</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function selectGender(gender) {
    selectedGender = gender;
    document.querySelectorAll('.gender-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`.gender-card[data-gender="${gender}"]`);
    if (card) card.classList.add('selected');
  }

  function init() {
    updateProgress(1);
  }

  function updateProgress(step) {
    const pg = document.getElementById('wizard-progress');
    if (!pg) return;
    pg.innerHTML = [1,2,3].map(i =>
      `<div class="wizard-dot ${i < step ? 'done' : ''} ${i === step ? 'current' : ''}"></div>`
    ).join('');
  }

  function next(step) {
    // Validate current step
    if (step === 1) {
      const age = document.getElementById('prof-age').value;
      if (!DG.Utils.isValidNum(age, 14, 80)) { DG.UI.toast('Please enter a valid age (14-80)', 'error'); return; }
      if (!selectedGender) { DG.UI.toast('Please select your gender', 'error'); return; }
    }
    if (step === 2) {
      const w = document.getElementById('prof-weight').value;
      const h = document.getElementById('prof-height').value;
      if (!DG.Utils.isValidNum(w, 30, 300)) { DG.UI.toast('Please enter a valid weight (30-300 kg)', 'error'); return; }
      if (!DG.Utils.isValidNum(h, 100, 250)) { DG.UI.toast('Please enter a valid height (100-250 cm)', 'error'); return; }
    }
    showStep(step + 1);
  }

  function prev(step) { showStep(step - 1); }

  function showStep(step) {
    document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
    const target = document.querySelector(`.wizard-step[data-step="${step}"]`);
    if (target) target.classList.add('active');
    updateProgress(step);
  }

  async function save() {
    const age = parseInt(document.getElementById('prof-age').value);
    const gender = selectedGender;
    const weight = parseFloat(document.getElementById('prof-weight').value);
    const height = parseFloat(document.getElementById('prof-height').value);
    const activity = document.getElementById('prof-activity').value;
    const goal = document.getElementById('prof-goal').value;

    if (!activity) { DG.UI.toast('Please select activity level', 'error'); return; }

    const bmr = DG.Utils.calcBMR(weight, height, age, gender);
    const tdee = DG.Utils.calcTDEE(bmr, activity);
    const deficitPct = goal === 'fat_loss' ? 0.22 : (goal === 'muscle_gain' ? -0.1 : 0);
    const dailyTarget = DG.Utils.calcTarget(tdee, deficitPct);

    const profile = {
      age, gender, weight, height,
      activityLevel: activity,
      goal, bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalories: dailyTarget,
      deficitPct: Math.round(deficitPct * 100)
    };

    const session = DG.Auth.currentUser();
    DG.Storage.updateUser(session.id, { profile });

    // Add initial weight log
    DG.Storage.updateLogByDate(session.id, 'weight', DG.Utils.today(), { date: DG.Utils.today(), weight });

    DG.UI.toast('Profile saved! Let\'s crush it! 💪', 'success');
    setTimeout(() => { location.hash = '#dashboard'; }, 600);
  }

  // Get user's daily calorie info
  function getCalorieInfo(userId) {
    const user = DG.Storage.getUserById(userId);
    if (!user || !user.profile) return null;

    const today = DG.Utils.today();
    const workoutLog = DG.Storage.getLogByDate(userId, 'workout', today);
    const burned = workoutLog ? (workoutLog.caloriesBurned || 0) : 0;

    const nutritionLog = DG.Storage.getLogByDate(userId, 'nutrition', today);
    const consumed = nutritionLog ? (nutritionLog.items || []).reduce((s, i) => s + (i.calories || 0), 0) : 0;

    const baseTarget = user.profile.dailyCalories;
    const adjustedTarget = baseTarget + burned; // Eat back exercise calories

    return {
      baseTarget,
      adjustedTarget,
      consumed,
      burned,
      remaining: Math.max(adjustedTarget - consumed, 0),
      pct: consumed / adjustedTarget
    };
  }

  return { render, init, next, prev, save, getCalorieInfo, selectGender };
})();
