/* DammiGYM — Admin Panel */
window.DG = window.DG || {};

DG.Admin = (() => {
  let activeTab = 'exercises';

  function render() {
    if (!DG.Auth.isAdmin()) {
      return '<div class="page-content" style="text-align:center;padding-top:80px"><h2>Access Denied</h2><p>Admin only.</p></div>';
    }
    return `
    <div class="page">
      <div class="page-header">
        <h1>Admin</h1>
        <button class="btn btn-ghost btn-sm" onclick="DG.Auth.logout();location.hash='#login'">Logout</button>
      </div>
      <div class="page-content">
        <div class="tabs mb-lg">
          <div class="tab ${activeTab==='exercises'?'active':''}" onclick="DG.Admin.switchTab('exercises')">Exercises</div>
          <div class="tab ${activeTab==='users'?'active':''}" onclick="DG.Admin.switchTab('users')">Users</div>
        </div>
        <div id="admin-content">${activeTab === 'exercises' ? renderExercises() : renderUsers()}</div>
      </div>
    </div>`;
  }

  function renderExercises() {
    const exercises = DG.Exercises.getAll();
    const groups = {};
    exercises.forEach(ex => {
      const key = `Day ${ex.day}: ${ex.split}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ex);
    });

    let html = `<button class="btn btn-primary btn-sm mb-lg" onclick="DG.Admin.showAddExercise()">+ Add Exercise</button>`;

    const sortedGroups = Object.entries(groups).sort((a, b) => parseInt(a[1][0].day) - parseInt(b[1][0].day));

    for (const [group, exs] of sortedGroups) {
      const dayNum = parseInt(exs[0].day);
      
      const dayOptions = [1, 2, 3, 4, 5, 6]
        .filter(d => d !== dayNum)
        .map(d => `<option value="${d}">Day ${d}</option>`)
        .join('');

      html += `
        <div class="day-group" style="border:1px solid transparent; border-radius:8px; padding:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h4 class="mb-sm mt-lg" style="color:var(--text2)">${group}</h4>
            <select class="form-input form-select" style="width:auto; padding:4px 8px; font-size:0.8rem; height:auto; margin-top:12px" onchange="DG.Admin.handleDaySwap(${dayNum}, this.value)">
              <option value="" disabled selected>Move this session to day...</option>
              ${dayOptions}
            </select>
          </div>
      `;
      html += exs.map(ex => `
        <div class="log-item">
          <div style="flex:1">
            <div class="log-item-name">${DG.Utils.sanitize(ex.name)}</div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
              ${DG.Exercises.priorityBadge(ex.priority)}
              <span style="font-size:.7rem;color:var(--text3)">${ex.group} · MET ${ex.met}</span>
              ${ex.youtubeUrl ? '<span style="font-size:.7rem;color:var(--success)">📹 Video</span>' : '<span style="font-size:.7rem;color:var(--text3)">No video</span>'}
            </div>
          </div>
          <div style="display:flex;gap:4px">
            <button class="btn-icon" style="border:1px solid var(--glass-border);width:32px;height:32px" onclick="DG.Admin.editExercise('${ex.id}')" title="Edit">✏️</button>
            <button class="btn-icon" style="border:1px solid var(--glass-border);width:32px;height:32px" onclick="DG.Admin.deleteExercise('${ex.id}')" title="Delete">🗑️</button>
          </div>
        </div>
      `).join('');
      html += `</div>`;
    }
    return html;
  }

  function renderUsers() {
    const users = DG.Storage.getUsers();
    if (!users.length) return '<div class="empty-state"><p>No registered users yet.</p></div>';

    return users.map(u => {
      // Compute stats
      const wLogs = DG.Storage.getLogs(u.id, 'workout');
      const streak = DG.Dashboard.calcStreak(u.id);
      const totalWorkouts = wLogs.length;
      const totalCals = wLogs.reduce((s, log) => s + (log.caloriesBurned || 0), 0);
      const cosmetics = DG.Progress.getUnlockedCosmetics(u.id);
      const achCount = cosmetics.unlockedAchievements.length;

      const achListHtml = achCount > 0 ? `
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--glass-border)">
          <div style="font-size:.7rem;color:var(--text3);text-transform:uppercase;margin-bottom:6px">Unlocked Achievements</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${cosmetics.unlockedAchievements.map(a => `<span style="padding:2px 6px;border-radius:4px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);font-size:.65rem;color:var(--text2);white-space:nowrap">${a.icon} ${a.name}</span>`).join('')}
          </div>
        </div>
      ` : '';

      return `
      <div class="user-detail-card">
        <div class="user-detail-header">
          <div>
            <div style="font-weight:600;font-size:1.1rem;color:var(--primary)">${DG.Utils.sanitize(u.username)}</div>
            <div style="font-size:.75rem;color:var(--text3)">
              Joined: ${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}
              ${u.profile ? ` · ${u.profile.weight}kg · ${u.profile.goal.replace('_', ' ')}` : ' · No profile setup'}
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-ghost btn-sm" onclick="DG.Admin.clearUserData('${u.id}', '${DG.Utils.sanitize(u.username)}')">Clear Today</button>
            <button class="btn btn-danger btn-sm" onclick="DG.Admin.deleteUser('${u.id}', '${DG.Utils.sanitize(u.username)}')">Delete</button>
          </div>
        </div>
        <div class="user-detail-stats mt-sm">
          <div class="user-detail-stat">
            <div class="stat-val">${streak}</div>
            <div class="stat-lbl">Streak</div>
          </div>
          <div class="user-detail-stat">
            <div class="stat-val">${totalWorkouts}</div>
            <div class="stat-lbl">Workouts</div>
          </div>
          <div class="user-detail-stat">
            <div class="stat-val">${DG.Utils.formatNum(totalCals)}</div>
            <div class="stat-lbl">Kcal Burned</div>
          </div>
          <div class="user-detail-stat">
            <div class="stat-val">${achCount}</div>
            <div class="stat-lbl">Achievements</div>
          </div>
        </div>
        ${achListHtml}
      </div>
      `;
    }).join('');
  }

  function switchTab(tab) {
    activeTab = tab;
    DG.App.refresh();
  }

  function showAddExercise(editEx) {
    const ex = editEx || { id: '', name: '', group: 'Chest', split: 'Chest + Triceps', day: 1, priority: 'can', met: 4.0, youtubeUrl: '', instructions: '', isCardio: false };
    const isEdit = !!editEx;

    DG.UI.modal(isEdit ? 'Edit Exercise' : 'Add Exercise', `
      <div class="form-group">
        <label class="form-label">Name</label>
        <input type="text" class="form-input" id="ex-name" value="${DG.Utils.sanitize(ex.name)}" maxlength="60">
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Muscle Group</label>
          <select class="form-input form-select" id="ex-group">
            ${['Chest','Back','Shoulders','Biceps','Triceps','Legs','Abs','Cardio'].map(g =>
              `<option value="${g}" ${ex.group===g?'selected':''}>${g}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select class="form-input form-select" id="ex-priority">
            <option value="must" ${ex.priority==='must'?'selected':''}>🔴 Must Do</option>
            <option value="have" ${ex.priority==='have'?'selected':''}>🟠 Have To</option>
            <option value="can" ${ex.priority==='can'?'selected':''}>🟢 Can Do</option>
            <option value="skip" ${ex.priority==='skip'?'selected':''}>🔵 Can Skip</option>
          </select>
        </div>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Day (1-6)</label>
          <input type="number" class="form-input" id="ex-day" value="${ex.day}" min="0" max="6">
        </div>
        <div class="form-group">
          <label class="form-label">MET Value</label>
          <input type="number" class="form-input" id="ex-met" value="${ex.met}" min="1" max="20" step="0.5">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Split</label>
        <select class="form-input form-select" id="ex-split">
          ${['Chest + Triceps','Back + Biceps','Shoulders + Abs','Legs','any'].map(s =>
            `<option value="${s}" ${ex.split===s?'selected':''}>${s}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">YouTube URL</label>
        <input type="url" class="form-input" id="ex-youtube" value="${DG.Utils.sanitize(ex.youtubeUrl)}" placeholder="https://youtube.com/watch?v=...">
      </div>
      <div class="form-group">
        <label class="form-label">Instructions</label>
        <textarea class="form-input" id="ex-instructions" rows="3" style="resize:vertical">${DG.Utils.sanitize(ex.instructions)}</textarea>
      </div>
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="ex-cardio" ${ex.isCardio?'checked':''} style="width:18px;height:18px;accent-color:var(--primary)">
          <span class="form-label" style="margin:0">Is Cardio Exercise</span>
        </label>
      </div>
    `, `
      <button class="btn btn-ghost" onclick="DG.UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="DG.Admin.saveExercise('${ex.id}')">${isEdit ? 'Update' : 'Add'}</button>
    `);
  }

  function editExercise(id) {
    const ex = DG.Exercises.getAll().find(e => e.id === id);
    if (ex) showAddExercise(ex);
  }

  function saveExercise(existingId) {
    const name = document.getElementById('ex-name')?.value?.trim();
    if (!name) { DG.UI.toast('Enter exercise name', 'error'); return; }

    const exercise = {
      id: existingId || 'ex_' + Date.now(),
      name,
      group: document.getElementById('ex-group').value,
      split: document.getElementById('ex-split').value,
      day: parseInt(document.getElementById('ex-day').value) || 1,
      priority: document.getElementById('ex-priority').value,
      met: parseFloat(document.getElementById('ex-met').value) || 4.0,
      youtubeUrl: document.getElementById('ex-youtube')?.value?.trim() || '',
      instructions: document.getElementById('ex-instructions')?.value?.trim() || '',
      isCardio: document.getElementById('ex-cardio')?.checked || false
    };

    DG.Exercises.save(exercise);
    DG.UI.closeModal();
    DG.UI.toast(existingId ? 'Exercise updated' : 'Exercise added', 'success');
    DG.App.refresh();
  }

  function deleteExercise(id) {
    const ex = DG.Exercises.getAll().find(e => e.id === id);
    DG.UI.confirm(`Delete "${ex?.name}"?`, 'This cannot be undone.', () => {
      DG.Exercises.remove(id);
      DG.UI.toast('Exercise deleted', 'info');
      DG.App.refresh();
    });
  }

  function clearUserData(userId, username) {
    DG.UI.confirm(`Clear today's data for ${username}?`, 'This will remove workout, nutrition, and hydration logs for today.', () => {
      DG.Storage.clearUserToday(userId, DG.Utils.today());
      DG.UI.toast(`Cleared data for ${username}`, 'success');
      DG.App.refresh();
    });
  }

  function deleteUser(userId, username) {
    if (userId === 'admin') {
      DG.UI.toast('Cannot delete the default admin account', 'error');
      return;
    }
    DG.UI.confirm('Delete User?', `Are you absolutely sure you want to delete ${username} and ALL their data? This cannot be undone.`, () => {
      DG.Storage.removeUser(userId);
      DG.UI.toast(`User ${username} deleted`, 'info');
      DG.App.refresh();
    });
  }

  function handleDaySwap(sourceDay, targetDay) {
    if (!sourceDay || !targetDay) return;
    DG.Exercises.swapDays(sourceDay, targetDay);
    DG.UI.toast(`Swapped Day ${sourceDay} with Day ${targetDay}`, 'success');
    DG.App.refresh();
  }

  function init() {}

  return { render, init, switchTab, showAddExercise, editExercise, saveExercise, deleteExercise, clearUserData, deleteUser, handleDaySwap };
})();
