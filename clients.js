/**
 * HYPERTECH SOLUTIONS - Clients Module
 */

function renderClients() {
  const q    = (document.getElementById('client-search')?.value || '').toLowerCase();
  let data   = [...State.clients];
  if (q) data = data.filter(c =>
    c.name.toLowerCase().includes(q)  ||
    (c.email && c.email.toLowerCase().includes(q)) ||
    (c.rnc   && c.rnc.includes(q))    ||
    (c.phone && c.phone.includes(q))
  );

  const cont = document.getElementById('clients-list');
  if (!cont) return;

  if (!data.length) {
    cont.innerHTML = `<div class="empty-state">
      <div class="empty-icon">&#128101;</div>
      <p>No hay clientes registrados.<br>Se agregan automáticamente al crear facturas.</p>
    </div>`;
    return;
  }

  cont.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>RNC / Cédula</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Tipo</th>
            <th>Facturas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(c => {
            const invCount = State.invoices.filter(i =>
              i.clientName.toLowerCase() === c.name.toLowerCase() ||
              (c.email && i.clientEmail === c.email)
            ).length;
            return `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="avatar" style="width:32px;height:32px;font-size:12px">${initials(c.name)}</div>
                    <strong>${c.name}</strong>
                  </div>
                </td>
                <td style="font-size:13px">${c.rnc || '-'}</td>
                <td style="font-size:13px">${c.email || '-'}</td>
                <td style="font-size:13px">${c.phone || '-'}</td>
                <td><span class="badge badge-quote">${c.type || 'individual'}</span></td>
                <td style="font-weight:700;color:var(--blue)">${invCount}</td>
                <td>
                  <div class="tbl-actions">
                    <button class="btn btn-sm btn-ghost" onclick="editClient(${c.id})" title="Editar">&#9998;</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteClient(${c.id})" title="Eliminar">&#128465;</button>
                  </div>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function filterClients() { renderClients(); }

function showClientModal() {
  document.getElementById('edit-client-id').value = '';
  ['cl-name','cl-rnc','cl-email','cl-phone','cl-address','cl-city','cl-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const tp = document.getElementById('cl-type');
  if (tp) tp.value = 'individual';
  openModal('client-modal');
}

function editClient(id) {
  const c = State.clients.find(x => x.id === id);
  if (!c) return;
  document.getElementById('edit-client-id').value = id;
  document.getElementById('cl-name').value    = c.name    || '';
  document.getElementById('cl-rnc').value     = c.rnc     || '';
  document.getElementById('cl-email').value   = c.email   || '';
  document.getElementById('cl-phone').value   = c.phone   || '';
  document.getElementById('cl-address').value = c.address || '';
  document.getElementById('cl-city').value    = c.city    || '';
  document.getElementById('cl-type').value    = c.type    || 'individual';
  document.getElementById('cl-notes').value   = c.notes   || '';
  openModal('client-modal');
}

async function saveClient() {
  const name = document.getElementById('cl-name')?.value.trim();
  if (!name) { toast('El nombre es requerido', 'error'); return; }

  const eid  = document.getElementById('edit-client-id')?.value;
  const data = {
    name,
    rnc:     document.getElementById('cl-rnc')?.value     || '',
    email:   document.getElementById('cl-email')?.value   || '',
    phone:   document.getElementById('cl-phone')?.value   || '',
    address: document.getElementById('cl-address')?.value || '',
    city:    document.getElementById('cl-city')?.value    || '',
    type:    document.getElementById('cl-type')?.value    || 'individual',
    notes:   document.getElementById('cl-notes')?.value   || ''
  };

  showLoadingOverlay('Guardando cliente...');
  let ok;
  if (eid) {
    ok = await State.editClient(parseInt(eid), data);
  } else {
    ok = await State.addClient(data);
  }
  hideLoadingOverlay();

  if (ok) {
    updateClientSelects();
    closeModal('client-modal');
    renderClients();
    toast('✅ Cliente guardado');
  } else {
    toast('Error al guardar cliente', 'error');
  }
}

async function deleteClient(id) {
  if (!confirm('¿Eliminar este cliente?')) return;
  showLoadingOverlay('Eliminando...');
  const ok = await State.removeClient(id);
  hideLoadingOverlay();
  if (ok) {
    renderClients();
    updateClientSelects();
    toast('Cliente eliminado');
  } else {
    toast('Error al eliminar', 'error');
  }
}

/**
 * HYPERTECH SOLUTIONS - Settings Module
 */

function loadSettings() {
  const s = State.settings;
  const fields = ['name','rnc','phone','email','address','city','website','currency','ncf','terms','ejsService','ejsTemplate','ejsKey'];
  const cfgMap = {
    name:'cfg-name', rnc:'cfg-rnc', phone:'cfg-phone', email:'cfg-email',
    address:'cfg-address', city:'cfg-city', website:'cfg-website',
    currency:'cfg-currency', ncf:'cfg-ncf', terms:'cfg-terms',
    ejsService:'cfg-ejs-service', ejsTemplate:'cfg-ejs-template', ejsKey:'cfg-ejs-key'
  };
  Object.entries(cfgMap).forEach(([key, domId]) => {
    const el = document.getElementById(domId);
    if (el && s[key] !== undefined) el.value = s[key];
  });
  // Update header
  const hdrCo = document.getElementById('hdr-company');
  const hdrRnc = document.getElementById('hdr-rnc');
  if (hdrCo) hdrCo.textContent = s.name || 'HYPERTECH SOLUTIONS';
  if (hdrRnc) hdrRnc.textContent = s.rnc ? 'RNC: ' + s.rnc : 'RNC: ---';
}

async function saveSettings() {
  const cfgMap = {
    name:'cfg-name', rnc:'cfg-rnc', phone:'cfg-phone', email:'cfg-email',
    address:'cfg-address', city:'cfg-city', website:'cfg-website',
    currency:'cfg-currency', ncf:'cfg-ncf', terms:'cfg-terms',
    ejsService:'cfg-ejs-service', ejsTemplate:'cfg-ejs-template', ejsKey:'cfg-ejs-key'
  };
  const data = {};
  Object.entries(cfgMap).forEach(([key, domId]) => {
    const el = document.getElementById(domId);
    if (el) data[key] = el.value;
  });
  showLoadingOverlay('Guardando configuración...');
  const ok = await State.saveSettings(data);
  hideLoadingOverlay();
  if (ok) {
    loadSettings();
    toast('✅ Configuración guardada');
  } else {
    toast('Error al guardar configuración', 'error');
  }
}
