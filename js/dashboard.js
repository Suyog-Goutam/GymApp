/* DammiGYM — Dashboard with Cosmetic Rewards */
window.DG = window.DG || {};

DG.Dashboard = (() => {
  function render() {
    const session = DG.Auth.currentUser();
    const user = DG.Auth.currentUserData();
    if (!user || !user.profile) return '<div class="page-content"><p>Loading...</p></div>';

    const today = DG.Utils.today();
    const cal = DG.Profile.getCalorieInfo(session.id);
    const split = DG.Utils.todaySplit();
    const dayName = DG.Utils.dayName(DG.Utils.getDayOfWeek());
    const isRest = split === 'Rest';

    // Hydration
    const hydLog = DG.Storage.getLogByDate(session.id, 'hydration', today);
    const waterMl = hydLog ? (hydLog.intakeMl || 0) : 0;
    const waterGoal = 3000;
    const waterPct = Math.min((waterMl / waterGoal) * 100, 100);

    // Streak
    const streak = calcStreak(session.id);

    // Weight
    const weightLogs = DG.Storage.getLogs(session.id, 'weight');
    const latestWeight = weightLogs.length ? weightLogs[weightLogs.length - 1].weight : user.profile.weight;

    // Workout done today?
    const workoutDone = !!DG.Storage.getLogByDate(session.id, 'workout', today);

    // Cosmetics
    const cosmetics = DG.Progress.getUnlockedCosmetics(session.id);
    const nameGlowClass = DG.Progress.getNameGlowClass(cosmetics.nameGlow);
    const selTitle = user.profile.selectedTitle;
    const titleBadge = (selTitle && selTitle.value) ? `<span class="title-badge title-badge-${selTitle.tier}" style="margin-left:6px;position:relative;top:-2px">${selTitle.value}</span>` : '';

    return `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 style="font-size:1.1rem">DAMMI<span style="color:#fff">GYM</span></h1>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:.85rem" class="${nameGlowClass}">Hi, ${DG.Utils.sanitize(session.username)}${titleBadge}</span>
          <button class="btn-icon" style="border:1px solid var(--glass-border)" onclick="DG.App.showProfile()" title="Profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
      </div>
      <div class="page-content stagger">
        <!-- Day & Split -->
        <div class="card mb-md" style="border-color:var(--border-red)">
          <div class="flex-between">
            <div>
              <div style="font-size:.75rem;color:var(--text3);text-transform:uppercase;letter-spacing:1px">${dayName}</div>
              <div style="font-size:1.1rem;font-weight:700;margin-top:4px">${isRest ? '😴 Rest Day' : '🏋️ ' + split}</div>
            </div>
            ${isRest ? '' : (workoutDone ?
              '<span class="badge badge-can">✓ Done</span>' :
              '<button class="btn btn-primary btn-sm" onclick="location.hash=\'#workout\'">Start Workout</button>'
            )}
          </div>
        </div>

        <!-- Calorie Ring -->
        <div class="card mb-md">
          <div style="display:flex;align-items:center;gap:24px">
            ${DG.UI.calorieRing(cal.consumed, cal.adjustedTarget)}
            <div style="flex:1">
              <div class="mb-sm">
                <span style="font-size:.7rem;color:var(--text3);text-transform:uppercase">Consumed</span>
                <div style="font-weight:600;font-size:1.1rem">${DG.Utils.formatNum(cal.consumed)} <span style="font-size:.75rem;color:var(--text3)">kcal</span></div>
              </div>
              <div class="mb-sm">
                <span style="font-size:.7rem;color:var(--text3);text-transform:uppercase">Burned</span>
                <div style="font-weight:600;font-size:1.1rem;color:var(--success)">${DG.Utils.formatNum(cal.burned)} <span style="font-size:.75rem;color:var(--text3)">kcal</span></div>
              </div>
              <div>
                <span style="font-size:.7rem;color:var(--text3);text-transform:uppercase">Target</span>
                <div style="font-weight:600;font-size:1.1rem">${DG.Utils.formatNum(cal.adjustedTarget)} <span style="font-size:.75rem;color:var(--text3)">kcal</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Row -->
        <div class="grid-3 mb-md">
          <div class="card" style="text-align:center;padding:16px">
            <div style="font-size:1.5rem">🔥</div>
            <div class="card-value" style="font-size:1.3rem">${streak}</div>
            <div class="card-label">Streak</div>
          </div>
          <div class="card" style="text-align:center;padding:16px">
            <div style="font-size:1.5rem">⚖️</div>
            <div class="card-value" style="font-size:1.3rem">${latestWeight}</div>
            <div class="card-label">kg</div>
          </div>
          <div class="card" style="text-align:center;padding:16px">
            <div style="font-size:1.5rem">📊</div>
            <div class="card-value" style="font-size:1.3rem">${DG.Utils.calcBMI(latestWeight, user.profile.height)}</div>
            <div class="card-label">BMI</div>
          </div>
        </div>

        <!-- Hydration -->
        <div class="card mb-md" onclick="location.hash='#hydration'" style="cursor:pointer">
          <div class="flex-between mb-sm">
            <span style="font-weight:600">💧 Hydration</span>
            <span style="font-size:.85rem;color:var(--text2)">${waterMl}ml / ${waterGoal}ml</span>
          </div>
          <div class="progress-bar progress-lg">
            <div class="progress-fill blue" style="width:${waterPct}%"></div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid-2 mb-md">
          <button class="card" style="text-align:center;cursor:pointer;border:1px dashed var(--glass-border)" onclick="location.hash='#nutrition'">
            <div style="font-size:1.3rem;margin-bottom:4px">🍽️</div>
            <div style="font-size:.85rem;font-weight:500">Log Food</div>
          </button>
          <button class="card" style="text-align:center;cursor:pointer;border:1px dashed var(--glass-border)" onclick="location.hash='#weight'">
            <div style="font-size:1.3rem;margin-bottom:4px">⚖️</div>
            <div style="font-size:.85rem;font-weight:500">Log Weight</div>
          </button>
        </div>
      </div>
    </div>`;
  }

  function calcStreak(userId) {
    const logs = DG.Storage.getLogs(userId, 'workout');
    if (!logs.length) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i <= 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      
      // Skip rest days (Saturday = 6)
      if (dayOfWeek === 6) continue;
      
      const hasLog = logs.some(l => l.date === dateStr);
      if (hasLog) {
        streak++;
      } else {
        // If it's today and no log yet, don't break streak
        if (i === 0) continue;
        break;
      }
    }
    return streak;
  }

  function init() {
    // Nothing to attach - everything uses inline handlers
  }

  return { render, init, calcStreak };
})();
