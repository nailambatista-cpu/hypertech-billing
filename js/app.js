/**
 * HYPERTECH SOLUTIONS - App Initialization
 */

document.addEventListener('DOMContentLoaded', () => {
  // Load settings into header
  loadSettings();

  // Initialize dashboard
  updateDashboard();

  // Build invoice and quote forms lazily on first nav
  // (handled in nav() via utils.js)

  // Handle QR verification on verify.html
  // (handled inline in verify.html)

  console.log('%cHYPERTECH SOLUTIONS%c Billing System v2.0 loaded', 
    'color:#0D47A1;font-family:monospace;font-size:14px;font-weight:bold',
    'color:#F57C00;font-size:12px');
});

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('open');
    }
  });
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});
