/* DammiGYM — UI Components: Toasts, Confirms, Modals, Loading */
window.DG = window.DG || {};

DG.UI = (() => {
  // --- Toast Notifications ---
  function initToastContainer() {
    if (!document.getElementById('toast-container')) {
      const c = document.createElement('div');
      c.id = 'toast-container';
      c.className = 'toast-container';
      document.body.appendChild(c);
    }
  }

  function toast(message, type = 'info', duration = 3000) {
    initToastContainer();
    const container = document.getElementById('toast-container');
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span style="font-size:1.1rem">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(t);
    setTimeout(() => {
      t.classList.add('toast-exit');
      setTimeout(() => t.remove(), 300);
    }, duration);
  }

  // --- Confirm Dialog (replaces window.confirm) ---
  function confirm(message, subtext, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <div class="confirm-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
        <div class="confirm-msg">${message}</div>
        ${subtext ? `<div class="confirm-sub">${subtext}</div>` : '<div style="height:24px"></div>'}
        <div class="confirm-actions">
          <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
          <button class="btn btn-primary btn-sm" id="confirm-ok">Confirm</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#confirm-ok').onclick = () => {
      overlay.remove();
      if (onConfirm) onConfirm();
    };
    overlay.querySelector('#confirm-cancel').onclick = () => {
      overlay.remove();
      if (onCancel) onCancel();
    };
    // Close on backdrop click
    overlay.addEventListener('click', e => {
      if (e.target === overlay) { overlay.remove(); if (onCancel) onCancel(); }
    });
  }

  // --- Modal ---
  let modalOverlay = null;

  function modal(title, contentHTML, actions) {
    closeModal();
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">${title}</span>
          <button class="modal-close" id="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">${contentHTML}</div>
        ${actions ? `<div class="modal-actions">${actions}</div>` : ''}
      </div>`;
    document.body.appendChild(modalOverlay);
    
    // Animate in
    requestAnimationFrame(() => modalOverlay.classList.add('active'));

    modalOverlay.querySelector('#modal-close-btn').onclick = closeModal;
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) closeModal();
    });
    return modalOverlay;
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      setTimeout(() => { if (modalOverlay) { modalOverlay.remove(); modalOverlay = null; } }, 300);
    }
  }

  // --- Loading Overlay ---
  let loadingEl = null;

  function showLoading(text = 'Loading...') {
    hideLoading();
    loadingEl = document.createElement('div');
    loadingEl.className = 'loading-overlay';
    loadingEl.innerHTML = `<div class="spinner"></div><div class="loading-text">${text}</div>`;
    document.body.appendChild(loadingEl);
  }

  function hideLoading() {
    if (loadingEl) { loadingEl.remove(); loadingEl = null; }
  }

  // --- SVG Calorie Ring ---
  function calorieRing(consumed, target, size = 140) {
    const pct = Math.min(consumed / target, 1.5);
    const r = (size / 2) - 10;
    const c = 2 * Math.PI * r;
    const offset = c - (Math.min(pct, 1) * c);
    const color = pct > 1 ? '#ff4444' : '#ff1a1a';
    const remaining = Math.max(target - consumed, 0);
    return `
      <div class="stat-ring" style="width:${size}px;height:${size}px">
        <svg width="${size}" height="${size}">
          <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
          <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="8"
            stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"
            style="transition:stroke-dashoffset 1s cubic-bezier(.4,0,.2,1);filter:drop-shadow(0 0 6px ${color}40)"/>
        </svg>
        <div class="stat-ring-label">
          <span class="stat-ring-value" style="color:${color}">${DG.Utils.formatNum(remaining)}</span>
          <span class="stat-ring-text">remaining</span>
        </div>
      </div>`;
  }

  return { toast, confirm, modal, closeModal, showLoading, hideLoading, calorieRing };
})();
