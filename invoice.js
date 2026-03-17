/**
 * HYPERTECH SOLUTIONS - Invoice Module
 */

// Build the invoice form HTML
function buildInvoiceForm() {
  const container = document.getElementById('invoice-form-container');
  if (!container || container.dataset.built) return;
  container.dataset.built = 'true';
  container.innerHTML = `
    <div class="card">
      <div class="card-title">Datos del Cliente</div>
      <div class="form-grid" style="margin-bottom:14px">
        <div class="form-group">
          <label class="form-label">Seleccionar Cliente Existente</label>
          <div style="display:flex;gap:8px">
            <select class="form-control" id="inv-client-select" onchange="fillClientData('inv')" style="flex:1"><option value="">-- Nuevo cliente --</option></select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Número de Factura</label>
          <input class="form-control" id="inv-number" readonly>
        </div>
      </div>
      <div class="form-grid-3" style="margin-bottom:14px">
        <div class="form-group"><label class="form-label">Nombre del Cliente *</label><input class="form-control" id="inv-client-name" placeholder="Nombre completo / Razón social"></div>
        <div class="form-group"><label class="form-label">RNC / Cédula</label><input class="form-control" id="inv-client-rnc" placeholder="000-0000000-0"></div>
        <div class="form-group"><label class="form-label">Correo Electrónico</label><input class="form-control" id="inv-client-email" type="email" placeholder="correo@email.com"></div>
      </div>
      <div class="form-grid" style="margin-bottom:14px">
        <div class="form-group"><label class="form-label">Teléfono</label><input class="form-control" id="inv-client-phone" placeholder="+1 (809) 000-0000"></div>
        <div class="form-group"><label class="form-label">Dirección</label><input class="form-control" id="inv-client-address" placeholder="Dirección del cliente"></div>
      </div>
      <div class="form-grid" style="margin-bottom:14px">
        <div class="form-group"><label class="form-label">Fecha de Emisión</label><input class="form-control" id="inv-date" type="date"></div>
        <div class="form-group"><label class="form-label">Fecha de Vencimiento</label><input class="form-control" id="inv-due-date" type="date"></div>
      </div>
      <div class="form-grid" style="margin-bottom:14px">
        <div class="form-group">
          <label class="form-label">NCF (Comprobante Fiscal)</label>
          <input class="form-control" id="inv-ncf" readonly style="max-width:220px;color:var(--orange);font-weight:700">
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select class="form-control" id="inv-status" style="max-width:200px">
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="form-section-title">
        Líneas de Factura
        <button class="btn btn-ghost btn-sm" onclick="addLineItem('inv')">+ Agregar Línea</button>
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
          <tbody id="inv-items-body"></tbody>
        </table>
      </div>
      <div class="totals-box">
        <div class="total-row"><span>Subtotal</span><span id="inv-subtotal">RD$0.00</span></div>
        <div class="total-row"><span>ITBIS</span><span id="inv-tax">RD$0.00</span></div>
        <div class="total-row">
          <span>Descuento</span>
          <span>${State.settings.currency || 'RD$'} <input type="number" id="inv-discount" value="0" min="0" class="discount-input" oninput="calcTotals('inv')"></span>
        </div>
        <div class="total-row grand"><span>TOTAL</span><span id="inv-total">RD$0.00</span></div>
      </div>
      <div class="form-group" style="margin-top:14px">
        <label class="form-label">Notas / Condiciones de Pago</label>
        <textarea class="form-control" id="inv-notes" rows="2" placeholder="Condiciones de pago, notas adicionales..."></textarea>
      </div>
    </div>
  `;
}

// Initialize / reset invoice form
function initInvoiceForm() {
  const num = State.nextInvNum();
  const el = id => document.getElementById(id);
  if (el('inv-number')) el('inv-number').value = num;
  if (el('inv-ncf'))    el('inv-ncf').value    = State.generateNCF(num);
  if (el('inv-date'))   el('inv-date').value   = today();
  if (el('inv-due-date')) el('inv-due-date').value = daysFromToday(30);
  ['inv-client-name','inv-client-rnc','inv-client-email','inv-client-phone','inv-client-address','inv-notes'].forEach(id => {
    if (el(id)) el(id).value = '';
  });
  if (el('inv-discount')) el('inv-discount').value = 0;
  if (el('inv-client-select')) el('inv-client-select').value = '';
  if (el('inv-status')) el('inv-status').value = 'pending';
  const tbody = el('inv-items-body');
  if (tbody) tbody.innerHTML = '';
  addLineItem('inv');
  calcTotals('inv');
}

