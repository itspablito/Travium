const API_BASE_URL = 'http://localhost:3005/api';

// Obtener todas las reservas (con filtros opcionales)
export async function getAllReservations(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.tipo_reserva) params.append('tipo_reserva', filters.tipo_reserva);
    if (filters.estado) params.append('estado', filters.estado);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/reservations${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.reservations;
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    throw error;
  }
}

// Obtener una reserva por ID
export async function getReservationById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo reserva:', error);
    throw error;
  }
}

// Crear nueva reserva
export async function createReservation(reservationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creando reserva:', error);
    throw error;
  }
}

// Actualizar estado de reserva
export async function updateReservationStatus(id, estado) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error actualizando reserva:', error);
    throw error;
  }
}

// Eliminar reserva
export async function deleteReservation(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error eliminando reserva:', error);
    throw error;
  }
}

// Obtener estadísticas de reservas por usuario
export async function getReservationStats(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/stats/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
}

// Helpers para crear reservas específicas

// Crear reserva de vuelo
export async function createFlightReservation({
  userId,
  flight,
  selectedFare = 'standard',
  departDate,
  returnDate = null,
}) {
  const reservationData = {
    user_id: userId,
    tipo_reserva: 'vuelo',
    producto_id: flight.dbId || null, // Usar dbId numérico o null si es mock
    nombre_producto: `${flight.from} → ${flight.to}`,
    ciudad: flight.to,
    pais: 'N/A', // Agregar si tienes el país en los datos
    fecha_inicio: departDate,
    fecha_fin: returnDate,
    hora_salida: flight.depart,
    hora_llegada: flight.arrive,
    aerolinea: flight.airline,
    codigo_vuelo: flight.flightCode || 'N/A',
    aeropuerto_origen: flight.from,
    aeropuerto_destino: flight.to,
    clase_cabina: flight.cabin || 'Economy',
    total_price: flight.fareTiers[selectedFare],
    moneda: 'USD',
    estado: 'confirmada',
  };

  return createReservation(reservationData);
}

// Crear reserva de alojamiento
export async function createLodgingReservation({
  userId,
  lodging,
  checkIn,
  checkOut,
  guests,
  totalPrice,
}) {
  const reservationData = {
    user_id: userId,
    tipo_reserva: 'alojamiento',
    producto_id: null, // OSM IDs son muy grandes (BIGINT), se guarda en osm_id
    nombre_producto: lodging.name,
    ciudad: lodging.city,
    pais: lodging.country,
    direccion: lodging.address,
    latitud: lodging.lat,
    longitud: lodging.lng,
    osm_type: lodging.osm_type,
    osm_id: lodging.osm_id,
    fecha_inicio: checkIn,
    fecha_fin: checkOut,
    huespedes: guests,
    total_price: totalPrice,
    moneda: 'USD',
    estado: 'confirmada',
  };

  return createReservation(reservationData);
}

// Crear reserva de vehículo
export async function createVehicleReservation({
  userId,
  vehicle,
  pickupDate,
  returnDate,
  totalPrice,
}) {
  const reservationData = {
    user_id: userId,
    tipo_reserva: 'vehiculo',
    producto_id: vehicle.id,
    nombre_producto: `${vehicle.brand} ${vehicle.model}`,
    ciudad: vehicle.city,
    pais: vehicle.country,
    direccion: vehicle.pickupLocation,
    latitud: vehicle.lat,
    longitud: vehicle.lng,
    fecha_inicio: pickupDate,
    fecha_fin: returnDate,
    tipo_vehiculo: vehicle.type,
    marca: vehicle.brand,
    modelo: vehicle.model,
    total_price: totalPrice,
    moneda: 'USD',
    estado: 'confirmada',
  };

  return createReservation(reservationData);
}
