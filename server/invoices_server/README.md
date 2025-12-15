# Invoices Server

API de facturas para Travium - Gestiona todas las facturas de compras.

## Puerto
- **3006**

## Endpoints

### GET /api/invoices
Obtener todas las facturas (con filtros opcionales)

**Query params:**
- `user_id` - Filtrar por ID de usuario
- `estado` - Filtrar por estado (pagada, anulada, reembolsada)

### GET /api/invoices/:id
Obtener una factura específica

### GET /api/invoices/reservation/:reserva_id
Obtener factura por ID de reserva

### POST /api/invoices
Crear nueva factura

**Body (campos requeridos):**
```json
{
  "reserva_id": 1,
  "user_id": 1,
  "tipo_item": "Vuelo",
  "descripcion": "Bogotá → Miami",
  "fecha_inicio": "2025-03-15",
  "subtotal": 450.00,
  "total": 450.00,
  "nombre_cliente": "Juan Pérez"
}
```

**Body completo:**
```json
{
  "reserva_id": 1,
  "user_id": 1,
  "tipo_item": "Vuelo",
  "descripcion": "Bogotá → Miami - 2 pasajeros",
  "fecha_inicio": "2025-03-15",
  "fecha_fin": "2025-03-22",
  "cantidad": 2,
  "subtotal": 900.00,
  "impuestos": 0,
  "total": 900.00,
  "moneda": "USD",
  "metodo_pago": "tarjeta",
  "estado": "pagada",
  "nombre_cliente": "Juan Pérez",
  "identificacion_fiscal": "1234567890",
  "direccion_fiscal": "Calle 123, Bogotá"
}
```

### PATCH /api/invoices/:id
Actualizar estado de factura

**Body:**
```json
{
  "estado": "anulada"
}
```

### DELETE /api/invoices/:id
Eliminar factura

### GET /api/invoices/stats/:user_id
Obtener estadísticas de facturas por usuario

## Base de datos

Conecta a tabla `facturas` existente en PostgreSQL (Neon).

**Columnas principales:**
- id, reserva_id (UNIQUE), user_id
- numero_factura (auto-generado, UNIQUE)
- fecha_emision, tipo_item, descripcion
- fecha_inicio, fecha_fin, cantidad
- subtotal, impuestos, total, moneda
- metodo_pago, estado
- nombre_cliente, identificacion_fiscal, direccion_fiscal
- created_at

**Número de factura:**
- Formato: `INV-YYYYMMDD-XXXX`
- Ejemplo: `INV-20251215-0001`
- Generado automáticamente y único

## Ejecutar

```bash
cd server/invoices_server
npm install
npm run dev
```
