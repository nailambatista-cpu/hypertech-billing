/**
 * HYPERTECH SOLUTIONS - Utility Functions
 */

// Format currency
function fmt(n) {
  const cur = State.settings.currency || 'RD$';
  return cur + parseFloat(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format date DD/MM/YYYY
function fmtDate(d) {
  if (!d) return '-';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

// Today's date as YYYY-MM-DD
function today() {
  return new Date().toISOString().split('T')[0];
}

// Date N days from today
function daysFromToday(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// Status badge HTML
function statusBadge(s) {
  const map    = { paid: 'badge-paid', pending: 'badge-pending', quote: 'badge-quote', cancelled: 'badge-cancelled' };
  const labels = { paid: 'Pagado', pending: 'Pendiente', quote: 'Cotización', cancelled: 'Cancelado' };
  return `<span class="badge ${map[s] || 'badge-pending'}">${labels[s] || s}</span>`;
}

// Toast notification
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// Modal helpers
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Navigation
function nav(panel) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const panelEl = document.getElementById('panel-' + panel);
  if (panelEl) panelEl.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick') === `nav('${panel}')`) n.classList.add('active');
  });
  // Panel init hooks
  if (panel === 'dashboard')    updateDashboard();
  if (panel === 'history')      { renderHistory(); renderQuoteHistory(); }
  if (panel === 'clients')      renderClients();
  if (panel === 'new-invoice')  { buildInvoiceForm(); initInvoiceForm(); updateClientSelects(); }
  if (panel === 'new-quote')    { buildQuoteForm(); initQuoteForm(); updateClientSelects(); }
  if (panel === 'settings')     loadSettings();
}

// Tab switching (history)
function switchHistTab(id, btn) {
  document.querySelectorAll('#panel-history .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#panel-history .tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(id).classList.add('active');
}

// Initials from name
function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

// Generate QR code for invoice (DGII-compatible)
function generateInvoiceQR(containerId, inv, size = 90) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';

  // Build verify URL with invoice data encoded (DGII portable format)
  const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
  const qrPayload = {
    num:    inv.number,
    ncf:    inv.ncf || State.generateNCF(inv.number),
    client: inv.clientName,
    rnc:    inv.clientRnc || 'CF',
    total:  (inv.total || 0).toFixed(2),
    itbis:  (inv.tax   || 0).toFixed(2),
    date:   inv.date,
    status: inv.status,
    companyRnc: State.settings.rnc || '',
    companyName: State.settings.name || 'HYPERTECH SOLUTIONS'
  };

  const encoded = encodeURIComponent(btoa(JSON.stringify(qrPayload)));
  const verifyUrl = `${baseUrl}verify.html?inv=${inv.number}&data=${encoded}`;

  try {
    new QRCode(el, {
      text: verifyUrl,
      width: size,
      height: size,
      colorDark: '#0D47A1',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  } catch (e) {
    el.innerHTML = `<div style="width:${size}px;height:${size}px;border:2px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;text-align:center;border-radius:4px">QR<br>Error</div>`;
  }
}

// Encode invoice data for URL (for verify page)
function encodeInvData(inv) {
  return encodeURIComponent(btoa(JSON.stringify(inv)));
}

// Calculate totals from items array
function calcItemTotals(items) {
  let sub = 0, tax = 0;
  items.forEach(it => {
    const lineBase = (it.qty || 0) * (it.price || 0);
    const lineTax  = lineBase * (it.taxPct || 0) / 100;
    sub += lineBase;
    tax += lineTax;
  });
  return { sub, tax };
}

// Collect items from a table body
function collectItems(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return [];
  const items = [];
  tbody.querySelectorAll('tr').forEach(tr => {
    const desc   = tr.querySelector('.item-desc')?.value  || '';
    const qty    = parseFloat(tr.querySelector('.item-qty')?.value   || 0);
    const price  = parseFloat(tr.querySelector('.item-price')?.value || 0);
    const taxPct = parseFloat(tr.querySelector('.item-tax')?.value   || 0);
    if (desc || qty || price) {
      items.push({ desc, qty, price, taxPct, total: qty * price * (1 + taxPct / 100) });
    }
  });
  return items;
}

// Recalculate totals displayed in form
function calcTotals(prefix) {
  const isInv    = prefix === 'inv';
  const tbodyId  = isInv ? 'inv-items-body' : 'quo-items-body';
  const tbody    = document.getElementById(tbodyId);
  if (!tbody) return;

  let sub = 0, tax = 0;
  tbody.querySelectorAll('tr').forEach(tr => {
    const qty    = parseFloat(tr.querySelector('.item-qty')?.value   || 0);
    const price  = parseFloat(tr.querySelector('.item-price')?.value || 0);
    const taxPct = parseFloat(tr.querySelector('.item-tax')?.value   || 0);
    const lineBase = qty * price;
    const lineTax  = lineBase * taxPct / 100;
    sub += lineBase;
    tax += lineTax;
    const totalCell = tr.querySelector('.item-total');
    if (totalCell) totalCell.textContent = fmt(lineBase + lineTax);
  });

  const disc  = parseFloat(document.getElementById(prefix + '-discount')?.value || 0);
  const total = Math.max(0, sub + tax - disc);
  const set   = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set(prefix + '-subtotal', fmt(sub));
  set(prefix + '-tax',      fmt(tax));
  set(prefix + '-total',    fmt(total));
}

// Add a line item row to the form
function addLineItem(prefix) {
  const tbodyId = prefix === 'inv' ? 'inv-items-body' : 'quo-items-body';
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const id = Date.now();
  const tr = document.createElement('tr');
  tr.id = `item-${id}`;
  tr.innerHTML = `
    <td style="width:38%"><input type="text" class="item-desc" placeholder="Descripción del servicio/producto" oninput="calcTotals('${prefix}')"></td>
    <td style="width:10%"><input type="number" class="item-qty" value="1" min="0" step="1" style="width:65px" oninput="calcTotals('${prefix}')"></td>
    <td style="width:16%"><input type="number" class="item-price" value="0" min="0" step="0.01" style="width:100px" oninput="calcTotals('${prefix}')"></td>
    <td style="width:12%">
      <select class="item-tax" onchange="calcTotals('${prefix}')" style="width:70px">
        <option value="0">0%</option>
        <option value="18" selected>18%</option>
      </select>
    </td>
    <td style="width:16%" class="item-total" style="font-weight:700">${fmt(0)}</td>
    <td style="width:8%"><button class="line-remove" onclick="document.getElementById('item-${id}').remove();calcTotals('${prefix}')">&#10005;</button></td>
  `;
  tbody.appendChild(tr);
  calcTotals(prefix);
}

// Update client dropdowns
function updateClientSelects() {
  ['inv-client-select', 'quo-client-select'].forEach(selId => {
    const sel = document.getElementById(selId);
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">-- Seleccionar cliente --</option>';
    State.clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name + (c.rnc ? ' (' + c.rnc + ')' : '');
      sel.appendChild(opt);
    });
    sel.value = cur;
  });
}

// Fill invoice/quote form from selected client
function fillClientData(prefix) {
  const selId = prefix + '-client-select';
  const cid   = document.getElementById(selId)?.value;
  if (!cid) return;
  const c = State.clients.find(x => x.id == cid);
  if (!c) return;
  const map = { name: 'client-name', rnc: 'client-rnc', email: 'client-email', phone: 'client-phone', address: 'client-address' };
  Object.entries(map).forEach(([k, v]) => {
    const el = document.getElementById(prefix + '-' + v);
    if (el && c[k]) el.value = c[k];
  });
}
