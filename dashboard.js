/**
 * HYPERTECH SOLUTIONS - Dashboard Module
 */

function updateDashboard() {
  const now          = new Date();
  const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const invs         = State.invoices;

  // Stats
  document.getElementById('stat-total').textContent  = invs.length;
  document.getElementById('stat-month').textContent  = invs.filter(i => new Date(i.date) >= startOfMonth).length;
  document.getElementById('stat-week').textContent   = invs.filter(i => new Date(i.date) >= startOfWeek).length;

  const monthRevenue = invs.filter(i => new Date(i.date) >= startOfMonth && i.status !== 'cancelled')
                           .reduce((a, i) => a + (i.total || 0), 0);
  document.getElementById('stat-revenue').textContent = fmt(monthRevenue);

  // Recent invoices
  const recent = invs.slice(0, 6);
  const rc     = document.getElementById('recent-invoices');
  if (rc) {
    if (!recent.length) {
      rc.innerHTML = `<div class="empty-state"><div class="empty-icon">&#128196;</div><p>No hay facturas aún</p></div>`;
    } else {
      rc.innerHTML = `
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>
              ${recent.map(i => `
                <tr onclick="viewInvoice(${i.id})" style="cursor:pointer">
                  <td style="color:var(--blue);font-weight:700">${i.number}</td>
                  <td>${i.clientName}</td>
                  <td>${fmtDate(i.date)}</td>
                  <td style="font-weight:700">${fmt(i.total)}</td>
                  <td>${statusBadge(i.status)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }
  }

  // Recent clients
  const rcl = document.getElementById('recent-clients');
  if (rcl) {
    const clients = State.clients.slice(0, 6);
    if (!clients.length) {
      rcl.innerHTML = `<div class="empty-state"><div class="empty-icon">&#128100;</div><p>No hay clientes aún</p></div>`;
    } else {
      rcl.innerHTML = clients.map(c => {
        const count = State.invoices.filter(i => i.clientName === c.name || i.clientEmail === c.email).length;
        return `
          <div class="client-card-mini" onclick="nav('clients')">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="avatar">${initials(c.name)}</div>
              <div>
                <div class="name">${c.name}</div>
                <div class="info">${c.email || c.phone || c.rnc || 'Sin datos'} &mdash; ${count} factura(s)</div>
              </div>
            </div>
          </div>`;
      }).join('');
    }
  }
}
