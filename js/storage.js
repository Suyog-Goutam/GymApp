/* DammiGYM — Storage Layer (Encrypted localStorage) */
window.DG = window.DG || {};

DG.Storage = (() => {
  const KEYS = {
    users: 'dg_users',
    session: 'dg_session',
    exercises: 'dg_exercises'
  };

  function userLogKey(userId, type) {
    return `dg_${type}_${userId}`;
  }

  // --- Firebase Cloud Sync ---
  const firebaseConfig = {
    apiKey: "AIzaSyD_6jm8BzEq8Lg8x8_ZiQcK89K7hofDsaQ",
    authDomain: "dammigym.firebaseapp.com",
    projectId: "dammigym",
    storageBucket: "dammigym.firebasestorage.app",
    messagingSenderId: "930342841752",
    appId: "1:930342841752:web:f66409ac662460aee14fed",
    measurementId: "G-8S6J17GRTY"
  };

  let db = null;
  if (window.firebase) {
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      initialSync();
    } catch(e) { console.error("Firebase init error", e); }
  }

  function syncToCloud(collection, docId, data) {
    if (!db) return;
    db.collection(collection).doc(docId).set(data).catch(console.error);
  }

  function deleteFromCloud(collection, docId) {
    if (!db) return;
    db.collection(collection).doc(docId).delete().catch(console.error);
  }

  async function initialSync() {
    if (!db) return;
    try {
      // Pull users
      const usersSnap = await db.collection('users').get();
      if (!usersSnap.empty) {
        const cloudUsers = [];
        usersSnap.forEach(doc => cloudUsers.push(doc.data()));
        localStorage.setItem(KEYS.users, DG.Crypto.encrypt(JSON.stringify(cloudUsers)));
      }

      // Pull logs
      const logsSnap = await db.collection('logs').get();
      if (!logsSnap.empty) {
        logsSnap.forEach(doc => {
          if (doc.data().logs) {
            localStorage.setItem(doc.id, DG.Crypto.encrypt(JSON.stringify(doc.data().logs)));
          }
        });
      }

      // Pull exercises
      const exSnap = await db.collection('app').doc('exercises').get();
      if (exSnap.exists && exSnap.data().list) {
        localStorage.setItem('dg_exercises', DG.Crypto.encrypt(JSON.stringify(exSnap.data().list)));
      }

      console.log('Firebase Sync Complete');
      if (window.DG && DG.App && typeof DG.App.refresh === 'function') DG.App.refresh();
    } catch(e) {
      console.error('Firebase Sync Error. Make sure Firestore Security Rules allow read/write!', e);
    }
  }

  // --- Users ---
  function getUsers() {
    try {
      const raw = localStorage.getItem(KEYS.users);
      if (!raw) return [];
      const dec = DG.Crypto.decrypt(raw);
      return dec ? JSON.parse(dec) : [];
    } catch(e) { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem(KEYS.users, DG.Crypto.encrypt(JSON.stringify(users)));
  }

  function getUser(username) {
    return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  function getUserById(id) {
    return getUsers().find(u => u.id === id);
  }

  function addUser(user) {
    const users = getUsers();
    users.push(user);
    saveUsers(users);
    syncToCloud('users', user.id, user);
  }

  function updateUser(userId, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates };
      saveUsers(users);
      syncToCloud('users', userId, users[idx]);
      return true;
    }
    return false;
  }

  // --- Session ---
  function getSession() {
    try {
      const raw = sessionStorage.getItem(KEYS.session);
      if (!raw) return null;
      return JSON.parse(DG.Crypto.decrypt(raw));
    } catch(e) { return null; }
  }

  function setSession(data) {
    sessionStorage.setItem(KEYS.session, DG.Crypto.encrypt(JSON.stringify(data)));
  }

  function clearSession() {
    sessionStorage.removeItem(KEYS.session);
  }

  // --- Logs (workout, nutrition, hydration, weight) ---
  function getLogs(userId, type) {
    try {
      const raw = localStorage.getItem(userLogKey(userId, type));
      if (!raw) return [];
      const dec = DG.Crypto.decrypt(raw);
      return dec ? JSON.parse(dec) : [];
    } catch(e) { return []; }
  }

  function saveLogs(userId, type, logs) {
    const key = userLogKey(userId, type);
    localStorage.setItem(key, DG.Crypto.encrypt(JSON.stringify(logs)));
    syncToCloud('logs', key, { logs });
  }

  function addLog(userId, type, entry) {
    const logs = getLogs(userId, type);
    logs.push(entry);
    saveLogs(userId, type, logs);
  }

  function getLogByDate(userId, type, date) {
    return getLogs(userId, type).find(l => l.date === date);
  }

  function updateLogByDate(userId, type, date, data) {
    const logs = getLogs(userId, type);
    const idx = logs.findIndex(l => l.date === date);
    if (idx >= 0) {
      logs[idx] = { ...logs[idx], ...data };
    } else {
      logs.push({ date, ...data });
    }
    saveLogs(userId, type, logs);
  }

  function removeLogItem(userId, type, date, itemIndex) {
    const logs = getLogs(userId, type);
    const log = logs.find(l => l.date === date);
    if (log && log.items && log.items[itemIndex] !== undefined) {
      log.items.splice(itemIndex, 1);
      saveLogs(userId, type, logs);
    }
  }

  // Delete user (admin function)
  function removeUser(userId) {
    if (userId === 'admin') return; // protect default admin
    const users = getUsers().filter(u => u.id !== userId);
    saveUsers(users);
    deleteFromCloud('users', userId);
    
    // Also cleanup their logs
    ['workout', 'nutrition', 'hydration', 'weight'].forEach(type => {
      const key = userLogKey(userId, type);
      localStorage.removeItem(key);
      deleteFromCloud('logs', key);
    });
  }

  // Clear today's logs for a user (admin function)
  function clearUserToday(userId, date) {
    ['workout', 'nutrition', 'hydration'].forEach(type => {
      const logs = getLogs(userId, type);
      const filtered = logs.filter(l => l.date !== date);
      saveLogs(userId, type, filtered);
    });
  }

  return {
    getUsers, saveUsers, getUser, getUserById, addUser, updateUser, removeUser,
    getSession, setSession, clearSession,
    getLogs, saveLogs, addLog, getLogByDate, updateLogByDate, removeLogItem,
    clearUserToday, syncToCloud, deleteFromCloud
  };
})();
