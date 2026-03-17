# 🖥️ HYPERTECH SOLUTIONS — Sistema de Facturación Electrónica

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![DGII](https://img.shields.io/badge/DGII-Compatible-orange)
![License](https://img.shields.io/badge/license-MIT-green)

Sistema de facturación electrónica web completo para **HYPERTECH SOLUTIONS**, compatible con los requisitos de la **DGII (Dirección General de Impuestos Internos)** de República Dominicana.

---

## ✨ Características

| Módulo | Descripción |
|--------|-------------|
| 📊 **Dashboard** | Estadísticas en tiempo real: facturas del día, semana, mes e ingresos |
| 📄 **Facturación** | Creación de facturas con numeración única, cálculo de ITBIS, descuentos |
| 📋 **Cotizaciones** | Sistema de cotizaciones convertibles a facturas |
| 🗂️ **Historial** | Búsqueda por nombre, NCF, RNC, fecha, período o estado |
| 👥 **Clientes** | Librería completa con creación automática al facturar |
| ✅ **Verificación** | Portal público de verificación de facturas para la DGII |
| 📱 **QR DGII** | Código QR en cada factura que lleva al portal de verificación |
| 📧 **Email** | Envío por mailto o EmailJS configurable |
| 🖨️ **Impresión** | Módulo de impresión con formato profesional, exportable como PDF |
| ⚙️ **Configuración** | Datos de empresa, RNC, NCF, EmailJS, moneda y términos |

---

## 🏛️ Compatibilidad DGII

Cada factura incluye:
- **NCF (Número de Comprobante Fiscal)** en formato DGII (B01, B02, B14, etc.)
- **RNC del emisor y receptor**
- **Código QR** que enlaza al portal de verificación (`verify.html`)
- El portal de verificación muestra todos los datos fiscales en formato legible para inspectores

### Formato del QR
El QR contiene una URL de verificación con los datos de la factura codificados en Base64:
```
https://[dominio]/verify.html?inv=INV-01000&data=[base64]
```

---

## 🚀 Despliegue en GitHub Pages

### Paso 1 — Subir a GitHub
```bash
git init
git add .
git commit -m "HYPERTECH SOLUTIONS - Sistema de Facturación v2.0"
git remote add origin https://github.com/TU_USUARIO/hypertech-billing.git
git push -u origin main
```

### Paso 2 — Activar GitHub Pages
1. Ir a **Settings** del repositorio
2. Sección **Pages** → Source: `main` branch, folder: `/ (root)`
3. Guardar — en ~2 minutos estará en `https://TU_USUARIO.github.io/hypertech-billing/`

### Paso 3 — Configurar la empresa
1. Abrir la app → ir a **Configuración**
2. Llenar: Nombre, RNC, Teléfono, Email, Dirección, NCF Prefijo
3. Guardar → los datos aparecen en todas las facturas

---

## 📧 Configurar Envío Automático de Email (EmailJS)

1. Crear cuenta en [emailjs.com](https://emailjs.com) (gratis hasta 200 emails/mes)
2. Crear un **Email Service** (Gmail, Outlook, etc.)
3. Crear un **Email Template** con las variables: `{{to_email}}`, `{{subject}}`, `{{message}}`
4. En la app → **Configuración** → llenar los campos EmailJS
5. Listo — el botón "Enviar Email" enviará automáticamente

---

## 📁 Estructura del Proyecto

```
hypertech-billing/
├── index.html          # Aplicación principal
├── verify.html         # Portal de verificación DGII (acceso por QR)
├── css/
│   ├── main.css        # Estilos base, layout, componentes
│   ├── invoice.css     # Estilos de facturas y formularios
│   └── components.css  # Componentes UI adicionales
├── js/
│   ├── state.js        # Estado global y localStorage
│   ├── utils.js        # Funciones utilitarias, navegación, QR
│   ├── invoice.js      # Módulo de facturas
│   ├── quote.js        # Módulo de cotizaciones
│   ├── history.js      # Historial y filtros
│   ├── dashboard.js    # Dashboard y estadísticas
│   ├── clients.js      # Librería de clientes
│   ├── settings.js     # Configuración
│   └── app.js          # Inicialización
├── assets/
│   └── favicon.svg     # Ícono de la aplicación
└── README.md
```

---

## 💾 Almacenamiento

Los datos se guardan en **localStorage** del navegador:

| Clave | Contenido |
|-------|-----------|
| `ht_invoices` | Todas las facturas |
| `ht_quotes`   | Cotizaciones |
| `ht_clients`  | Librería de clientes |
| `ht_settings` | Configuración de la empresa |

> **Para producción real**: reemplazar localStorage con una API backend (Node.js + PostgreSQL o Supabase).

---

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Azul HYPERTECH | `#0D47A1` | Header, botones primarios, NCF |
| Naranja | `#F57C00` | Acentos, borde header |
| Amarillo | `#F9A825` | Separadores, títulos de secciones |
| Negro | `#1A1A1A` | Texto principal |
| Blanco | `#FFFFFF` | Fondo de facturas y tarjetas |

---

## 📋 Tipos de NCF Soportados

| Código | Tipo |
|--------|------|
| B01 | Facturas con Crédito Fiscal |
| B02 | Facturas para Consumidor Final |
| B14 | Facturas para Régimen Especial |
| B15 | Facturas del Gobierno |

Configurable en **Ajustes → NCF Prefijo**.

---

## 📄 Licencia

MIT — Uso libre para HYPERTECH SOLUTIONS y clientes.

---

*Desarrollado para HYPERTECH SOLUTIONS — Santiago, República Dominicana*