// Save invoice
async function saveInvoice() {
  const clientName = document.getElementById('inv-client-name')?.value.trim();
  if (!clientName) { toast('Ingrese el nombre del cliente', 'error'); return; }
  const items = collectItems('inv-items-body');
  if (!items.length) { toast('Agregue al menos una línea', 'error'); return; }

  const sub  = items.reduce((a, i) => a + i.qty * i.price, 0);
  const tax  = items.reduce((a, i) => a + i.qty * i.price * i.taxPct / 100, 0);
  const disc = parseFloat(document.getElementById('inv-discount')?.value || 0);

  showLoadingOverlay('Guardando factura...');
  const num = await State.nextInvNum();

  const inv = {
    number:        num,
    ncf:           State.generateNCF(num),
    ncfType:       'Factura con Valor Fiscal',
    companyRnc:    State.settings.rnc || '',
    clientName,
    clientRnc:     document.getElementById('inv-client-rnc')?.value     || '',
    clientEmail:   document.getElementById('inv-client-email')?.value   || '',
    clientPhone:   document.getElementById('inv-client-phone')?.value   || '',
    clientAddress: document.getElementById('inv-client-address')?.value || '',
    date:          document.getElementById('inv-date')?.value           || today(),
    dueDate:       document.getElementById('inv-due-date')?.value       || '',
    items,
    subtotal:  sub,
    tax,
    discount:  disc,
    total:     Math.max(0, sub + tax - disc),
    notes:     document.getElementById('inv-notes')?.value || '',
    status:    document.getElementById('inv-status')?.value || 'pending',
    type:      'invoice'
  };

  const saved = await State.addInvoice(inv);
  hideLoadingOverlay();

  if (saved) {
    toast('✅ Factura ' + saved.number + ' guardada');
    clearInvoiceForm();
    return saved;
  } else {
    toast('Error al guardar la factura', 'error');
    return null;
  }
}

function saveAndPreview() {
  const inv = saveInvoice();
  if (inv) {
    viewInvoice(inv.id);
  } else if (State.invoices.length) {
    viewInvoice(State.invoices[0].id);
  }
}

function clearInvoiceForm() {
  document.getElementById('invoice-form-container').dataset.built = '';
  buildInvoiceForm();
  initInvoiceForm();
  updateClientSelects();
}

// ---- VIEW INVOICE ----
let currentViewId = null;

function viewInvoice(id) {
  const inv = State.invoices.find(i => i.id === id);
  if (!inv) return;
  currentViewId = id;
  document.getElementById('modal-inv-title').textContent = 'FACTURA ' + inv.number;
  document.getElementById('invoice-modal-content').innerHTML = buildInvoiceHTML(inv);
  openModal('invoice-modal');
  setTimeout(() => generateInvoiceQR('modal-qr-' + inv.id, inv, 90), 300);
}

