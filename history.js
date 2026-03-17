/**
 * HYPERTECH SOLUTIONS - History Module
 */

function renderHistory() {
  filterHistory();
}

function filterHistory() {
  const q      = (document.getElementById('search-inv')?.value || '').toLowerCase();
  const from   = document.getElementById('filter-from')?.value || '';
  const to     = document.getElementById('filter-to')?.value   || '';
  const status = document.getElementById('filter-status')?.value || '';

  let data = [...State.invoices];
  if (q)      data = data.filter(i =>
    i.clientName.toLowerCase().includes(q) ||
    i.number.toLowerCase().includes(q)     ||
    (i.clientEmail && i.clientEmail.toLowerCase().includes(q)) ||
    (i.clientRnc   && i.clientRnc.includes(q)) ||
    (i.ncf         && i.ncf.toLowerCase().includes(q))
  );
  if (from)   data = data.filter(i => i.date >= from);
  if (to)     data = data.filter(i => i.date <= to);
  if (status) data = data.filter(i => i.status === status);

  renderHistTable(data, 'history-table-container');
}

function filterByPeriod() {
  const p   = document.getElementById('filter-period')?.value;
  const now = new Date();
  let from = '', to = '';

  if (p === 'today') {
    from = to = now.toISOString().split('T')[0];
  } else if (p === 'week') {
    const s = new Date(now);
    s.setDate(now.getDate() - now.getDay());
    from = s.toISOString().split('T')[0];
    to   = now.toISOString().split('T')[0];
  } else if (p === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    to   = now.toISOString().split('T')[0];
  }

  const fromEl = document.getElementById('filter-from');
  const toEl   = document.getElementById('filter-to');
  if (fromEl) fromEl.value = from;
  if (toEl)   toEl.value   = to;
  filterHistory();
}

function clearFilters() {
  ['search-inv', 'filter-from', 'filter-to'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const fs = document.getElementById('filter-status');
  const fp = document.getElementById('filter-period');
  if (fs) fs.value = '';
  if (fp) fp.value = '';
  filterHistory();
}

function renderHistTable(data, containerId) {
  const cont = document.getElementById(containerId);
  if (!cont) return;

  if (!data.length) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-icon">&#128196;</div><p>No se encontraron facturas</p></div>`;
    return;
  }

  const total = data.reduce((a, i) => a + (i.total || 0), 0);

  cont.innerHTML = `
    <div style="margin-bottom:12px;font-size:13px;color:var(--gray3)">
      ${data.length} factura(s) &nbsp;|&nbsp; Total: <strong style="color:var(--blue-dark)">${fmt(total)}</strong>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th># Factura</th>
            <th>NCF</th>
            <th>Cliente</th>
            <th>RNC/Cédula</th>
            <th>Fecha</th>
            <th>Vencimiento</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(i => `
            <tr>
              <td style="color:var(--blue);font-weight:700">${i.number}</td>
              <td style="font-size:12px;color:var(--orange);font-weight:600">${i.ncf || State.generateNCF(i.number)}</td>
              <td>${i.clientName}</td>
              <td style="font-size:12px">${i.clientRnc || 'CF'}</td>
              <td>${fmtDate(i.date)}</td>
              <td>${fmtDate(i.dueDate || '')}</td>
              <td style="font-weight:700">${fmt(i.total)}</td>
              <td>${statusBadge(i.status)}</td>
              <td>
                <div class="tbl-actions">
                  <button class="btn btn-sm btn-ghost" onclick="viewInvoice(${i.id})" title="Ver">&#128065;</button>
                  <button class="btn btn-sm btn-orange" onclick="emailInvoice(${i.id})" title="Email">&#9993;</button>
                  <button class="btn btn-sm btn-ghost" onclick="changeStatus(${i.id})" title="Estado">&#9998;</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderQuoteHistory() {
  const cont = document.getElementById('quotes-table-container');
  if (!cont) return;
  const data = State.quotes;

  if (!data.length) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-icon">&#128203;</div><p>No hay cotizaciones</p></div>`;
    return;
  }

  cont.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Válida Hasta</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(i => `
            <tr>
              <td style="color:var(--blue);font-weight:700">${i.number}</td>
              <td>${i.clientName}</td>
              <td>${fmtDate(i.date)}</td>
              <td>${fmtDate(i.expiry || '')}</td>
              <td style="font-weight:700">${fmt(i.total)}</td>
              <td>
                <div class="tbl-actions">
                  <button class="btn btn-sm btn-ghost" onclick="viewQuote(${i.id})">&#128065;</button>
                  <button class="btn btn-sm btn-orange" onclick="currentViewId=${i.id};sendEmailModal()">&#9993;</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function emailInvoice(id) {
  currentViewId = id;
  sendEmailModal();
}

function changeStatus(id) {
  const inv = State.invoices.find(i => i.id === id);
  if (!inv) return;
  const statuses = ['pending', 'paid', 'cancelled'];
  const cur = statuses.indexOf(inv.status);
  const labels = { pending: 'Pendiente', paid: 'Pagado', cancelled: 'Cancelado' };
  const next = statuses[(cur + 1) % statuses.length];
  inv.status = next;
  State.save('invoices');
  toast(`Estado cambiado a: ${labels[next]}`);
  filterHistory();
}

function verifyInvoice() {
  const num = document.getElementById('verify-number')?.value.trim();
  if (!num) { toast('Ingrese un número de factura', 'error'); return; }
  const inv = State.invoices.find(i => i.number === num);
  const res = document.getElementById('verify-result');
  if (!res) return;
  if (inv) {
    const url = `verify.html?inv=${inv.number}&data=${encodeInvData(inv)}`;
    res.innerHTML = `
      <div style="background:#E8F5E9;border:1.5px solid #A5D6A7;border-radius:8px;padding:14px 18px">
        <div style="font-weight:700;color:#2E7D32;font-size:15px">&#9989; Factura Encontrada</div>
        <div style="font-size:13px;color:#333;margin-top:8px;line-height:1.7">
          <strong>No.:</strong> ${inv.number}<br>
          <strong>NCF:</strong> ${inv.ncf || State.generateNCF(inv.number)}<br>
          <strong>Cliente:</strong> ${inv.clientName}<br>
          <strong>Total:</strong> ${fmt(inv.total)}<br>
          <strong>Estado:</strong> ${inv.status}
        </div>
        <a href="${url}" target="_blank" class="btn btn-primary btn-sm" style="margin-top:12px;display:inline-flex">Ver Portal DGII</a>
      </div>`;
  } else {
    res.innerHTML = `
      <div style="background:#FFEBEE;border:1.5px solid #FFCDD2;border-radius:8px;padding:14px 18px">
        <div style="font-weight:700;color:#C62828;font-size:15px">&#10060; No Encontrada</div>
        <div style="font-size:13px;color:#555;margin-top:6px">No se encontró la factura <strong>${num}</strong></div>
      </div>`;
  }
}
