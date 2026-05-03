/* DammiGYM — Hydration Tracker (No-scroll + Hold-to-fill) */
window.DG = window.DG || {};

DG.Hydration = (() => {
  const DEFAULT_GOAL = 3000; // ml
  let holdTimer = null;
  let holdRAF = null;
  let holdAccumulated = 0;

  function render() {
    const session = DG.Auth.currentUser();
    const today = DG.Utils.today();
    const log = DG.Storage.getLogByDate(session.id, 'hydration', today);
    const intake = log ? (log.intakeMl || 0) : 0;
    const goal = DEFAULT_GOAL;
    const pct = Math.min((intake / goal) * 100, 100);
    const remaining = Math.max(goal - intake, 0);
    const glassesDone = Math.floor(intake / 250);
    const glassesTotal = Math.ceil(goal / 250);
    const waterPctFill = Math.min(pct, 100);

    return `
    <div class="page page-hydration">
      <div class="page-header"><h1>Hydration</h1></div>
      <div class="page-content stagger" style="overflow:hidden">
        <!-- Water Glass Visual (hold to fill) -->
        <div style="text-align:center;margin-bottom:16px">
          <div class="water-glass" id="water-jar" style="margin:0 auto 12px"
               onmousedown="DG.Hydration.startHold(event)"
               ontouchstart="DG.Hydration.startHold(event)">
            <div class="water-fill" id="water-fill-el" style="height:${waterPctFill}%"></div>
          </div>
          <div style="font-family:var(--font-display);font-size:2rem;font-weight:700;color:var(--info)">
            <span id="water-amount-display">${intake}</span><span style="font-size:1rem;color:var(--text3)">ml</span>
          </div>
          <div style="font-size:.85rem;color:var(--text2)">of ${goal}ml goal</div>
          ${pct >= 100 ? '<div style="margin-top:6px;color:var(--success);font-weight:600">🎉 Goal reached!</div>' : ''}
          <div class="water-hint">Hold the glass to fill +10ml/sec</div>
        </div>

        <!-- Progress -->
        <div class="card mb-md" style="padding:14px">
          <div class="flex-between mb-sm">
            <span style="font-weight:600">Progress</span>
            <span style="font-size:.85rem;color:var(--text2)">${Math.round(pct)}%</span>
          </div>
          <div class="progress-bar progress-lg">
            <div class="progress-fill blue" style="width:${pct}%"></div>
          </div>
          <div class="flex-between mt-sm" style="font-size:.75rem;color:var(--text3)">
            <span>${glassesDone} of ${glassesTotal} glasses</span>
            <span>${remaining}ml remaining</span>
          </div>
        </div>

        <!-- Quick Add -->
        <div style="text-align:center;margin-bottom:12px">
          <div class="quick-add" style="justify-content:center">
            <button class="quick-add-btn" onclick="DG.Hydration.add(250)">+250ml</button>
            <button class="quick-add-btn" onclick="DG.Hydration.add(500)">+500ml</button>
            <button class="quick-add-btn" onclick="DG.Hydration.add(750)">+750ml</button>
            <button class="quick-add-btn" onclick="DG.Hydration.add(1000)">+1000ml</button>
          </div>
        </div>

        <!-- Custom + Reset -->
        <div class="card" style="padding:14px">
          <label class="form-label" style="margin-bottom:6px">Custom Amount (ml)</label>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="number" class="form-input" id="custom-water" placeholder="e.g. 330" min="1" max="5000" style="flex:1">
            <button class="btn btn-primary btn-sm" onclick="DG.Hydration.addCustom()" style="flex-shrink:0">Add</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--text3);flex-shrink:0" onclick="DG.Hydration.reset()">Reset</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function add(ml) {
    const session = DG.Auth.currentUser();
    const today = DG.Utils.today();
    const log = DG.Storage.getLogByDate(session.id, 'hydration', today) || { date: today, intakeMl: 0 };
    log.intakeMl = (log.intakeMl || 0) + ml;
    DG.Storage.updateLogByDate(session.id, 'hydration', today, log);
    DG.UI.toast(`+${ml}ml 💧`, 'success');
    DG.App.refresh();
  }

  function addCustom() {
    const val = parseInt(document.getElementById('custom-water')?.value);
    if (!val || val < 1) { DG.UI.toast('Enter a valid amount', 'error'); return; }
    if (val > 5000) { DG.UI.toast('That seems like a lot!', 'warning'); return; }
    add(val);
  }

  function reset() {
    DG.UI.confirm('Reset hydration for today?', 'This will set your intake back to 0.', () => {
      const session = DG.Auth.currentUser();
      DG.Storage.updateLogByDate(session.id, 'hydration', DG.Utils.today(), { date: DG.Utils.today(), intakeMl: 0 });
      DG.UI.toast('Hydration reset', 'info');
      DG.App.refresh();
    });
  }

  // --- Hold-to-fill logic ---
  function startHold(e) {
    e.preventDefault();
    const jar = document.getElementById('water-jar');
    if (jar) jar.classList.add('filling');

    holdAccumulated = 0;
    const startTime = performance.now();

    // Smooth fill animation at ~60fps
    function fillTick(now) {
      const elapsed = now - startTime;
      const totalMl = Math.floor(elapsed / 100); // 10ml per 100ms = 10ml/sec → effectively filling
      holdAccumulated = totalMl;

      // Update visual in real-time
      const session = DG.Auth.currentUser();
      const today = DG.Utils.today();
      const log = DG.Storage.getLogByDate(session.id, 'hydration', today) || { date: today, intakeMl: 0 };
      const currentTotal = (log.intakeMl || 0) + holdAccumulated;
      const pct = Math.min((currentTotal / DEFAULT_GOAL) * 100, 100);

      const fillEl = document.getElementById('water-fill-el');
      const amountEl = document.getElementById('water-amount-display');
      if (fillEl) fillEl.style.height = pct + '%';
      if (amountEl) amountEl.textContent = currentTotal;

      holdRAF = requestAnimationFrame(fillTick);
    }

    holdRAF = requestAnimationFrame(fillTick);

    // Listen for release
    const stopHold = () => {
      cancelAnimationFrame(holdRAF);
      const jar = document.getElementById('water-jar');
      if (jar) jar.classList.remove('filling');

      document.removeEventListener('mouseup', stopHold);
      document.removeEventListener('touchend', stopHold);
      document.removeEventListener('mouseleave', stopHold);

      if (holdAccumulated > 0) {
        const session = DG.Auth.currentUser();
        const today = DG.Utils.today();
        const log = DG.Storage.getLogByDate(session.id, 'hydration', today) || { date: today, intakeMl: 0 };
        log.intakeMl = (log.intakeMl || 0) + holdAccumulated;
        DG.Storage.updateLogByDate(session.id, 'hydration', today, log);
        DG.UI.toast(`+${holdAccumulated}ml 💧`, 'success');
        holdAccumulated = 0;
        DG.App.refresh();
      }
    };

    document.addEventListener('mouseup', stopHold);
    document.addEventListener('touchend', stopHold);
    document.addEventListener('mouseleave', stopHold);
  }

  function init() {}

  return { render, init, add, addCustom, reset, startHold };
})();