// Build printable invoice HTML
function buildInvoiceHTML(inv, isQuote = false) {
  const s   = State.settings;
  const cur = s.currency || 'RD$';
  const ncf = inv.ncf || State.generateNCF(inv.number);

  return `
  <div class="invoice-print" id="print-area">
    <div class="inv-header">
      <div>
        <div class="inv-company">HYPER<span>TECH</span> SOLUTIONS</div>
        <div class="inv-tag">Soluciones Tecnológicas &mdash; DGII Registrado</div>
        <div class="inv-company-info">
          ${s.address || ''}${s.city ? '<br>' + s.city : ''}
          ${s.phone ? '<br>' + s.phone : ''}
          ${s.email ? '<br>' + s.email : ''}
          ${s.rnc   ? '<br>RNC: ' + s.rnc : ''}
        </div>
      </div>
      <div class="inv-number-block">
        <div class="inv-num-label">${isQuote ? 'COTIZACIÓN' : 'FACTURA'}</div>
        <div class="inv-num-value">${inv.number}</div>
        <div class="inv-ncf">NCF: ${ncf}</div>
        <div class="inv-dates">
          Emisión: ${fmtDate(inv.date)}<br>
          ${inv.dueDate ? 'Vence: ' + fmtDate(inv.dueDate) : ''}
          ${inv.expiry  ? 'Válida: ' + fmtDate(inv.expiry) : ''}
        </div>
        <div style="margin-top:8px">${statusBadge(inv.status)}</div>
      </div>
    </div>

    <div class="inv-parties">
      <div>
        <div class="inv-party-label">Facturado a</div>
        <div class="inv-party-name">${inv.clientName}</div>
        <div class="inv-party-info">
          ${inv.clientRnc ? 'RNC/Cédula: ' + inv.clientRnc + '<br>' : ''}
          ${inv.clientEmail  ? inv.clientEmail + '<br>' : ''}
          ${inv.clientPhone  ? inv.clientPhone + '<br>' : ''}
          ${inv.clientAddress ? inv.clientAddress : ''}
        </div>
      </div>
      <div style="text-align:right">
        <div class="inv-party-label">Emisor</div>
        <div class="inv-party-name">${s.name || 'HYPERTECH SOLUTIONS'}</div>
        <div class="inv-party-info">
          ${s.rnc     ? 'RNC: ' + s.rnc + '<br>' : ''}
          ${s.website ? s.website : ''}
        </div>
      </div>
    </div>

    <table class="inv-table">
      <thead>
        <tr>
          <th>Descripción</th>
          <th style="text-align:center">Cant.</th>
          <th style="text-align:right">Precio</th>
          <th style="text-align:center">ITBIS</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${(inv.items || []).map(it => `
          <tr>
            <td>${it.desc || ''}</td>
            <td style="text-align:center">${it.qty}</td>
            <td style="text-align:right">${cur}${(it.price || 0).toFixed(2)}</td>
            <td style="text-align:center">${it.taxPct || 0}%</td>
            <td style="text-align:right;font-weight:700">${cur}${(it.total || 0).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="inv-totals">
      <div class="inv-totals-inner">
        <div class="inv-total-row"><span>Subtotal (sin ITBIS)</span><span>${cur}${(inv.subtotal || 0).toFixed(2)}</span></div>
        <div class="inv-total-row"><span>ITBIS (18%)</span><span>${cur}${(inv.tax || 0).toFixed(2)}</span></div>
        ${inv.discount ? `<div class="inv-total-row"><span>Descuento</span><span>- ${cur}${(inv.discount || 0).toFixed(2)}</span></div>` : ''}
        <div class="inv-total-row grand"><span>TOTAL</span><span>${cur}${(inv.total || 0).toFixed(2)}</span></div>
      </div>
    </div>

    <div class="inv-footer">
      <div class="inv-notes">
        ${inv.notes ? `<strong>Notas:</strong><br>${inv.notes}<br><br>` : ''}
        ${s.terms || ''}
      </div>
      <div class="inv-qr-block">
        <div id="modal-qr-${inv.id}" class="qr-container"></div>
        <div class="inv-qr-label">Verificar Factura</div>
        <div class="inv-dgii-note">Escanear para verificación DGII</div>
      </div>
    </div>
  </div>`;
}

// Print current invoice modal
function printCurrentModal() {
  const area = document.getElementById('print-area');
  if (!area) return;
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Factura - HYPERTECH SOLUTIONS</title>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Rajdhani',sans-serif;padding:20px;color:#1A1A1A}
      .inv-company{font-family:'Bebas Neue',cursive;font-size:32px;color:#0D47A1;letter-spacing:3px}
      .inv-company span{color:#F57C00}
      .inv-tag{font-size:11px;color:#9E9E9E;letter-spacing:2px;text-transform:uppercase;margin-top:2px}
      .inv-company-info{font-size:12px;color:#666;margin-top:6px;line-height:1.7}
      .inv-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:3px solid #F57C00}
      .inv-number-block{text-align:right}
      .inv-num-label{font-size:10px;color:#9E9E9E;letter-spacing:2px;text-transform:uppercase}
      .inv-num-value{font-size:28px;font-weight:700;color:#0D47A1}
      .inv-ncf{font-size:13px;font-weight:700;color:#F57C00;margin-top:3px;letter-spacing:1px}
      .inv-dates{font-size:12px;color:#9E9E9E;margin-top:4px;line-height:1.7}
      .inv-parties{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px}
      .inv-party-label{font-size:10px;color:#9E9E9E;letter-spacing:2px;text-transform:uppercase;margin-bottom:5px}
      .inv-party-name{font-size:15px;font-weight:700;color:#1A1A1A;margin-bottom:4px}
      .inv-party-info{font-size:12px;color:#555;line-height:1.6}
      table{width:100%;border-collapse:collapse;margin-bottom:14px}
      th{background:#0D47A1;color:white;padding:8px 12px;text-align:left;font-size:11px;letter-spacing:1px;text-transform:uppercase}
      td{padding:9px 12px;border-bottom:1px solid #eee;font-size:13px}
      tr:nth-child(even) td{background:#FAFAFA}
      .inv-totals{display:flex;justify-content:flex-end;margin-bottom:18px}
      .inv-totals-inner{width:270px}
      .inv-total-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}
      .inv-total-row.grand{font-size:18px;font-weight:700;color:#0D47A1;border-top:2px solid #eee;padding-top:8px;margin-top:4px}
      .inv-footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:18px;padding-top:14px;border-top:2px solid #F9A825}
      .inv-notes{font-size:12px;color:#666;max-width:400px;line-height:1.6}
      .inv-qr-block{text-align:center}
      .inv-qr-label{font-size:10px;color:#9E9E9E;letter-spacing:1px;margin-top:5px;text-transform:uppercase}
      .inv-dgii-note{font-size:10px;color:#0D47A1;margin-top:2px;font-weight:700}
      .qr-container{display:inline-block;padding:6px;border:2px solid #E0E0E0;border-radius:6px}
      .badge{padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700}
      .badge-paid{background:#E8F5E9;color:#2E7D32}
      .badge-pending{background:#FFF8E1;color:#F57F17}
      .badge-cancelled{background:#FFEBEE;color:#C62828}
      @media print{@page{margin:15mm}body{padding:0}}
    </style>
  </head><body>`);
  w.document.write(area.outerHTML);
  w.document.write(`<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
  <script>
    document.querySelectorAll('[id^="modal-qr-"]').forEach(el => {
      if (el.innerHTML.trim() === '') {
        try {
          new QRCode(el, {text: window.location.href, width: 90, height: 90, colorDark: '#0D47A1', colorLight: '#ffffff'});
        } catch(e) {}
      }
    });
    window.onload = function(){ setTimeout(()=>{ window.print(); window.close(); }, 700); }
  <\/script>`);
  w.document.write('</body></html>');
  w.document.close();
}

