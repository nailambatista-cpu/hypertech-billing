/**
 * HYPERTECH SOLUTIONS - State Management
 * Usa Supabase como base de datos en la nube
 */

const State = {
  invoices: [],
  quotes:   [],
  clients:  [],
  settings: {
    name: 'HYPERTECH SOLUTIONS',
    rnc: '', phone: '', email: '',
    address: '', city: 'Santiago, República Dominicana',
    website: 'www.hypertech.com', currency: 'RD$',
    ncf: 'B02', terms: 'Gracias por su preferencia.',
    ejsService: '', ejsTemplate: '', ejsKey: ''
  },

  async loadAll() {
    showLoadingOverlay('Cargando datos...');
    try {
      const [invoices, quotes, clients, settings] = await Promise.all([
        DB.getInvoices(), DB.getQuotes(), DB.getClients(), DB.getSettings()
      ]);
      // Normalize all data from snake_case to camelCase
      this.invoices = (invoices || []).map(normalizeInvoice);
      this.quotes   = (quotes   || []).map(normalizeQuote);
      this.clients  = (clients  || []).map(normalizeClient);
      if (settings) {
        this.settings = {
          name:        settings.name         || 'HYPERTECH SOLUTIONS',
          rnc:         settings.rnc          || '',
          phone:       settings.phone        || '',
          email:       settings.email        || '',
          address:     settings.address      || '',
          city:        settings.city         || '',
          website:     settings.website      || '',
          currency:    settings.currency     || 'RD$',
          ncf:         settings.ncf          || 'B02',
          terms:       settings.terms        || '',
          ejsService:  settings.ejs_service  || '',
          ejsTemplate: settings.ejs_template || '',
          ejsKey:      settings.ejs_key      || ''
        };
      }
    } catch (e) {
      console.error('Error loading data:', e);
      toast('Error conectando a la base de datos', 'error');
    } finally {
      hideLoadingOverlay();
    }
  },

  async addInvoice(inv) {
    const dbData = invoiceToDB(inv);
    const saved  = await DB.saveInvoice(dbData);
    if (saved) {
      const norm = normalizeInvoice(saved);
      this.invoices.unshift(norm);
      await this.autoSaveClient(inv);
      return norm;
    }
    return null;
  },

  async updateInvoiceStatus(id, status) {
    const updated = await DB.updateInvoiceStatus(id, status);
    if (updated) {
      const idx = this.invoices.findIndex(i => i.id === id);
      if (idx >= 0) this.invoices[idx].status = status;
    }
    return updated;
  },

  async addQuote(quo) {
    const dbData = quoteToDB(quo);
    const saved  = await DB.saveQuote(dbData);
    if (saved) {
      const norm = normalizeQuote(saved);
      this.quotes.unshift(norm);
      return norm;
    }
    return null;
  },

  async addClient(client) {
    const saved = await DB.saveClient(client);
    if (saved) {
      const norm = normalizeClient(saved);
      this.clients.push(norm);
      this.clients.sort((a, b) => a.name.localeCompare(b.name));
      return norm;
    }
    return null;
  },

  async editClient(id, data) {
    const updated = await DB.updateClient(id, data);
    if (updated) {
      const idx = this.clients.findIndex(c => c.id === id);
      if (idx >= 0) this.clients[idx] = { ...this.clients[idx], ...data };
    }
    return updated;
  },

  async removeClient(id) {
    const ok = await DB.deleteClient(id);
    if (ok) this.clients = this.clients.filter(c => c.id !== id);
    return ok;
  },

  async saveSettings(data) {
    const dbData = {
      name: data.name, rnc: data.rnc, phone: data.phone,
      email: data.email, address: data.address, city: data.city,
      website: data.website, currency: data.currency,
      ncf: data.ncf, terms: data.terms,
      ejs_service:  data.ejsService  || '',
      ejs_template: data.ejsTemplate || '',
      ejs_key:      data.ejsKey      || '',
      updated_at: new Date().toISOString()
    };
    const saved = await DB.saveSettings(dbData);
    if (saved) this.settings = data;
    return saved;
  },

  async nextInvNum() { return await DB.getNextInvNumber(); },
  async nextQuoNum() { return await DB.getNextQuoNumber(); },

  generateNCF(invNumber) {
    const prefix = this.settings.ncf || 'B02';
    const seq = invNumber.replace('INV-', '').replace('COT-', '');
    return prefix + '-' + String(seq).padStart(8, '0');
  },

  async autoSaveClient(doc) {
    const name = doc.clientName || doc.client_name;
    if (!name) return;
    const exists = this.clients.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
      await this.addClient({
        name,
        rnc:     doc.clientRnc     || '',
        email:   doc.clientEmail   || '',
        phone:   doc.clientPhone   || '',
        address: doc.clientAddress || '',
        city: '', type: 'individual', notes: ''
      });
      updateClientSelects();
    }
  }
};

function showLoadingOverlay(msg) {
  let el = document.getElementById('loading-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'loading-overlay';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(13,71,161,0.88);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:Rajdhani,sans-serif;font-size:18px;font-weight:600;letter-spacing:1px;';
    el.innerHTML = '<div style="width:48px;height:48px;border:4px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:16px"></div><div id="loading-msg">' + (msg||'Cargando...') + '</div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
    document.body.appendChild(el);
  } else {
    const m = document.getElementById('loading-msg');
    if (m) m.textContent = msg || 'Cargando...';
    el.style.display = 'flex';
  }
}

function hideLoadingOverlay() {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = 'none';
}
