# API de Vuelos - Travium

Servidor backend para gestionar vuelos con múltiples tarifas (Basic, Estándar, Flexible, Premium).

## 🚀 Iniciar el servidor

```bash
npm install
npm run dev
```

El servidor corre en `http://localhost:3002`

## 📋 Endpoints

### 1. Agregar nuevo vuelo

**POST** `/api/flights`

Agrega un nuevo vuelo con sus tarifas. Si no se proporcionan las tarifas, se generan automáticamente.

**Body:**
```json
{
  "airline": "LATAM",
  "airline_code": "LTM",
  "origin_code": "BOG",
  "destination_code": "MAD",
  "depart_time": "08:45",
  "arrive_time": "13:35",
  "duration_minutes": 327,
  "stops": 1,
  "benefits": ["Equipaje mano"],
  "fares": {
    "basic": 258000,
    "standard": 275000,
    "flexible": 308000,
    "premium": 426000
  }
}
```

**Respuesta:**
```json
{
  "message": "Vuelo agregado exitosamente",
  "flight": {
    "id": 1,
    "airline": "LATAM",
    "airline_code": "LTM",
    "origin_code": "BOG",
    "destination_code": "MAD",
    "depart_time": "08:45",
    "arrive_time": "13:35",
    "duration_minutes": 327,
    "stops": 1,
    "benefits": ["Equipaje mano"],
    "fares": {
      "basic": { "price": 258000, "fare_id": 1 },
      "standard": { "price": 275000, "fare_id": 2 },
      "flexible": { "price": 308000, "fare_id": 3 },
      "premium": { "price": 426000, "fare_id": 4 }
    }
  }
}
```

### 2. Buscar vuelos

**GET** `/api/flights/search?origin=BOG&destination=MAD`

Busca todos los vuelos entre dos ciudades.

**Respuesta:**
```json
{
  "flights": [
    {
      "id": 1,
      "airline": "LATAM",
      "origin_code": "BOG",
      "destination_code": "MAD",
      "depart_time": "08:45",
      "arrive_time": "13:35",
      "duration_minutes": 327,
      "stops": 1,
      "benefits": ["Equipaje mano"],
      "fares": {
        "basic": { "price": 258000, "fare_id": 1 },
        "standard": { "price": 275000, "fare_id": 2 },
        "flexible": { "price": 308000, "fare_id": 3 },
        "premium": { "price": 426000, "fare_id": 4 }
      }
    }
  ],
  "count": 1
}
```

### 3. Obtener vuelo por ID

**GET** `/api/flights/:id`

### 4. Listar todos los vuelos

**GET** `/api/flights`

### 5. Actualizar vuelo

**PUT** `/api/flights/:id`

**Body (todos los campos opcionales):**
```json
{
  "airline": "LATAM Airlines",
  "depart_time": "09:00",
  "fares": {
    "basic": 260000,
    "standard": 280000
  }
}
```

### 6. Eliminar vuelo

**DELETE** `/api/flights/:id`

### 7. Health Check

**GET** `/health`

## 📊 Estructura de datos

### Tabla `flights`
- `id`: ID único del vuelo
- `airline`: Nombre de la aerolínea (ej: "LATAM", "Viva Air", "Iberia")
- `airline_code`: Código de la aerolínea (ej: "LTM", "VVA", "IBE")
- `origin_code`: Código IATA del aeropuerto de origen (ej: "BOG")
- `destination_code`: Código IATA del aeropuerto de destino (ej: "MAD")
- `depart_time`: Hora de salida (formato: "HH:mm")
- `arrive_time`: Hora de llegada (formato: "HH:mm")
- `duration_minutes`: Duración del vuelo en minutos
- `stops`: Número de escalas (0 = directo)
- `benefits`: Array de beneficios (ej: ["Equipaje mano", "Asiento estándar"])

### Tabla `flight_fares`
- `id`: ID único de la tarifa
- `flight_id`: Referencia al vuelo
- `fare_type`: Tipo de tarifa ('basic', 'standard', 'flexible', 'premium')
- `price_cop`: Precio en pesos colombianos

## 💡 Ejemplos de uso

### Agregar vuelos desde la imagen

#### LATAM BOG → MAD
```bash
curl -X POST http://localhost:3002/api/flights \
  -H "Content-Type: application/json" \
  -d '{
    "airline": "LATAM",
    "airline_code": "LTM",
    "origin_code": "BOG",
    "destination_code": "MAD",
    "depart_time": "08:45",
    "arrive_time": "13:35",
    "duration_minutes": 327,
    "stops": 1,
    "benefits": ["Equipaje mano"],
    "fares": {
      "basic": 258000,
      "standard": 275000,
      "flexible": 308000,
      "premium": 426000
    }
  }'
```

#### Viva Air BOG → MAD
```bash
curl -X POST http://localhost:3002/api/flights \
  -H "Content-Type: application/json" \
  -d '{
    "airline": "Viva Air",
    "airline_code": "VVA",
    "origin_code": "BOG",
    "destination_code": "MAD",
    "depart_time": "06:15",
    "arrive_time": "12:10",
    "duration_minutes": 416,
    "stops": 0,
    "benefits": ["Equipaje mano", "Asiento estándar"],
    "fares": {
      "basic": 275000,
      "standard": 293000,
      "flexible": 328000,
      "premium": 454000
    }
  }'
```

#### Iberia BOG → MAD
```bash
curl -X POST http://localhost:3002/api/flights \
  -H "Content-Type: application/json" \
  -d '{
    "airline": "Iberia",
    "airline_code": "IBE",
    "origin_code": "BOG",
    "destination_code": "MAD",
    "depart_time": "14:15",
    "arrive_time": "19:10",
    "duration_minutes": 328,
    "stops": 0,
    "benefits": ["Equipaje mano", "Asiento estándar"],
    "fares": {
      "basic": 286000,
      "standard": 305000,
      "flexible": 341000,
      "premium": 472000
    }
  }'
```

## 🔄 Auto-generación de tarifas

Si agregas un vuelo SIN especificar las tarifas, el sistema las genera automáticamente:

```json
{
  "airline": "Avianca",
  "airline_code": "AVA",
  "origin_code": "BOG",
  "destination_code": "MIA",
  "depart_time": "10:00",
  "arrive_time": "15:30",
  "duration_minutes": 240,
  "stops": 0,
  "benefits": ["Equipaje mano", "Comida incluida"]
}
```

El sistema generará precios determinísticos basados en el origen y destino.

## 🌐 Variables de entorno

Archivo `.env`:
```
DATABASE_URL=postgresql://...
PORT=3002
```