function downloadPDF() {
  toast('Usa la función Imprimir → Guardar como PDF', 'success');
  setTimeout(printCurrentModal, 400);
}

// Email invoice
function sendEmailModal() {
  const inv = State.invoices.find(i => i.id === currentViewId) ||
              State.quotes.find(q => q.id === currentViewId);
  if (!inv) return;

  document.getElementById('email-to').value      = inv.clientEmail || '';
  document.getElementById('email-subject').value = `Factura ${inv.number} - HYPERTECH SOLUTIONS`;

  const s = State.settings;
  document.getElementById('email-body').value = `Estimado/a ${inv.clientName},

Adjunto encontrará su ${inv.type === 'quote' ? 'cotización' : 'factura'} ${inv.number} emitida por HYPERTECH SOLUTIONS.

Número de Factura: ${inv.number}
NCF: ${inv.ncf || State.generateNCF(inv.number)}
Fecha de Emisión: ${fmtDate(inv.date)}
${inv.dueDate ? 'Fecha de Vencimiento: ' + fmtDate(inv.dueDate) : ''}
Total: RD$${(inv.total || 0).toFixed(2)}

Para verificar este documento, escanee el código QR adjunto o ingrese a:
${window.location.origin + window.location.pathname.replace('index.html', '')}verify.html?inv=${inv.number}

Para cualquier consulta no dude en contactarnos.

Atentamente,
${s.name || 'HYPERTECH SOLUTIONS'}
${s.phone || ''}
${s.email || ''}
${s.website || ''}`;

  openModal('email-modal');
}

function doSendEmail() {
  const to   = document.getElementById('email-to').value.trim();
  const sub  = document.getElementById('email-subject').value;
  const body = document.getElementById('email-body').value;
  if (!to) { toast('Ingrese correo del destinatario', 'error'); return; }

  // Try EmailJS if configured
  const s = State.settings;
  if (s.ejsService && s.ejsTemplate && s.ejsKey && typeof emailjs !== 'undefined') {
    emailjs.init(s.ejsKey);
    emailjs.send(s.ejsService, s.ejsTemplate, {
      to_email: to,
      subject:  sub,
      message:  body
    }).then(() => {
      toast('✅ Correo enviado exitosamente');
      closeModal('email-modal');
    }).catch(() => {
      toast('Error EmailJS. Usando cliente de correo.', 'error');
      openMailto(to, sub, body);
    });
  } else {
    openMailto(to, sub, body);
  }
}

function openMailto(to, sub, body) {
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
  toast('Abriendo cliente de correo...');
  closeModal('email-modal');
}
