/* DammiGYM — App Router & Initialization */
window.DG = window.DG || {};

DG.App = (() => {
  const appEl = () => document.getElementById('app');

  // --- Auth Page Renderers ---
  function renderLogin() {
    return `
    <div class="auth-page">
      <div class="logo">DAMMI<span style="color:#fff">GYM</span></div>
      <div class="tagline">Forge Your Body</div>
      <div class="auth-form animate-fadeUp">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" class="form-input" id="login-user" placeholder="Enter username" maxlength="20" autocomplete="username">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="login-pass" placeholder="Enter password" autocomplete="current-password">
        </div>
        <button class="btn btn-primary btn-block btn-lg mt-lg" id="login-btn" onclick="DG.App.doLogin()">Login</button>
        <p class="text-center mt-lg" style="font-size:.85rem">
          Don't have an account? <a href="#register" style="font-weight:600">Register</a>
        </p>
      </div>
    </div>`;
  }

  function renderRegister() {
    return `
    <div class="auth-page">
      <div class="logo">DAMMI<span style="color:#fff">GYM</span></div>
      <div class="tagline">Create Account</div>
      <div class="auth-form animate-fadeUp">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" class="form-input" id="reg-user" placeholder="Choose a username" maxlength="20" autocomplete="username">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="reg-pass" placeholder="Min 6 characters" autocomplete="new-password">
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input type="password" class="form-input" id="reg-pass2" placeholder="Confirm password" autocomplete="new-password">
        </div>
        <button class="btn btn-primary btn-block btn-lg mt-lg" onclick="DG.App.doRegister()">Create Account</button>
        <p class="text-center mt-lg" style="font-size:.85rem">
          Already have an account? <a href="#login" style="font-weight:600">Login</a>
        </p>
      </div>
    </div>`;
  }

  // --- Navigation ---
  function renderNav(activePage) {
    const session = DG.Auth.currentUser();
    if (!session) return '';
    if (session.isAdmin) return '';

    const items = [
      { id: 'dashboard', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', label: 'Home' },
      { id: 'workout', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5h11M6.5 17.5h11M2 12h2M20 12h2M4 8v8M20 8v8M6 6v12M18 6v12"/></svg>', label: 'Workout' },
      { id: 'nutrition', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>', label: 'Food' },
      { id: 'hydration', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>', label: 'Water' },
      { id: 'progress', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>', label: 'Progress' }
    ];

    // Bottom nav (mobile)
    const bottomNav = `
    <nav class="bottom-nav hide-desktop">
      ${items.map(i => `
        <a class="nav-item ${activePage===i.id?'active':''}" href="#${i.id}">
          ${i.icon}<span>${i.label}</span>
        </a>
      `).join('')}
    </nav>`;

    // Side nav (desktop)
    const sideNav = `
    <nav class="side-nav hide-mobile">
      <div class="nav-logo">DAMMI<span style="color:#fff">GYM</span></div>
      ${items.map(i => `
        <a class="side-nav-item ${activePage===i.id?'active':''}" href="#${i.id}">
          ${i.icon}<span>${i.label}</span>
        </a>
      `).join('')}
      <a class="side-nav-item" href="#weight" ${activePage==='weight'?'style="background:var(--glow-subtle);color:var(--primary)"':''}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        <span>Weight</span>
      </a>
      <div class="side-nav-footer">
        <a class="side-nav-item" href="#" onclick="DG.App.showProfile()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Profile</span>
        </a>
        <a class="side-nav-item" href="#" onclick="DG.App.doLogout()" style="color:var(--error)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Logout</span>
        </a>
      </div>
    </nav>`;

    return bottomNav + sideNav;
  }

  // --- Router ---
  const routes = {
    'login': () => renderLogin(),
    'register': () => renderRegister(),
    'profile-setup': () => DG.Profile.render(),
    'dashboard': () => DG.Dashboard.render(),
    'workout': () => DG.Workout.render(),
    'nutrition': () => DG.Nutrition.render(),
    'hydration': () => DG.Hydration.render(),
    'weight': () => DG.Weight.render(),
    'progress': () => DG.Progress.render(),
    'admin': () => DG.Admin.render()
  };

  const postInit = {
    'profile-setup': () => DG.Profile.init(),
    'dashboard': () => DG.Dashboard.init(),
    'workout': () => DG.Workout.init(),
    'weight': () => DG.Weight.init()
  };

  function route() {
    const hash = location.hash.slice(1) || 'login';
    const session = DG.Auth.currentUser();

    // Auth guard
    if (!session && !['login', 'register'].includes(hash)) {
      location.hash = '#login';
      return;
    }

    // Admin redirect
    if (session && session.isAdmin && !['admin', 'login'].includes(hash)) {
      location.hash = '#admin';
      return;
    }

    // Profile check
    if (session && !session.isAdmin && hash !== 'profile-setup') {
      const user = DG.Storage.getUserById(session.id);
      if (user && !user.profile) {
        location.hash = '#profile-setup';
        return;
      }
    }

    const renderer = routes[hash];
    if (!renderer) {
      location.hash = session ? '#dashboard' : '#login';
      return;
    }

    const pageHTML = renderer();
    const navHTML = ['login', 'register', 'profile-setup', 'admin'].includes(hash) ? '' : renderNav(hash);

    appEl().innerHTML = navHTML + pageHTML;

    // Post-render init
    if (postInit[hash]) postInit[hash]();

    // Enter keypress on auth forms
    if (hash === 'login') {
      const pass = document.getElementById('login-pass');
      if (pass) pass.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
      document.getElementById('login-user')?.focus();
    }
    if (hash === 'register') {
      const pass2 = document.getElementById('reg-pass2');
      if (pass2) pass2.addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
      document.getElementById('reg-user')?.focus();
    }
  }

  function refresh() { route(); }

  // --- Auth Actions ---
  async function doLogin() {
    const user = document.getElementById('login-user')?.value;
    const pass = document.getElementById('login-pass')?.value;

    const btn = document.getElementById('login-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }

    const result = await DG.Auth.login(user, pass);

    if (result.ok) {
      DG.UI.toast('Welcome back! 💪', 'success');
      if (result.isAdmin) {
        location.hash = '#admin';
      } else if (result.user.needsProfile) {
        location.hash = '#profile-setup';
      } else {
        location.hash = '#dashboard';
      }
    } else {
      DG.UI.toast(result.msg, 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
    }
  }

  async function doRegister() {
    const user = document.getElementById('reg-user')?.value;
    const pass = document.getElementById('reg-pass')?.value;
    const pass2 = document.getElementById('reg-pass2')?.value;

    if (pass !== pass2) { DG.UI.toast('Passwords do not match', 'error'); return; }

    const result = await DG.Auth.register(user, pass);
    if (result.ok) {
      DG.UI.toast('Account created! Please login.', 'success');
      location.hash = '#login';
    } else {
      DG.UI.toast(result.msg, 'error');
    }
  }

  function doLogout() {
    DG.UI.confirm('Logout?', 'You will need to login again.', () => {
      DG.Auth.logout();
      DG.UI.toast('Logged out', 'info');
      location.hash = '#login';
    });
  }

  function showProfile() {
    const user = DG.Auth.currentUserData();
    if (!user || !user.profile) return;
    const p = user.profile;
    const streak = DG.Dashboard.calcStreak(user.id);
    const cosmetics = DG.Progress.getUnlockedCosmetics(user.id);
    const nameGlowClass = DG.Progress.getNameGlowClass(cosmetics.nameGlow);
    
    let activeTitleBadge = '';
    const selTitle = p.selectedTitle;
    if (selTitle && selTitle.value) {
      activeTitleBadge = `<div class="title-badge title-badge-${selTitle.tier}" style="margin-top:4px">${selTitle.value}</div>`;
    }

    const titlesHtml = cosmetics.titles.map(t => {
      const isSelected = selTitle && selTitle.value === t.value;
      return `<button class="title-badge title-badge-${t.tier}" style="${isSelected ? 'box-shadow: 0 0 0 2px #fff;' : 'opacity:0.7;cursor:pointer'}" onclick="DG.App.selectTitle('${t.value}', '${t.tier}')">${t.value}</button>`;
    }).join('');

    const titleSelectionSection = cosmetics.titles.length > 0 ? `
      <div class="card mt-md" style="padding:12px;text-align:left">
        <div class="card-label mb-sm">Equip Title</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${titlesHtml}
          ${selTitle && selTitle.value ? `<button class="title-badge title-badge-basic" style="cursor:pointer" onclick="DG.App.selectTitle('','')">Remove Title</button>` : ''}
        </div>
      </div>
    ` : '';

    const borderStyle = cosmetics.profileBorder ? `border:3px solid ${cosmetics.profileBorder === 'gold' ? '#ffd700' : 'var(--primary)'}` : 'border:2px solid var(--border-red)';
    
    DG.UI.modal('Your Profile', `
      <div style="text-align:center;margin-bottom:20px">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--glow-subtle);${borderStyle};display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:1.5rem">
          ${user.username.charAt(0).toUpperCase()}
        </div>
        <h3 style="margin-top:12px" class="${nameGlowClass}">${DG.Utils.sanitize(user.username)}</h3>
        ${activeTitleBadge}
        <div style="margin-top:12px;display:flex;justify-content:center;gap:12px">
          <span style="font-size:.9rem;color:var(--text2)">🔥 Streak: <strong style="color:var(--primary)">${streak}</strong></span>
          <span style="font-size:.9rem;color:var(--text2)">🍕 Cheat Days: <strong style="color:var(--success)">${cosmetics.cheatDays}</strong></span>
        </div>
      </div>
      <div class="grid-2" style="gap:12px">
        <div class="card" style="padding:12px;text-align:center">
          <div class="card-label">Age</div>
          <div style="font-weight:600">${p.age}</div>
        </div>
        <div class="card" style="padding:12px;text-align:center">
          <div class="card-label">Gender</div>
          <div style="font-weight:600">${p.gender}</div>
        </div>
        <div class="card" style="padding:12px;text-align:center">
          <div class="card-label">Height</div>
          <div style="font-weight:600">${p.height} cm</div>
        </div>
        <div class="card" style="padding:12px;text-align:center">
          <div class="card-label">Weight</div>
          <div style="font-weight:600">${p.weight} kg</div>
        </div>
        <div class="card" style="padding:12px;text-align:center">
          <div class="card-label">BMR</div>
          <div style="font-weight:600">${p.bmr} kcal</div>
        </div>
        <div class="card" style="padding:12px;text-align:center">
          <div class="card-label">TDEE</div>
          <div style="font-weight:600">${p.tdee} kcal</div>
        </div>
      </div>
      <div class="card mt-md" style="padding:12px;text-align:center;border-color:var(--border-red)">
        <div class="card-label">Daily Target</div>
        <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:var(--primary)">${p.dailyCalories} kcal</div>
        <div style="font-size:.75rem;color:var(--text3)">${p.deficitPct}% deficit for ${p.goal.replace('_', ' ')}</div>
      </div>
      ${titleSelectionSection}
    `, `
      <button class="btn btn-ghost" onclick="DG.UI.closeModal()">Close</button>
      <button class="btn btn-danger btn-sm" onclick="DG.App.doLogout();DG.UI.closeModal()">Logout</button>
    `);
  }

  function selectTitle(titleValue, titleTier) {
    const session = DG.Auth.currentUser();
    const user = DG.Storage.getUserById(session.id);
    DG.Storage.updateUser(session.id, {
      profile: { ...user.profile, selectedTitle: { value: titleValue, tier: titleTier } }
    });
    DG.App.refresh();
    DG.UI.closeModal();
    setTimeout(showProfile, 50);
  }

  // --- Init ---
  function init() {
    window.addEventListener('hashchange', route);
    route();
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, refresh, doLogin, doRegister, doLogout, showProfile, selectTitle };
})();
