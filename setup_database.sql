-- ============================================
-- HYPERTECH SOLUTIONS - Supabase Database Setup
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. TABLA: settings (configuración de la empresa)
CREATE TABLE IF NOT EXISTS settings (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT DEFAULT 'HYPERTECH SOLUTIONS',
  rnc         TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  email       TEXT DEFAULT '',
  address     TEXT DEFAULT '',
  city        TEXT DEFAULT 'Santiago, República Dominicana',
  website     TEXT DEFAULT 'www.hypertech.com',
  currency    TEXT DEFAULT 'RD$',
  ncf         TEXT DEFAULT 'B02',
  terms       TEXT DEFAULT 'Gracias por su preferencia.',
  ejs_service TEXT DEFAULT '',
  ejs_template TEXT DEFAULT '',
  ejs_key     TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: users (usuarios del sistema)
CREATE TABLE IF NOT EXISTS users (
  id          BIGSERIAL PRIMARY KEY,
  username    TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  role        TEXT DEFAULT 'user',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar usuarios por defecto
INSERT INTO users (username, password, role) VALUES
  ('admin',      'hypertech2025', 'admin'),
  ('facturador', 'factura123',    'user')
ON CONFLICT (username) DO NOTHING;

-- 3. TABLA: clients (librería de clientes)
CREATE TABLE IF NOT EXISTS clients (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  rnc         TEXT DEFAULT '',
  email       TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  address     TEXT DEFAULT '',
  city        TEXT DEFAULT '',
  type        TEXT DEFAULT 'individual',
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: invoices (facturas)
CREATE TABLE IF NOT EXISTS invoices (
  id              BIGSERIAL PRIMARY KEY,
  number          TEXT UNIQUE NOT NULL,
  ncf             TEXT DEFAULT '',
  ncf_type        TEXT DEFAULT 'Factura con Valor Fiscal',
  company_rnc     TEXT DEFAULT '',
  client_name     TEXT NOT NULL,
  client_rnc      TEXT DEFAULT '',
  client_email    TEXT DEFAULT '',
  client_phone    TEXT DEFAULT '',
  client_address  TEXT DEFAULT '',
  date            DATE,
  due_date        DATE,
  items           JSONB DEFAULT '[]',
  subtotal        NUMERIC(12,2) DEFAULT 0,
  tax             NUMERIC(12,2) DEFAULT 0,
  discount        NUMERIC(12,2) DEFAULT 0,
  total           NUMERIC(12,2) DEFAULT 0,
  notes           TEXT DEFAULT '',
  status          TEXT DEFAULT 'pending',
  type            TEXT DEFAULT 'invoice',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: quotes (cotizaciones)
CREATE TABLE IF NOT EXISTS quotes (
  id              BIGSERIAL PRIMARY KEY,
  number          TEXT UNIQUE NOT NULL,
  client_name     TEXT NOT NULL,
  client_rnc      TEXT DEFAULT '',
  client_email    TEXT DEFAULT '',
  client_phone    TEXT DEFAULT '',
  date            DATE,
  expiry          DATE,
  items           JSONB DEFAULT '[]',
  subtotal        NUMERIC(12,2) DEFAULT 0,
  tax             NUMERIC(12,2) DEFAULT 0,
  discount        NUMERIC(12,2) DEFAULT 0,
  total           NUMERIC(12,2) DEFAULT 0,
  notes           TEXT DEFAULT '',
  status          TEXT DEFAULT 'quote',
  type            TEXT DEFAULT 'quote',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: counters (contadores de numeración)
CREATE TABLE IF NOT EXISTS counters (
  id    BIGSERIAL PRIMARY KEY,
  name  TEXT UNIQUE NOT NULL,
  value BIGINT DEFAULT 999
);

INSERT INTO counters (name, value) VALUES
  ('invoice', 999),
  ('quote',   99)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- Permite acceso público (necesario para GitHub Pages)
-- ============================================

ALTER TABLE settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters  ENABLE ROW LEVEL SECURITY;

-- Política: permitir todo con la clave anon
CREATE POLICY "allow_all_settings"  ON settings  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_users"     ON users     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_clients"   ON clients   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_invoices"  ON invoices  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_quotes"    ON quotes    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_counters"  ON counters  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- VERIFICAR QUE TODO ESTÁ BIEN
-- ============================================
SELECT 'settings'  AS tabla, COUNT(*) AS registros FROM settings
UNION ALL
SELECT 'users',    COUNT(*) FROM users
UNION ALL
SELECT 'clients',  COUNT(*) FROM clients
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'quotes',   COUNT(*) FROM quotes
UNION ALL
SELECT 'counters', COUNT(*) FROM counters;
