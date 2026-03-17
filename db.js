/**
 * HYPERTECH SOLUTIONS - Supabase Database Module
 * Todos los datos se guardan en la nube
 */

const SUPABASE_URL = 'https://bmufsdiyzwzziqybxkmm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdWZzZGl5end6emlxeWJ4a21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzYzNzIsImV4cCI6MjA4OTM1MjM3Mn0.4ghJefL9VbC8G88z_J8CxzwSpgTbuRjR2vKbCro8tgs';

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY,
  'Prefer': 'return=representation'
};

const DB = {

  // ── GENERIC HELPERS ──────────────────────────────────

  async getAll(table, orderBy = 'created_at', ascending = false) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?order=${orderBy}.${ascending ? 'asc' : 'desc'}`,
        { headers: HEADERS }
      );
      if (!res.ok) return [];
      return await res.json();
    } catch (e) { console.error('DB.getAll', e); return []; }
  },

  async getOne(table, column, value) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${encodeURIComponent(value)}&limit=1`,
        { headers: HEADERS }
      );
      if (!res.ok) return null;
      const rows = await res.json();
      return rows[0] || null;
    } catch (e) { console.error('DB.getOne', e); return null; }
  },

  async insert(table, data) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('DB.insert error', err);
        return null;
      }
      const rows = await res.json();
      return Array.isArray(rows) ? rows[0] : rows;
    } catch (e) { console.error('DB.insert', e); return null; }
  },

  async update(table, id, data) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify(data)
      });
      if (!res.ok) return null;
      const rows = await res.json();
      return Array.isArray(rows) ? rows[0] : rows;
    } catch (e) { console.error('DB.update', e); return null; }
  },

  async delete(table, id) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: { ...HEADERS, 'Prefer': 'return=minimal' }
      });
      return res.ok;
    } catch (e) { console.error('DB.delete', e); return false; }
  },

  async search(table, filters = {}, orderBy = 'created_at', ascending = false) {
    try {
      let query = `${SUPABASE_URL}/rest/v1/${table}?order=${orderBy}.${ascending ? 'asc' : 'desc'}`;
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '')
          query += `&${k}=eq.${encodeURIComponent(v)}`;
      });
      const res = await fetch(query, { headers: HEADERS });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) { console.error('DB.search', e); return []; }
  },

  // ── INVOICES ──────────────────────────────────────────

  async getInvoices() {
    return await this.getAll('invoices', 'created_at', false);
  },

  async getInvoice(id) {
    return await this.getOne('invoices', 'id', id);
  },

  async getInvoiceByNumber(number) {
    return await this.getOne('invoices', 'number', number);
  },

  async saveInvoice(inv) {
    // Remove local id if present, let DB generate it
    const data = { ...inv };
    delete data.id;
    return await this.insert('invoices', data);
  },

  async updateInvoiceStatus(id, status) {
    return await this.update('invoices', id, { status, updated_at: new Date().toISOString() });
  },

  async deleteInvoice(id) {
    return await this.delete('invoices', id);
  },

  // ── QUOTES ────────────────────────────────────────────

  async getQuotes() {
    return await this.getAll('quotes', 'created_at', false);
  },

  async saveQuote(quo) {
    const data = { ...quo };
    delete data.id;
    return await this.insert('quotes', data);
  },

  async deleteQuote(id) {
    return await this.delete('quotes', id);
  },

  // ── CLIENTS ───────────────────────────────────────────

  async getClients() {
    return await this.getAll('clients', 'name', true);
  },

  async saveClient(client) {
    const data = { ...client };
    delete data.id;
    return await this.insert('clients', data);
  },

  async updateClient(id, data) {
    return await this.update('clients', id, data);
  },

  async deleteClient(id) {
    return await this.delete('clients', id);
  },

  async findClientByName(name) {
    return await this.getOne('clients', 'name', name);
  },

  // ── SETTINGS ──────────────────────────────────────────

  async getSettings() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/settings?limit=1`,
        { headers: HEADERS }
      );
      if (!res.ok) return null;
      const rows = await res.json();
      return rows[0] || null;
    } catch (e) { return null; }
  },

  async saveSettings(data) {
    // Upsert: if exists update, else insert
    try {
      const existing = await this.getSettings();
      if (existing) {
        return await this.update('settings', existing.id, data);
      } else {
        const d = { ...data }; delete d.id;
        return await this.insert('settings', d);
      }
    } catch (e) { console.error('DB.saveSettings', e); return null; }
  },

  // ── USERS ─────────────────────────────────────────────

  async getUsers() {
    return await this.getAll('users', 'username', true);
  },

  async findUser(username, password) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(username)}&password=eq.${encodeURIComponent(password)}&limit=1`,
        { headers: HEADERS }
      );
      if (!res.ok) return null;
      const rows = await res.json();
      return rows[0] || null;
    } catch (e) { return null; }
  },

  async updateUserPassword(username, newPassword) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(username)}`,
        {
          method: 'PATCH',
          headers: HEADERS,
          body: JSON.stringify({ password: newPassword, updated_at: new Date().toISOString() })
        }
      );
      return res.ok;
    } catch (e) { return false; }
  },

  // ── COUNTERS ──────────────────────────────────────────

  async getNextInvNumber() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/counters?name=eq.invoice&limit=1`,
        { headers: HEADERS }
      );
      const rows = await res.json();
      let current = rows[0]?.value || 999;
      current++;
      if (rows[0]) {
        await this.update('counters', rows[0].id, { value: current });
      } else {
        await this.insert('counters', { name: 'invoice', value: current });
      }
      return 'INV-' + String(current).padStart(5, '0');
    } catch (e) {
      // fallback
      const n = Date.now();
      return 'INV-' + String(n).slice(-5);
    }
  },

  async getNextQuoNumber() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/counters?name=eq.quote&limit=1`,
        { headers: HEADERS }
      );
      const rows = await res.json();
      let current = rows[0]?.value || 99;
      current++;
      if (rows[0]) {
        await this.update('counters', rows[0].id, { value: current });
      } else {
        await this.insert('counters', { name: 'quote', value: current });
      }
      return 'COT-' + String(current).padStart(4, '0');
    } catch (e) {
      const n = Date.now();
      return 'COT-' + String(n).slice(-4);
    }
  },

  // ── SETUP CHECK ───────────────────────────────────────
  // Returns true if tables exist and are accessible
  async checkConnection() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/settings?limit=1`,
        { headers: HEADERS }
      );
      return res.ok;
    } catch (e) { return false; }
  }
};
