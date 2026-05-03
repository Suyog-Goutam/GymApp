/* DammiGYM — Progress, Achievements, Cosmetics & Export */
window.DG = window.DG || {};

DG.Progress = (() => {
  // Tier: bronze, silver, gold, diamond
  // Rewards: nameGlow, title, cheatDay, profileBorder, animated
  const ACHIEVEMENTS = [
    // ---- BRONZE (easy) ----
    { id: 'first_workout',  tier: 'bronze', icon: '🏋️', name: 'First Rep',          desc: 'Complete your first workout',         reward: { type: 'title', value: 'Beginner' },  check: (u, l) => l.workout.length > 0 },
    { id: 'first_food',     tier: 'bronze', icon: '🍎', name: 'First Bite',          desc: 'Log your first meal',                 reward: { type: 'title', value: 'Fueled' },     check: (u, l) => l.nutrition.length > 0 },
    { id: 'first_water',    tier: 'bronze', icon: '💧', name: 'First Sip',           desc: 'Log water for the first time',        reward: { type: 'title', value: 'Hydrated' },   check: (u, l) => l.hydration.length > 0 },
    { id: 'first_weight',   tier: 'bronze', icon: '⚖️', name: 'Scale Check',        desc: 'Log your weight for the first time',  reward: { type: 'title', value: 'Aware' },      check: (u, l) => l.weight.length > 0 },
    { id: 'streak_3',       tier: 'bronze', icon: '🔥', name: '3 Day Streak',        desc: 'Work out 3 days in a row',            reward: { type: 'nameGlow', value: 'red' },     check: (u, l) => getStreak(u) >= 3 },
    { id: 'log_food_3',     tier: 'bronze', icon: '📝', name: 'Food Diary',          desc: 'Log food for 3 days',                 reward: { type: 'title', value: 'Tracker' },    check: (u, l) => l.nutrition.length >= 3 },
    { id: 'water_goal_1',   tier: 'bronze', icon: '🥤', name: 'Hydration Hit',       desc: 'Reach daily water goal once',         reward: { type: 'title', value: 'Refreshed' },  check: (u, l) => l.hydration.some(h => h.intakeMl >= 3000) },

    // ---- SILVER (medium) ----
    { id: 'streak_7',       tier: 'silver', icon: '⚡', name: 'Week Warrior',        desc: '7 day workout streak',                reward: { type: 'nameGlow', value: 'gold' },    check: (u, l) => getStreak(u) >= 7 },
    { id: 'ten_workouts',   tier: 'silver', icon: '💪', name: '10 Sessions',         desc: 'Complete 10 workouts',                reward: { type: 'title', value: 'Committed' },  check: (u, l) => l.workout.length >= 10 },
    { id: 'cal_500',        tier: 'silver', icon: '🔥', name: 'Calorie Crusher',     desc: 'Burn 500+ cal in one session',        reward: { type: 'title', value: 'Furnace' },    check: (u, l) => l.workout.some(w => w.caloriesBurned >= 500) },
    { id: 'food_logger_7',  tier: 'silver', icon: '🍽️', name: 'Meal Prep Pro',      desc: 'Log food for 7 days',                 reward: { type: 'title', value: 'Disciplined' },check: (u, l) => l.nutrition.length >= 7 },
    { id: 'water_champ_7',  tier: 'silver', icon: '💧', name: 'Hydration Hero',      desc: 'Hit water goal 7 times',              reward: { type: 'title', value: 'Aqua Legend' },check: (u, l) => l.hydration.filter(h => h.intakeMl >= 3000).length >= 7 },
    { id: 'weight_loss_2',  tier: 'silver', icon: '📉', name: '2kg Down',            desc: 'Lose 2kg from start',                 reward: { type: 'title', value: 'Shrinking' },  check: (u, l) => { if (l.weight.length < 2) return false; return l.weight[0].weight - l.weight[l.weight.length-1].weight >= 2; }},
    { id: 'streak_14',      tier: 'silver', icon: '💎', name: 'Two Week Champion',   desc: '14 day workout streak',               reward: { type: 'profileBorder', value: 'gold' },check: (u, l) => getStreak(u) >= 14 },

    // ---- GOLD (hard) ----
    { id: 'streak_30',      tier: 'gold',   icon: '👑', name: 'Monthly Legend',       desc: '30 day workout streak',               reward: { type: 'nameGlow', value: 'rainbow' }, check: (u, l) => getStreak(u) >= 30 },
    { id: 'fifty_workouts', tier: 'gold',   icon: '🎖️', name: 'Iron Veteran',       desc: 'Complete 50 workouts',                reward: { type: 'title', value: 'Veteran' },    check: (u, l) => l.workout.length >= 50 },
    { id: 'weight_loss_5',  tier: 'gold',   icon: '📉', name: '5kg Shredded',        desc: 'Lose 5kg from starting weight',       reward: { type: 'cheatDay', value: 1 },         check: (u, l) => { if (l.weight.length < 2) return false; return l.weight[0].weight - l.weight[l.weight.length-1].weight >= 5; }},
    { id: 'cal_1000',       tier: 'gold',   icon: '💥', name: 'Inferno',             desc: 'Burn 1000+ cal in one session',       reward: { type: 'title', value: 'Inferno' },    check: (u, l) => l.workout.some(w => w.caloriesBurned >= 1000) },
    { id: 'food_logger_30', tier: 'gold',   icon: '📋', name: 'Nutrition Master',    desc: 'Log food for 30 days',                reward: { type: 'cheatDay', value: 1 },         check: (u, l) => l.nutrition.length >= 30 },
    { id: 'water_champ_30', tier: 'gold',   icon: '🌊', name: 'Water God',           desc: 'Hit water goal 30 times',             reward: { type: 'title', value: 'Poseidon' },   check: (u, l) => l.hydration.filter(h => h.intakeMl >= 3000).length >= 30 },

    // ---- DIAMOND (legendary) ----
    { id: 'streak_90',      tier: 'diamond', icon: '💠', name: '90 Day Beast',       desc: '90 day workout streak',               reward: { type: 'nameGlow', value: 'diamond' }, check: (u, l) => getStreak(u) >= 90 },
    { id: 'hundred_workouts', tier: 'diamond', icon: '🏆', name: 'Centurion',        desc: 'Complete 100 workouts',               reward: { type: 'animated', value: true },      check: (u, l) => l.workout.length >= 100 },
    { id: 'weight_loss_10', tier: 'diamond', icon: '🦅', name: 'Transformation',     desc: 'Lose 10kg from starting weight',      reward: { type: 'cheatDay', value: 3 },         check: (u, l) => { if (l.weight.length < 2) return false; return l.weight[0].weight - l.weight[l.weight.length-1].weight >= 10; }},
    { id: 'perfect_week',   tier: 'diamond', icon: '⭐', name: 'Perfect Week',       desc: 'Log workout + food + water every day for 7 days', reward: { type: 'animated', value: true }, check: (u, l) => {
      const last7 = DG.Utils.lastNDays(7);
      return last7.every(day => {
        const dObj = new Date(day);
        if (dObj.getDay() === 6) return true; // Skip Saturday
        return l.workout.some(w => w.date === day) && l.nutrition.some(n => n.date === day) && l.hydration.some(h => h.date === day && h.intakeMl >= 1000);
      });
    }}
  ];

  const TIER_COLORS = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', diamond: '#b9f2ff' };
  const TIER_LABELS = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', diamond: 'Diamond' };

  function getStreak(userId) {
    return DG.Dashboard.calcStreak(userId);
  }

  // Returns all unlocked rewards for a user
  function getUnlockedCosmetics(userId) {
    const logs = getAllLogs(userId);
    const cosmetics = { nameGlow: null, titles: [], cheatDays: 0, profileBorder: null, animated: false, unlockedAchievements: [] };

    ACHIEVEMENTS.forEach(a => {
      if (a.check(userId, logs)) {
        cosmetics.unlockedAchievements.push(a);
        const r = a.reward;
        if (r.type === 'nameGlow') cosmetics.nameGlow = r.value; // last unlocked wins (higher tier)
        if (r.type === 'title') cosmetics.titles.push({ value: r.value, tier: a.tier });
        if (r.type === 'cheatDay') cosmetics.cheatDays += r.value;
        if (r.type === 'profileBorder') cosmetics.profileBorder = r.value;
        if (r.type === 'animated') cosmetics.animated = true;
      }
    });

    // Sort titles by tier (bronze -> diamond) for UI consistency if needed
    const tierOrder = { bronze: 1, silver: 2, gold: 3, diamond: 4 };
    cosmetics.titles.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);

    return cosmetics;
  }

  function getAllLogs(userId) {
    return {
      workout: DG.Storage.getLogs(userId, 'workout'),
      nutrition: DG.Storage.getLogs(userId, 'nutrition'),
      hydration: DG.Storage.getLogs(userId, 'hydration'),
      weight: DG.Storage.getLogs(userId, 'weight')
    };
  }

  function getNameGlowClass(glowValue) {
    if (!glowValue) return '';
    return `name-glow-${glowValue}`;
  }

  function render() {
    const session = DG.Auth.currentUser();
    const user = DG.Auth.currentUserData();
    if (!user) return '';

    const streak = getStreak(session.id);
    const logs = getAllLogs(session.id);
    const cosmetics = getUnlockedCosmetics(session.id);

    // Weekly report
    const last7 = DG.Utils.lastNDays(7);
    const weekWorkouts = logs.workout.filter(w => last7.includes(w.date));
    const weekCalsBurned = weekWorkouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
    const weekNutrition = logs.nutrition.filter(n => last7.includes(n.date));
    const weekCalsConsumed = weekNutrition.reduce((s, n) => s + (n.items || []).reduce((ss, i) => ss + i.calories, 0), 0);
    const weekWeights = logs.weight.filter(w => last7.includes(w.date));
    let weekWeightChange = '--';
    if (weekWeights.length >= 2) {
      const diff = weekWeights[weekWeights.length-1].weight - weekWeights[0].weight;
      weekWeightChange = (diff > 0 ? '+' : '') + diff.toFixed(1) + ' kg';
    }

    // Count unlocked
    const totalUnlocked = ACHIEVEMENTS.filter(a => a.check(session.id, logs)).length;

    // Group by tier
    const tiers = ['bronze', 'silver', 'gold', 'diamond'];

    return `
    <div class="page">
      <div class="page-header">
        <h1>Progress</h1>
        <button class="btn btn-secondary btn-sm" onclick="DG.Progress.exportData()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </div>
      <div class="page-content stagger">
        <!-- Streak -->
        <div class="card mb-md animate-border-glow" style="text-align:center">
          <div style="font-size:3rem;margin-bottom:8px">🔥</div>
          <div style="font-family:var(--font-display);font-size:2.5rem;font-weight:900;color:var(--primary);text-shadow:0 0 30px var(--glow)">${streak}</div>
          <div style="font-size:.85rem;color:var(--text2);margin-top:4px">Day Streak</div>
        </div>

        <!-- Active Cosmetics -->
        ${cosmetics.nameGlow || cosmetics.title || cosmetics.cheatDays > 0 ? `
        <div class="card mb-md" style="padding:14px">
          <h4 style="font-size:.8rem;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">🎨 Active Rewards</h4>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${cosmetics.nameGlow ? `<span class="badge" style="background:rgba(255,255,255,0.05);border:1px solid ${TIER_COLORS[cosmetics.nameGlow] || 'var(--border-red)'}">✨ ${cosmetics.nameGlow.charAt(0).toUpperCase() + cosmetics.nameGlow.slice(1)} Name Glow</span>` : ''}
            ${cosmetics.title ? `<span class="badge" style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3)">🏅 "${cosmetics.title}"</span>` : ''}
            ${cosmetics.cheatDays > 0 ? `<span class="badge" style="background:rgba(0,204,102,0.1);border:1px solid rgba(0,204,102,0.3)">🍕 ${cosmetics.cheatDays} Cheat Day${cosmetics.cheatDays > 1 ? 's' : ''}</span>` : ''}
            ${cosmetics.animated ? `<span class="badge" style="background:rgba(185,242,255,0.1);border:1px solid rgba(185,242,255,0.3)">💫 Animated Name</span>` : ''}
          </div>
        </div>` : ''}

        <!-- Weekly Report -->
        <h3 class="mb-md">Weekly Report</h3>
        <div class="grid-2 mb-lg">
          <div class="card" style="padding:14px">
            <div class="card-label">Workouts</div>
            <div class="card-value" style="font-size:1.3rem">${weekWorkouts.length}</div>
          </div>
          <div class="card" style="padding:14px">
            <div class="card-label">Calories Burned</div>
            <div class="card-value" style="font-size:1.3rem">${DG.Utils.formatNum(weekCalsBurned)}</div>
          </div>
          <div class="card" style="padding:14px">
            <div class="card-label">Avg Cal/Day</div>
            <div class="card-value" style="font-size:1.3rem">${DG.Utils.formatNum(weekCalsConsumed / 7)}</div>
          </div>
          <div class="card" style="padding:14px">
            <div class="card-label">Weight Change</div>
            <div class="card-value" style="font-size:1.3rem">${weekWeightChange}</div>
          </div>
        </div>

        <!-- Achievements by Tier -->
        <div class="flex-between mb-md">
          <h3>Achievements</h3>
          <span style="font-size:.8rem;color:var(--text3)">${totalUnlocked}/${ACHIEVEMENTS.length} unlocked</span>
        </div>
        ${tiers.map(tier => {
          const tierAchs = ACHIEVEMENTS.filter(a => a.tier === tier);
          const unlockedCount = tierAchs.filter(a => a.check(session.id, logs)).length;
          return `
            <div style="margin-bottom:16px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span style="width:10px;height:10px;border-radius:50%;background:${TIER_COLORS[tier]}"></span>
                <span style="font-size:.8rem;font-weight:600;color:${TIER_COLORS[tier]};text-transform:uppercase;letter-spacing:1px">${TIER_LABELS[tier]}</span>
                <span style="font-size:.7rem;color:var(--text3)">${unlockedCount}/${tierAchs.length}</span>
              </div>
              ${tierAchs.map(a => {
                const unlocked = a.check(session.id, logs);
                const rewardLabel = a.reward.type === 'nameGlow' ? `✨ ${a.reward.value} glow` :
                                    a.reward.type === 'title' ? `🏅 "${a.reward.value}"` :
                                    a.reward.type === 'cheatDay' ? `🍕 ${a.reward.value} cheat day` :
                                    a.reward.type === 'profileBorder' ? `🖼️ ${a.reward.value} border` :
                                    a.reward.type === 'animated' ? '💫 animated name' : '';
                return `
                  <div class="achievement achievement-tier-${tier} ${unlocked ? 'unlocked' : ''}">
                    <div class="achievement-icon">${unlocked ? a.icon : '🔒'}</div>
                    <div class="achievement-info">
                      <h4>${a.name}</h4>
                      <p>${a.desc}</p>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;min-width:0">
                      ${unlocked ? '<span style="color:var(--success);font-size:.7rem;font-weight:600">✓</span>' : ''}
                      <span class="achievement-reward" style="background:rgba(${unlocked ? '255,215,0' : '255,255,255'},0.05);color:${unlocked ? TIER_COLORS[tier] : 'var(--text3)'};border:1px solid ${unlocked ? TIER_COLORS[tier] : 'transparent'}">${rewardLabel}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
    </div>`;
  }

  function exportData() {
    DG.UI.confirm('Export your data?', 'A JSON file will be downloaded with all your data.', () => {
      const session = DG.Auth.currentUser();
      const user = DG.Auth.currentUserData();
      const data = {
        profile: user.profile,
        workouts: DG.Storage.getLogs(session.id, 'workout'),
        nutrition: DG.Storage.getLogs(session.id, 'nutrition'),
        hydration: DG.Storage.getLogs(session.id, 'hydration'),
        weight: DG.Storage.getLogs(session.id, 'weight'),
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dammigym-export-${DG.Utils.today()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      DG.UI.toast('Data exported!', 'success');
    });
  }

  function init() {}

  return { render, init, exportData, getUnlockedCosmetics, getNameGlowClass, ACHIEVEMENTS, getAllLogs };
})();
