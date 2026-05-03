/* DammiGYM — Nutrition Tracker with Presets */
window.DG = window.DG || {};

DG.Nutrition = (() => {
  function getPresets() {
    const session = DG.Auth.currentUser();
    return JSON.parse(localStorage.getItem(`dg_presets_${session.id}`) || '[]');
  }

  function savePresets(presets) {
    const session = DG.Auth.currentUser();
    localStorage.setItem(`dg_presets_${session.id}`, JSON.stringify(presets));
  }

  function render() {
    const session = DG.Auth.currentUser();
    const today = DG.Utils.today();
    const cal = DG.Profile.getCalorieInfo(session.id);
    const log = DG.Storage.getLogByDate(session.id, 'nutrition', today);
    const items = log ? (log.items || []) : [];
    const presets = getPresets();

    const pct = Math.min((cal.consumed / cal.adjustedTarget) * 100, 100);
    const overBudget = cal.consumed > cal.adjustedTarget;

    return `
    <div class="page">
      <div class="page-header">
        <h1>Nutrition</h1>
        <button class="btn btn-primary btn-sm" onclick="DG.Nutrition.showAddModal()">+ Add Food</button>
      </div>
      <div class="page-content stagger">
        <!-- Calorie Summary -->
        <div class="card mb-md">
          <div class="flex-between mb-sm">
            <span style="font-weight:600">Daily Calories</span>
            <span style="font-size:.85rem;color:${overBudget ? 'var(--error)' : 'var(--text2)'}">
              ${DG.Utils.formatNum(cal.consumed)} / ${DG.Utils.formatNum(cal.adjustedTarget)} kcal
            </span>
          </div>
          <div class="progress-bar progress-lg">
            <div class="progress-fill ${overBudget ? 'red' : 'green'}" style="width:${pct}%"></div>
          </div>
          <div class="flex-between mt-sm" style="font-size:.75rem;color:var(--text3)">
            <span>Remaining: ${DG.Utils.formatNum(cal.remaining)} kcal</span>
            <span>Burned: +${DG.Utils.formatNum(cal.burned)} kcal</span>
          </div>
        </div>

        <!-- Food Presets -->
        ${presets.length > 0 ? `
          <h4 class="mb-sm" style="font-size:.85rem;color:var(--text2)">⚡ Quick Add from Presets</h4>
          <div class="preset-chips mb-md">
            ${presets.map((p, i) => `
              <div class="preset-chip" onclick="DG.Nutrition.addPreset(${i})">
                <span>${DG.Utils.sanitize(p.name)}</span>
                <span class="chip-cal">${p.calories}</span>
                <span class="preset-chip-delete" onclick="event.stopPropagation();DG.Nutrition.removePreset(${i})">✕</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Food Log -->
        <h3 class="mb-md">Today's Food</h3>
        ${items.length === 0 ? `
          <div class="empty-state">
            <div style="font-size:2.5rem;margin-bottom:12px">🍽️</div>
            <p>No food logged yet today.<br>Tap + to add your meals.</p>
          </div>
        ` : items.map((item, i) => `
          <div class="log-item">
            <div>
              <div class="log-item-name">${DG.Utils.sanitize(item.name)}</div>
              <div style="font-size:.7rem;color:var(--text3)">${item.time || ''}</div>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
              <span class="log-item-value">${item.calories} kcal</span>
              <button class="log-item-delete" onclick="DG.Nutrition.removeItem(${i})" title="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  function showAddModal() {
    const presets = getPresets();
    DG.UI.modal('Add Food', `
      ${presets.length > 0 ? `
        <div style="margin-bottom:16px">
          <div style="font-size:.75rem;color:var(--text3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">Quick Add from Presets</div>
          <div class="preset-chips">
            ${presets.map((p, i) => `
              <div class="preset-chip" onclick="DG.Nutrition.addPreset(${i});DG.UI.closeModal()">
                <span>${DG.Utils.sanitize(p.name)}</span>
                <span class="chip-cal">${p.calories} kcal</span>
              </div>
            `).join('')}
          </div>
          <div style="border-top:1px solid var(--glass-border);margin:16px 0"></div>
        </div>
      ` : ''}
      <div class="form-group">
        <label class="form-label">Food Name</label>
        <input type="text" class="form-input" id="food-name" placeholder="e.g. Chicken Breast" maxlength="50">
      </div>
      <div class="form-group">
        <label class="form-label">Calories (kcal)</label>
        <input type="number" class="form-input" id="food-cal" placeholder="e.g. 350" min="1" max="5000">
      </div>
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="food-save-preset" style="width:18px;height:18px;accent-color:var(--primary)">
          <span style="font-size:.85rem;color:var(--text2)">💾 Save as Preset for future use</span>
        </label>
      </div>
    `, `
      <button class="btn btn-ghost" onclick="DG.UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="DG.Nutrition.addItem()">Add</button>
    `);
    setTimeout(() => document.getElementById('food-name')?.focus(), 300);
  }

  function addItem() {
    const name = document.getElementById('food-name')?.value?.trim();
    const cal = parseInt(document.getElementById('food-cal')?.value);
    const saveAsPreset = document.getElementById('food-save-preset')?.checked;

    if (!name) { DG.UI.toast('Enter a food name', 'error'); return; }
    if (!cal || cal < 1) { DG.UI.toast('Enter valid calories', 'error'); return; }
    if (cal > 5000) { DG.UI.toast('That seems too high', 'warning'); return; }

    const session = DG.Auth.currentUser();
    const today = DG.Utils.today();
    const log = DG.Storage.getLogByDate(session.id, 'nutrition', today) || { date: today, items: [] };
    
    if (!log.items) log.items = [];
    log.items.push({
      name: DG.Utils.sanitize(name),
      calories: cal,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });

    DG.Storage.updateLogByDate(session.id, 'nutrition', today, log);

    // Save preset if checked
    if (saveAsPreset) {
      const presets = getPresets();
      // Avoid duplicates
      if (!presets.find(p => p.name.toLowerCase() === name.toLowerCase())) {
        presets.push({ name: DG.Utils.sanitize(name), calories: cal });
        savePresets(presets);
        DG.UI.toast(`Saved "${name}" as preset ⚡`, 'info');
      }
    }

    DG.UI.closeModal();
    DG.UI.toast(`Added ${name} (${cal} kcal)`, 'success');
    DG.App.refresh();
  }

  function addPreset(index) {
    const presets = getPresets();
    const p = presets[index];
    if (!p) return;

    const session = DG.Auth.currentUser();
    const today = DG.Utils.today();
    const log = DG.Storage.getLogByDate(session.id, 'nutrition', today) || { date: today, items: [] };
    if (!log.items) log.items = [];
    log.items.push({
      name: p.name,
      calories: p.calories,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
    DG.Storage.updateLogByDate(session.id, 'nutrition', today, log);
    DG.UI.toast(`Added ${p.name} (${p.calories} kcal) ⚡`, 'success');
    DG.App.refresh();
  }

  function removePreset(index) {
    const presets = getPresets();
    const name = presets[index]?.name;
    presets.splice(index, 1);
    savePresets(presets);
    DG.UI.toast(`Removed preset "${name}"`, 'info');
    DG.App.refresh();
  }

  function removeItem(index) {
    DG.UI.confirm('Remove this food item?', 'This will update your daily total.', () => {
      const session = DG.Auth.currentUser();
      DG.Storage.removeLogItem(session.id, 'nutrition', DG.Utils.today(), index);
      DG.UI.toast('Item removed', 'info');
      DG.App.refresh();
    });
  }

  function init() {}

  return { render, init, showAddModal, addItem, addPreset, removePreset, removeItem };
})();
