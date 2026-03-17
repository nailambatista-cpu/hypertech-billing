/**
 * HYPERTECH SOLUTIONS - Data Normalizer
 * Convierte snake_case de Supabase a camelCase que usa la app
 * Este archivo debe cargarse DESPUÉS de db.js y ANTES de state.js
 */

// Normaliza una factura de Supabase al formato que usa la app
function normalizeInvoice(i) {
  if (!i) return null;
  return {
    id:            i.id,
    number:        i.number        || '',
    ncf:           i.ncf           || '',
    ncfType:       i.ncf_type      || 'Factura con Valor Fiscal',
    companyRnc:    i.company_rnc   || '',
    clientName:    i.client_name   || i.clientName   || '',
    clientRnc:     i.client_rnc    || i.clientRnc    || '',
    clientEmail:   i.client_email  || i.clientEmail  || '',
    clientPhone:   i.client_phone  || i.clientPhone  || '',
    clientAddress: i.client_address|| i.clientAddress|| '',
    date:          i.date          || '',
    dueDate:       i.due_date      || i.dueDate      || '',
    items:         i.items         || [],
    subtotal:      parseFloat(i.subtotal  || 0),
    tax:           parseFloat(i.tax       || 0),
    discount:      parseFloat(i.discount  || 0),
    total:         parseFloat(i.total     || 0),
    notes:         i.notes        || '',
    status:        i.status       || 'pending',
    type:          i.type         || 'invoice',
    createdAt:     i.created_at   || i.createdAt || ''
  };
}

// Normaliza una cotización
function normalizeQuote(q) {
  if (!q) return null;
  return {
    id:          q.id,
    number:      q.number       || '',
    clientName:  q.client_name  || q.clientName  || '',
    clientRnc:   q.client_rnc   || q.clientRnc   || '',
    clientEmail: q.client_email || q.clientEmail || '',
    clientPhone: q.client_phone || q.clientPhone || '',
    date:        q.date         || '',
    expiry:      q.expiry       || '',
    items:       q.items        || [],
    subtotal:    parseFloat(q.subtotal  || 0),
    tax:         parseFloat(q.tax       || 0),
    discount:    parseFloat(q.discount  || 0),
    total:       parseFloat(q.total     || 0),
    notes:       q.notes        || '',
    status:      q.status       || 'quote',
    type:        q.type         || 'quote',
    createdAt:   q.created_at   || q.createdAt || ''
  };
}

// Normaliza un cliente
function normalizeClient(c) {
  if (!c) return null;
  return {
    id:      c.id,
    name:    c.name    || '',
    rnc:     c.rnc     || '',
    email:   c.email   || '',
    phone:   c.phone   || '',
    address: c.address || '',
    city:    c.city    || '',
    type:    c.type    || 'individual',
    notes:   c.notes   || '',
    createdAt: c.created_at || c.createdAt || ''
  };
}

// Convierte factura de camelCase a snake_case para guardar en Supabase
function invoiceToDB(inv) {
  return {
    number:         inv.number        || '',
    ncf:            inv.ncf           || '',
    ncf_type:       inv.ncfType       || 'Factura con Valor Fiscal',
    company_rnc:    inv.companyRnc    || '',
    client_name:    inv.clientName    || '',
    client_rnc:     inv.clientRnc     || '',
    client_email:   inv.clientEmail   || '',
    client_phone:   inv.clientPhone   || '',
    client_address: inv.clientAddress || '',
    date:           inv.date          || null,
    due_date:       inv.dueDate       || null,
    items:          inv.items         || [],
    subtotal:       inv.subtotal      || 0,
    tax:            inv.tax           || 0,
    discount:       inv.discount      || 0,
    total:          inv.total         || 0,
    notes:          inv.notes         || '',
    status:         inv.status        || 'pending',
    type:           inv.type          || 'invoice',
    created_at:     new Date().toISOString()
  };
}

// Convierte cotización de camelCase a snake_case
function quoteToDB(quo) {
  return {
    number:       quo.number      || '',
    client_name:  quo.clientName  || '',
    client_rnc:   quo.clientRnc   || '',
    client_email: quo.clientEmail || '',
    client_phone: quo.clientPhone || '',
    date:         quo.date        || null,
    expiry:       quo.expiry      || null,
    items:        quo.items       || [],
    subtotal:     quo.subtotal    || 0,
    tax:          quo.tax         || 0,
    discount:     quo.discount    || 0,
    total:        quo.total       || 0,
    notes:        quo.notes       || '',
    status:       quo.status      || 'quote',
    type:         quo.type        || 'quote',
    created_at:   new Date().toISOString()
  };
}
