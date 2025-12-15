# 🏨 Services Server - Travium

API para gestión de servicios (farmacias, restaurantes, supermercados, etc.) en Travium.

## 🚀 Instalación

```bash
cd server/services_server
npm install
```

## ⚙️ Configuración

Crea un archivo `.env` con:

```env
PORT=3003
DATABASE_URL=tu_conexion_postgresql
```

## 📡 Endpoints

### 1. Listar todos los servicios
```http
GET /api/services
```

### 2. Buscar servicios con filtros
```http
GET /api/services/search?ciudad=Bogotá&categoria=pharmacy
```

**Parámetros:**
- `ciudad` (opcional): Nombre de la ciudad
- `categoria` (opcional): Categoría del servicio (pharmacy, restaurants, grocery, cafes, medical, gas)

### 3. Obtener un servicio por ID
```http
GET /api/services/:id
```

### 4. Crear un nuevo servicio
```http
POST /api/services
Content-Type: application/json

{
  "nombre": "Farmatodo Chapinero",
  "categoria": "pharmacy",
  "ciudad": "Bogotá",
  "pais": "Colombia",
  "direccion": "Cra 13 # 63-20",
  "latitud": 4.659,
  "longitud": -74.061,
  "telefono": "+57 601 555 0101",
  "rating": 4.6,
  "numero_reseñas": 120,
  "nivel_precios": "mid",
  "tipo_comida": null,
  "abierto_24h": true,
  "hora_apertura": "00:00",
  "hora_cierre": "23:59",
  "imagenes": ["url1.jpg", "url2.jpg"],
  "descripcion": "Farmacia 24 horas en Chapinero"
}
```

### 5. Actualizar un servicio
```http
PUT /api/services/:id
Content-Type: application/json

{
  "nombre": "Nombre actualizado",
  ...
}
```

### 6. Eliminar un servicio
```http
DELETE /api/services/:id
```

### 7. Health Check
```http
GET /health
```

## 📋 Estructura de la tabla `servicios`

```sql
Columnas:
- id: integer (PK)
- nombre: varchar
- categoria: varchar
- ciudad: varchar
- pais: varchar
- direccion: varchar
- latitud: numeric
- longitud: numeric
- telefono: varchar
- rating: numeric
- numero_reseñas: integer
- nivel_precios: varchar (low, mid, premium)
- tipo_comida: varchar (nullable)
- abierto_24h: boolean
- hora_apertura: time
- hora_cierre: time
- imagenes: text[] (array de URLs)
- descripcion: text
- created_at: timestamp
```

## 🎯 Categorías disponibles

- `pharmacy`: Farmacias
- `grocery`: Supermercados
- `restaurants`: Restaurantes
- `cafes`: Cafés
- `medical`: Médicos/Clínicas
- `gas`: Gasolineras

## 🏃‍♂️ Ejecutar

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3003`

## 📝 Notas

- El servidor usa PostgreSQL (Neon) para almacenar los datos
- Se conecta a la tabla `servicios` existente (NO crea tablas nuevas)
- Los filtros de búsqueda son acumulativos
- Los resultados se ordenan por rating descendente
