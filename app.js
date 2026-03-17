/**
 * HYPERTECH SOLUTIONS - App Initialization
 */

document.addEventListener('DOMContentLoaded', async () => {
  // SESSION GUARD
  const session = sessionStorage.getItem('ht_session');
  if (!session) { window.location.href = 'login.html'; return; }

  // Show user in header
  try {
    const user = JSON.parse(session);
    const nameEl   = document.getElementById('hdr-username');
    const avatarEl = document.getElementById('hdr-avatar');
    if (nameEl)   nameEl.textContent   = user.username;
    if (avatarEl) avatarEl.textContent = user.username.charAt(0).toUpperCase();
  } catch(e) {}

  // Load ALL data from Supabase
  await State.loadAll();

  // Apply settings to header
  loadSettings();

  // Show dashboard
  updateDashboard();

  console.log('%cHYPERTECH SOLUTIONS%c DB Connected ✓',
    'color:#0D47A1;font-size:14px;font-weight:bold',
    'color:#F57C00;font-size:12px');
});

function doLogout() {
  if (confirm('¿Desea cerrar la sesión?')) {
    sessionStorage.removeItem('ht_session');
    window.location.href = 'login.html';
  }
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape')
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});
