/**
 * HYPERTECH SOLUTIONS - Quote Module
 */

function buildQuoteForm() {
  const container = document.getElementById('quote-form-container');
  if (!container || container.dataset.built) return;
  container.dataset.built = 'true';
  container.innerHTML = `
    <div class="card">
      <div class="card-title">Datos del Cliente</div>
      <div class="form-grid" style="margin-bottom:14px">
        <div class="form-group">
          <label class="form-label">Seleccionar Cliente Existente</label>
          <select class="form-control" id="quo-client-select" onchange="fillClientData('quo')"><option value="">-- Nuevo cliente --</option></select>
        </div>
        <div class="form-group">
          <label class="form-label">Número de Cotización</label>
          <input class="form-control" id="quo-number" readonly>
        </div>
      </div>
      <div class="form-grid-3" style="margin-bottom:14px">
        <div class="form-group"><label class="form-label">Nombre del Cliente *</label><input class="form-control" id="quo-client-name" placeholder="Nombre / Razón social"></div>
        <div class="form-group"><label class="form-label">RNC / Cédula</label><input class="form-control" id="quo-client-rnc" placeholder="000-0000000-0"></div>
        <div class="form-group"><label class="form-label">Correo Electrónico</label><input class="form-control" id="quo-client-email" type="email" placeholder="correo@email.com"></div>
      </div>
      <div class="form-grid" style="margin-bottom:14px">
        <div class="form-group"><label class="form-label">Fecha</label><input class="form-control" id="quo-date" type="date"></div>
        <div class="form-group"><label class="form-label">Válida Hasta</label><input class="form-control" id="quo-expiry" type="date"></div>
      </div>
    </div>

    <div class="card">
      <div class="form-section-title">
        Líneas de Cotización
        <button class="btn btn-ghost btn-sm" onclick="addLineItem('quo')">+ Agregar Línea</button>
      </div>
      <div class="inv-items-wrap">
        <table class="inv-line-table">
          <thead><tr>
            <th style="width:38%">Descripción</th>
            <th style="width:10%">Cant.</th>
            <th style="width:16%">Precio Unit.</th>
            <th style="width:12%">ITBIS%</th>
            <th style="width:16%">Total</th>
            <th style="width:8%"></th>
          </tr></thead>
          <tbody id="quo-items-body"></tbody>
        </table>
      </div>
      <div class="totals-box">
        <div class="total-row"><span>Subtotal</span><span id="quo-subtotal">RD$0.00</span></div>
        <div class="total-row"><span>ITBIS</span><span id="quo-tax">RD$0.00</span></div>
        <div class="total-row">
          <span>Descuento</span>
          <span>${State.settings.currency || 'RD$'} <input type="number" id="quo-discount" value="0" min="0" class="discount-input" oninput="calcTotals('quo')"></span>
        </div>
        <div class="total-row grand"><span>TOTAL</span><span id="quo-total">RD$0.00</span></div>
      </div>
      <div class="form-group" style="margin-top:14px">
        <label class="form-label">Notas / Condiciones</label>
        <textarea class="form-control" id="quo-notes" rows="2" placeholder="Condiciones, vigencia, notas..."></textarea>
      </div>
    </div>
  `;
}

function initQuoteForm() {
  const el = id => document.getElementById(id);
  if (el('quo-number'))  el('quo-number').value  = State.nextQuoNum();
  if (el('quo-date'))    el('quo-date').value    = today();
  if (el('quo-expiry'))  el('quo-expiry').value  = daysFromToday(15);
  ['quo-client-name','quo-client-rnc','quo-client-email','quo-notes'].forEach(id => {
    if (el(id)) el(id).value = '';
  });
  if (el('quo-discount')) el('quo-discount').value = 0;
  if (el('quo-client-select')) el('quo-client-select').value = '';
  const tbody = el('quo-items-body');
  if (tbody) tbody.innerHTML = '';
  addLineItem('quo');
  calcTotals('quo');
}

function saveQuote() {
  const clientName = document.getElementById('quo-client-name')?.value.trim();
  if (!clientName) { toast('Ingrese el nombre del cliente', 'error'); return; }
  const items = collectItems('quo-items-body');
  if (!items.length) { toast('Agregue al menos una línea', 'error'); return; }

  const sub  = items.reduce((a, i) => a + i.qty * i.price, 0);
  const tax  = items.reduce((a, i) => a + i.qty * i.price * i.taxPct / 100, 0);
  const disc = parseFloat(document.getElementById('quo-discount')?.value || 0);

  const quo = {
    id:          Date.now(),
    number:      document.getElementById('quo-number')?.value,
    clientName,
    clientRnc:   document.getElementById('quo-client-rnc')?.value   || '',
    clientEmail: document.getElementById('quo-client-email')?.value || '',
    date:        document.getElementById('quo-date')?.value         || today(),
    expiry:      document.getElementById('quo-expiry')?.value       || '',
    items,
    subtotal:    sub,
    tax,
    discount:    disc,
    total:       Math.max(0, sub + tax - disc),
    notes:       document.getElementById('quo-notes')?.value || '',
    status:      'quote',
    type:        'quote',
    createdAt:   new Date().toISOString()
  };

  State.quotes.unshift(quo);
  State.save('quotes');
  toast('✅ Cotización ' + quo.number + ' guardada');
  clearQuoteForm();
}

function clearQuoteForm() {
  document.getElementById('quote-form-container').dataset.built = '';
  buildQuoteForm();
  initQuoteForm();
  updateClientSelects();
}

function convertToInvoice() {
  const clientName = document.getElementById('quo-client-name')?.value.trim();
  if (!clientName) { toast('Llene los datos de la cotización primero', 'error'); return; }
  const items      = collectItems('quo-items-body');
  const sub        = items.reduce((a, i) => a + i.qty * i.price, 0);
  const tax        = items.reduce((a, i) => a + i.qty * i.price * i.taxPct / 100, 0);
  const disc       = parseFloat(document.getElementById('quo-discount')?.value || 0);
  const notes      = document.getElementById('quo-notes')?.value || '';
  const clientRnc  = document.getElementById('quo-client-rnc')?.value || '';
  const clientEmail= document.getElementById('quo-client-email')?.value || '';

  // Navigate to invoice and pre-fill
  nav('new-invoice');
  setTimeout(() => {
    document.getElementById('inv-client-name').value  = clientName;
    document.getElementById('inv-client-rnc').value   = clientRnc;
    document.getElementById('inv-client-email').value = clientEmail;
    document.getElementById('inv-notes').value        = notes;
    document.getElementById('inv-discount').value     = disc;
    // Clear default row and fill with quote items
    document.getElementById('inv-items-body').innerHTML = '';
    items.forEach(it => {
      addLineItem('inv');
      const rows = document.getElementById('inv-items-body').querySelectorAll('tr');
      const last = rows[rows.length - 1];
      last.querySelector('.item-desc').value  = it.desc;
      last.querySelector('.item-qty').value   = it.qty;
      last.querySelector('.item-price').value = it.price;
      last.querySelector('.item-tax').value   = it.taxPct;
    });
    calcTotals('inv');
    toast('Cotización convertida a factura');
  }, 300);
}

function viewQuote(id) {
  const quo = State.quotes.find(q => q.id === id);
  if (!quo) return;
  currentViewId = id;
  document.getElementById('modal-inv-title').textContent = 'COTIZACIÓN ' + quo.number;
  document.getElementById('invoice-modal-content').innerHTML = buildInvoiceHTML(quo, true);
  openModal('invoice-modal');
  setTimeout(() => generateInvoiceQR('modal-qr-' + quo.id, quo, 90), 300);
}
