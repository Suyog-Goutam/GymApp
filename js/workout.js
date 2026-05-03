/* DammiGYM — Workout Engine */
window.DG = window.DG || {};

DG.Workout = (() => {
  let timer = null;
  let elapsed = 0;
  let activeSession = null;

  function render() {
    const session = DG.Auth.currentUser();
    const user = DG.Auth.currentUserData();
    if (!user) return '';

    const split = DG.Utils.todaySplit();
    const isRest = split === 'Rest';
    const today = DG.Utils.today();
    const existing = DG.Storage.getLogByDate(session.id, 'workout', today);

    if (isRest) return renderRestDay();
    if (existing && !activeSession) return renderCompleted(existing);
    if (activeSession) return renderActive(user);
    return renderStart(split);
  }

  function renderRestDay() {
    return `
    <div class="page">
      <div class="page-header"><h1>Workout</h1></div>
      <div class="page-content" style="text-align:center;padding-top:80px">
        <div style="font-size:4rem;margin-bottom:16px">😴</div>
        <h2>Rest Day</h2>
        <p style="margin-top:8px">Recovery is part of the process. Come back tomorrow stronger!</p>
      </div>
    </div>`;
  }

  function renderCompleted(log) {
    return `
    <div class="page">
      <div class="page-header"><h1>Workout</h1></div>
      <div class="page-content">
        <div class="card" style="text-align:center;border-color:var(--success)">
          <div style="font-size:3rem;margin-bottom:12px">✅</div>
          <h2 style="color:var(--success)">Workout Complete!</h2>
          <p style="margin-top:8px">Great job today!</p>
          <div class="grid-3 mt-lg">
            <div>
              <div class="card-value" style="font-size:1.2rem">${DG.Utils.formatTime(log.duration || 0)}</div>
              <div class="card-label">Duration</div>
            </div>
            <div>
              <div class="card-value" style="font-size:1.2rem">${log.caloriesBurned || 0}</div>
              <div class="card-label">Calories</div>
            </div>
            <div>
              <div class="card-value" style="font-size:1.2rem">${(log.exercises || []).length}</div>
              <div class="card-label">Exercises</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderStart(split) {
    const dayNum = DG.Utils.getDayOfWeek() + 1;
    const exercises = DG.Exercises.getByDay(dayNum);
    const cardio = DG.Exercises.getByDay(0);

    return `
    <div class="page">
      <div class="page-header">
        <h1>Workout</h1>
        <span class="badge badge-must">${split}</span>
      </div>
      <div class="page-content">
        <div class="card mb-lg" style="text-align:center;border-color:var(--border-red)">
          <h3 style="margin-bottom:8px">Today's Split</h3>
          <p style="font-size:1.2rem;font-weight:700;color:var(--primary)">${split}</p>
          <p style="margin-top:4px">${exercises.length} exercises</p>
          <button class="btn btn-primary btn-lg btn-block mt-lg animate-glow" onclick="DG.Workout.startSession()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Start Workout
          </button>
        </div>

        <h3 class="mb-md">Exercises</h3>
        <div class="stagger">
          ${exercises.map(ex => `
            <div class="card mb-sm" style="padding:14px">
              <div class="flex-between">
                <span style="font-weight:500;font-size:.9rem">${DG.Utils.sanitize(ex.name)}</span>
                ${DG.Exercises.priorityBadge(ex.priority)}
              </div>
              <div style="font-size:.75rem;color:var(--text3);margin-top:4px">${DG.Utils.sanitize(ex.group)}</div>
            </div>
          `).join('')}
        </div>

        ${cardio.length ? `
          <h3 class="mt-lg mb-md">Optional Cardio</h3>
          ${cardio.map(ex => `
            <div class="card mb-sm" style="padding:14px">
              <div class="flex-between">
                <span style="font-weight:500;font-size:.9rem">${DG.Utils.sanitize(ex.name)}</span>
                ${DG.Exercises.priorityBadge(ex.priority)}
              </div>
            </div>
          `).join('')}
        ` : ''}
      </div>
    </div>`;
  }

  function renderActive(user) {
    const exs = activeSession.exercises;
    return `
    <div class="page" style="padding-bottom:120px">
      <div class="page-header">
        <h1 style="font-size:1rem">${activeSession.split}</h1>
        <button class="btn btn-danger btn-sm" onclick="DG.Workout.endSession()">End Workout</button>
      </div>

      <!-- Timer -->
      <div class="workout-timer" id="workout-timer">${DG.Utils.formatTime(elapsed)}</div>

      <!-- Exercise Cards -->
      <div class="page-content" id="exercise-list">
        ${exs.map((ex, i) => renderExerciseCard(ex, i, user)).join('')}
      </div>
    </div>`;
  }

  function renderExerciseCard(ex, index, user) {
    const done = activeSession.completed[index];
    const hasVideo = ex.youtubeUrl && ex.youtubeUrl.length > 5;

    // Extract YouTube video ID
    let videoId = '';
    if (hasVideo) {
      const match = ex.youtubeUrl.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]+)/);
      if (match) videoId = match[1];
    }

    return `
    <div class="exercise-card ${done ? 'completed' : ''}" id="ex-card-${index}">
      <div class="exercise-header">
        <div>
          <span class="exercise-name">${DG.Utils.sanitize(ex.name)}</span>
          <span style="font-size:.75rem;color:var(--text3);margin-left:8px">${DG.Utils.sanitize(ex.group)}</span>
        </div>
        ${DG.Exercises.priorityBadge(ex.priority)}
      </div>

      ${hasVideo && videoId ? `
        <div class="exercise-video">
          <iframe src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
        </div>
      ` : `
        <div class="exercise-video">
          <span style="font-size:.8rem">No video available</span>
        </div>
      `}

      <p style="font-size:.8rem;margin-bottom:12px;color:var(--text2)">${DG.Utils.sanitize(ex.instructions)}</p>

      ${ex.isCardio ? `
        <div class="exercise-inputs cardio">
          <div class="form-group" style="margin:0">
            <label class="form-label" style="font-size:.65rem">Time (min)</label>
            <input type="number" class="set-input" id="ex-time-${index}" placeholder="0" min="0" value="${activeSession.data[index]?.time || ''}">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label" style="font-size:.65rem">Speed (km/h)</label>
            <input type="number" class="set-input" id="ex-speed-${index}" placeholder="0" min="0" step="0.1" value="${activeSession.data[index]?.speed || ''}">
          </div>
        </div>
      ` : `
        <div class="exercise-inputs">
          <div class="form-group" style="margin:0">
            <label class="form-label" style="font-size:.65rem">Sets</label>
            <input type="number" class="set-input" id="ex-sets-${index}" placeholder="0" min="0" max="20" value="${activeSession.data[index]?.sets || ''}">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label" style="font-size:.65rem">Reps</label>
            <input type="number" class="set-input" id="ex-reps-${index}" placeholder="0" min="0" max="100" value="${activeSession.data[index]?.reps || ''}">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label" style="font-size:.65rem">Weight (kg)</label>
            <input type="number" class="set-input" id="ex-weight-${index}" placeholder="0" min="0" step="0.5" value="${activeSession.data[index]?.weight || ''}">
          </div>
        </div>
      `}

      <div style="margin-top:12px;display:flex;gap:8px">
        ${done ? `
          <button class="btn btn-ghost btn-sm btn-block" disabled>✓ Completed</button>
        ` : `
          <button class="btn btn-primary btn-sm" style="flex:2" onclick="DG.Workout.completeExercise(${index})">Complete</button>
          <button class="btn btn-ghost btn-sm" onclick="DG.Workout.skipExercise(${index})">Skip</button>
        `}
      </div>
    </div>`;
  }

  function startSession() {
    const dayNum = DG.Utils.getDayOfWeek() + 1;
    const exercises = DG.Exercises.getByDay(dayNum);
    const cardio = DG.Exercises.getByDay(0);

    activeSession = {
      split: DG.Utils.todaySplit(),
      exercises: [...exercises, ...cardio],
      completed: new Array(exercises.length + cardio.length).fill(false),
      data: {},
      startTime: Date.now()
    };
    elapsed = 0;
    startTimer();
    DG.App.refresh();
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      elapsed = Math.floor((Date.now() - activeSession.startTime) / 1000);
      const el = document.getElementById('workout-timer');
      if (el) el.textContent = DG.Utils.formatTime(elapsed);
    }, 1000);
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function saveExerciseData(index) {
    const ex = activeSession.exercises[index];
    if (ex.isCardio) {
      const time = parseFloat(document.getElementById(`ex-time-${index}`)?.value) || 0;
      const speed = parseFloat(document.getElementById(`ex-speed-${index}`)?.value) || 0;
      activeSession.data[index] = { time, speed };
    } else {
      const sets = parseInt(document.getElementById(`ex-sets-${index}`)?.value) || 0;
      const reps = parseInt(document.getElementById(`ex-reps-${index}`)?.value) || 0;
      const weight = parseFloat(document.getElementById(`ex-weight-${index}`)?.value) || 0;
      activeSession.data[index] = { sets, reps, weight };
    }
  }

  function completeExercise(index) {
    saveExerciseData(index);
    const data = activeSession.data[index];
    const ex = activeSession.exercises[index];

    // Validate
    if (ex.isCardio) {
      if (!data.time || data.time <= 0) { DG.UI.toast('Enter time spent', 'warning'); return; }
    } else {
      if (!data.sets || data.sets <= 0) { DG.UI.toast('Enter number of sets', 'warning'); return; }
      if (!data.reps || data.reps <= 0) { DG.UI.toast('Enter number of reps', 'warning'); return; }
    }

    activeSession.completed[index] = true;
    const card = document.getElementById(`ex-card-${index}`);
    if (card) {
      card.classList.add('completed');
      card.querySelector('.exercise-inputs')?.querySelectorAll('input').forEach(i => i.disabled = true);
      const btns = card.querySelector('div:last-child');
      if (btns) btns.innerHTML = '<button class="btn btn-ghost btn-sm btn-block" disabled>✓ Completed</button>';
    }
    DG.UI.toast(`${ex.name} completed! 💪`, 'success');

    // Scroll to next uncompleted
    const nextIdx = activeSession.completed.findIndex((c, i) => !c && i > index);
    if (nextIdx >= 0) {
      const nextCard = document.getElementById(`ex-card-${nextIdx}`);
      if (nextCard) nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function skipExercise(index) {
    DG.UI.confirm('Skip this exercise?', 'You can always come back to it.', () => {
      activeSession.completed[index] = true;
      activeSession.data[index] = { skipped: true };
      const card = document.getElementById(`ex-card-${index}`);
      if (card) {
        card.classList.add('completed');
        card.style.opacity = '0.3';
        const btns = card.querySelector('div:last-child');
        if (btns) btns.innerHTML = '<button class="btn btn-ghost btn-sm btn-block" disabled>Skipped</button>';
      }
    });
  }

  function endSession() {
    // Save any unsaved data
    activeSession.exercises.forEach((_, i) => {
      if (!activeSession.data[i]) saveExerciseData(i);
    });

    DG.UI.confirm('End this workout?', 'Your progress will be saved.', () => {
      stopTimer();
      const session = DG.Auth.currentUser();
      const user = DG.Auth.currentUserData();
      const weight = user.profile.weight;

      // Calculate calories
      let totalCalories = 0;
      const exerciseData = [];

      activeSession.exercises.forEach((ex, i) => {
        const data = activeSession.data[i] || {};
        if (data.skipped) return;

        let durationMin = 0;
        if (ex.isCardio) {
          durationMin = data.time || 0;
        } else {
          // Estimate: each set ~2 min (including rest)
          durationMin = (data.sets || 0) * 2;
        }

        const cal = DG.Utils.calcCaloriesBurned(ex.met, weight, durationMin);
        totalCalories += cal;

        exerciseData.push({
          name: ex.name, group: ex.group, priority: ex.priority,
          ...(ex.isCardio ? { time: data.time, speed: data.speed } : { sets: data.sets, reps: data.reps, weight: data.weight }),
          caloriesBurned: cal
        });
      });

      const log = {
        date: DG.Utils.today(),
        split: activeSession.split,
        exercises: exerciseData,
        caloriesBurned: totalCalories,
        duration: elapsed,
        completedAt: new Date().toISOString()
      };

      DG.Storage.updateLogByDate(session.id, 'workout', DG.Utils.today(), log);

      // Show summary
      showSummary(log);
      activeSession = null;
      elapsed = 0;
    });
  }

  function showSummary(log) {
    const completed = log.exercises.filter(e => !e.skipped).length;
    DG.UI.modal('Workout Summary 🎉', `
      <div style="text-align:center">
        <div class="grid-3 mb-lg">
          <div>
            <div class="card-value" style="font-size:1.4rem">${DG.Utils.formatTime(log.duration)}</div>
            <div class="card-label">Duration</div>
          </div>
          <div>
            <div class="card-value" style="font-size:1.4rem">${log.caloriesBurned}</div>
            <div class="card-label">Burned</div>
          </div>
          <div>
            <div class="card-value" style="font-size:1.4rem">${completed}</div>
            <div class="card-label">Exercises</div>
          </div>
        </div>
        <p style="color:var(--success);font-weight:600;font-size:1.1rem">Great work! 💪</p>
        <p style="font-size:.85rem;margin-top:4px">Your calorie allowance has been updated.</p>
      </div>
    `, '<button class="btn btn-primary btn-block" onclick="DG.UI.closeModal();location.hash=\'#dashboard\'">Back to Dashboard</button>');
  }

  function init() {
    if (activeSession) startTimer();
  }

  function cleanup() {
    // Don't stop timer - keep it running in background
  }

  return { render, init, cleanup, startSession, endSession, completeExercise, skipExercise };
})();
