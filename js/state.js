/**
 * HYPERTECH SOLUTIONS - Billing System
 * State Management (localStorage persistence)
 */

const State = {
  invoices: JSON.parse(localStorage.getItem('ht_invoices') || '[]'),
  quotes:   JSON.parse(localStorage.getItem('ht_quotes')   || '[]'),
  clients:  JSON.parse(localStorage.getItem('ht_clients')  || '[]'),
  settings: JSON.parse(localStorage.getItem('ht_settings') || JSON.stringify({
    name: 'HYPERTECH SOLUTIONS',
    rnc: '',
    phone: '',
    email: '',
    address: '',
    city: 'Santiago, República Dominicana',
    website: 'www.hypertech.com',
    currency: 'RD$',
    ncf: 'B02',
    terms: 'Gracias por su preferencia. Pago dentro de los 30 días acordados.',
    ejsService: '',
    ejsTemplate: '',
    ejsKey: ''
  })),
  lastInvNum: parseInt(localStorage.getItem('ht_last_inv') || '999'),
  lastQuoNum: parseInt(localStorage.getItem('ht_last_quo') || '99'),

  save(key) {
    if (key === 'invoices') localStorage.setItem('ht_invoices', JSON.stringify(this.invoices));
    if (key === 'quotes')   localStorage.setItem('ht_quotes',   JSON.stringify(this.quotes));
    if (key === 'clients')  localStorage.setItem('ht_clients',  JSON.stringify(this.clients));
    if (key === 'settings') localStorage.setItem('ht_settings', JSON.stringify(this.settings));
  },

  nextInvNum() {
    this.lastInvNum++;
    localStorage.setItem('ht_last_inv', this.lastInvNum);
    return 'INV-' + String(this.lastInvNum).padStart(5, '0');
  },

  nextQuoNum() {
    this.lastQuoNum++;
    localStorage.setItem('ht_last_quo', this.lastQuoNum);
    return 'COT-' + String(this.lastQuoNum).padStart(4, '0');
  },

  // Generate NCF (Número de Comprobante Fiscal - DGII format)
  generateNCF(invNumber) {
    const prefix = this.settings.ncf || 'B02';
    const seq = invNumber.replace('INV-', '').replace('COT-', '');
    // Format: B02-00000001 (DGII standard)
    return prefix + '-' + String(seq).padStart(8, '0');
  },

  autoSaveClient(doc) {
    if (!doc.clientName) return;
    const exists = this.clients.find(c =>
      c.name.toLowerCase() === doc.clientName.toLowerCase() ||
      (doc.clientRnc && c.rnc && c.rnc === doc.clientRnc)
    );
    if (!exists) {
      this.clients.push({
        id: Date.now(),
        name:    doc.clientName,
        rnc:     doc.clientRnc   || '',
        email:   doc.clientEmail || '',
        phone:   doc.clientPhone || '',
        address: doc.clientAddress || '',
        city:    '',
        type:    'individual',
        notes:   '',
        createdAt: new Date().toISOString()
      });
      this.save('clients');
    }
  }
};
