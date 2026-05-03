/* DammiGYM — Authentication System */
window.DG = window.DG || {};

DG.Auth = (() => {
  const ADMIN_USER = 'admin';
  const ADMIN_HASH = null; // Will be computed on first use

  async function getAdminHash() {
    return await DG.Crypto.hashPassword('DammiGYM@2026');
  }

  // Register new user
  async function register(username, password) {
    username = DG.Utils.sanitize(username.trim());
    if (!username || username.length < 3) return { ok: false, msg: 'Username must be at least 3 characters' };
    if (username.length > 20) return { ok: false, msg: 'Username must be 20 characters or less' };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { ok: false, msg: 'Username: letters, numbers, underscore only' };
    if (!password || password.length < 6) return { ok: false, msg: 'Password must be at least 6 characters' };
    if (username.toLowerCase() === 'admin') return { ok: false, msg: 'This username is reserved' };

    const existing = DG.Storage.getUser(username);
    if (existing) return { ok: false, msg: 'Username already taken' };

    const hash = await DG.Crypto.hashPassword(password);
    const user = {
      id: DG.Crypto.uuid(),
      username: username,
      passwordHash: hash,
      profile: null,
      createdAt: new Date().toISOString()
    };

    DG.Storage.addUser(user);
    return { ok: true, user };
  }

  // Login
  async function login(username, password) {
    username = DG.Utils.sanitize(username.trim());
    if (!username || !password) return { ok: false, msg: 'Please enter both fields' };

    const hash = await DG.Crypto.hashPassword(password);

    // Check admin
    if (username.toLowerCase() === ADMIN_USER) {
      const adminHash = await getAdminHash();
      if (hash === adminHash) {
        const session = { id: 'admin', username: 'admin', isAdmin: true };
        DG.Storage.setSession(session);
        return { ok: true, user: session, isAdmin: true };
      }
      return { ok: false, msg: 'Invalid credentials' };
    }

    // Regular user
    const user = DG.Storage.getUser(username);
    if (!user) return { ok: false, msg: 'Invalid credentials' };
    if (user.passwordHash !== hash) return { ok: false, msg: 'Invalid credentials' };

    const session = { id: user.id, username: user.username, isAdmin: false };
    DG.Storage.setSession(session);
    return { ok: true, user: session, needsProfile: !user.profile };
  }

  // Get current session
  function currentUser() {
    return DG.Storage.getSession();
  }

  // Get current user's full data
  function currentUserData() {
    const session = currentUser();
    if (!session || session.isAdmin) return null;
    return DG.Storage.getUserById(session.id);
  }

  // Logout
  function logout() {
    DG.Storage.clearSession();
  }

  // Check if logged in
  function isLoggedIn() {
    return !!currentUser();
  }

  // Check if admin
  function isAdmin() {
    const u = currentUser();
    return u && u.isAdmin;
  }

  return { register, login, logout, currentUser, currentUserData, isLoggedIn, isAdmin };
})();
