# Reservations Server

API de reservas para Travium - Gestiona todas las compras de usuarios (vuelos, alojamiento, vehículos).

## Puerto
- **3005**

## Endpoints

### GET /api/reservations
Obtener todas las reservas (con filtros opcionales)

**Query params:**
- `user_id` - Filtrar por ID de usuario
- `tipo_reserva` - Filtrar por tipo (vuelo, alojamiento, vehiculo)
- `estado` - Filtrar por estado (pendiente, confirmada, cancelada, completada)

**Ejemplo:**
```bash
curl http://localhost:3005/api/reservations?user_id=1&tipo_reserva=vuelo
```

### GET /api/reservations/:id
Obtener una reserva específica

### POST /api/reservations
Crear nueva reserva

**Body (campos requeridos):**
```json
{
  "user_id": 1,
  "tipo_reserva": "vuelo",
  "nombre_producto": "Bogotá → Miami",
  "fecha_inicio": "2025-03-15",
  "total_price": 450.00
}
```

**Body completo (vuelo):**
```json
{
  "user_id": 1,
  "tipo_reserva": "vuelo",
  "producto_id": 123,
  "nombre_producto": "Bogotá → Miami",
  "ciudad": "Miami",
  "pais": "USA",
  "fecha_inicio": "2025-03-15",
  "fecha_fin": "2025-03-22",
  "hora_salida": "14:30",
  "hora_llegada": "18:45",
  "aerolinea": "Avianca",
  "codigo_vuelo": "AV123",
  "aeropuerto_origen": "BOG",
  "aeropuerto_destino": "MIA",
  "clase_cabina": "Economy",
  "total_price": 450.00,
  "moneda": "USD",
  "estado": "confirmada"
}
```

**Body completo (alojamiento):**
```json
{
  "user_id": 1,
  "tipo_reserva": "alojamiento",
  "producto_id": 456,
  "nombre_producto": "Hotel Boutique Centro",
  "ciudad": "Cartagena",
  "pais": "Colombia",
  "direccion": "Calle 10 #5-23",
  "latitud": 10.3910,
  "longitud": -75.4794,
  "fecha_inicio": "2025-04-10",
  "fecha_fin": "2025-04-15",
  "huespedes": 2,
  "total_price": 650.00,
  "moneda": "USD",
  "estado": "confirmada"
}
```

### PATCH /api/reservations/:id
Actualizar estado de reserva

**Body:**
```json
{
  "estado": "cancelada"
}
```

### DELETE /api/reservations/:id
Eliminar reserva permanentemente

### GET /api/reservations/stats/:user_id
Obtener estadísticas de reservas por usuario

## Base de datos

Conecta a tabla `reservas` existente en PostgreSQL (Neon).

**Columnas principales:**
- id, user_id, tipo_reserva, producto_id
- nombre_producto, ciudad, pais
- direccion, latitud, longitud, osm_type, osm_id
- fecha_inicio, fecha_fin
- hora_salida, hora_llegada
- aerolinea, codigo_vuelo, aeropuerto_origen, aeropuerto_destino, clase_cabina
- huespedes
- tipo_vehiculo, marca, modelo
- total_price, moneda, estado
- created_at

## Ejecutar

```bash
cd server/reservations_server
npm install
npm run dev
```
