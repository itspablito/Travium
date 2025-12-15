/**
 * Servicio para interactuar con la API de Vuelos
 * 
 * Base URL: http://localhost:3002
 */

const FLIGHTS_API_URL = 'http://localhost:3002/api/flights';

/**
 * Buscar vuelos entre dos ciudades
 * @param {string} origin - Código IATA del origen (ej: "BOG")
 * @param {string} destination - Código IATA del destino (ej: "MAD")
 * @returns {Promise} Lista de vuelos con sus tarifas
 */
export async function searchFlights(origin, destination) {
  try {
    const response = await fetch(`${FLIGHTS_API_URL}/search?origin=${origin}&destination=${destination}`);
    
    if (!response.ok) {
      throw new Error('Error buscando vuelos');
    }
    
    const data = await response.json();
    return data.flights;
  } catch (error) {
    console.error('Error en searchFlights:', error);
    throw error;
  }
}

/**
 * Agregar un nuevo vuelo
 * @param {Object} flightData - Datos del vuelo
 * @returns {Promise} Vuelo creado
 */
export async function addFlight(flightData) {
  try {
    const response = await fetch(FLIGHTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flightData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error agregando vuelo');
    }
    
    const data = await response.json();
    return data.flight;
  } catch (error) {
    console.error('Error en addFlight:', error);
    throw error;
  }
}

/**
 * Obtener todos los vuelos
 * @returns {Promise} Lista de todos los vuelos
 */
export async function getAllFlights() {
  try {
    const response = await fetch(FLIGHTS_API_URL);
    
    if (!response.ok) {
      throw new Error('Error obteniendo vuelos');
    }
    
    const data = await response.json();
    return data.flights;
  } catch (error) {
    console.error('Error en getAllFlights:', error);
    throw error;
  }
}

/**
 * Obtener un vuelo por ID
 * @param {number} id - ID del vuelo
 * @returns {Promise} Vuelo
 */
export async function getFlightById(id) {
  try {
    const response = await fetch(`${FLIGHTS_API_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error('Vuelo no encontrado');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getFlightById:', error);
    throw error;
  }
}

/**
 * Actualizar un vuelo
 * @param {number} id - ID del vuelo
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise} Vuelo actualizado
 */
export async function updateFlight(id, updateData) {
  try {
    const response = await fetch(`${FLIGHTS_API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error actualizando vuelo');
    }
    
    const data = await response.json();
    return data.flight;
  } catch (error) {
    console.error('Error en updateFlight:', error);
    throw error;
  }
}

/**
 * Eliminar un vuelo
 * @param {number} id - ID del vuelo
 * @returns {Promise}
 */
export async function deleteFlight(id) {
  try {
    const response = await fetch(`${FLIGHTS_API_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error eliminando vuelo');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en deleteFlight:', error);
    throw error;
  }
}

/**
 * Ejemplo de uso en un componente React
 */
export const FlightExamples = {
  // Buscar vuelos BOG → MAD
  async searchExample() {
    const flights = await searchFlights('BOG', 'MAD');
    console.log('Vuelos encontrados:', flights);
    
    // Estructura de cada vuelo:
    // {
    //   id: 1,
    //   airline: "LATAM",
    //   airline_code: "LTM",
    //   origin_code: "BOG",
    //   destination_code: "MAD",
    //   depart_time: "08:45",
    //   arrive_time: "13:35",
    //   duration_minutes: 327,
    //   stops: 1,
    //   benefits: ["Equipaje mano"],
    //   fares: {
    //     basic: { price: 258000, fare_id: 1 },
    //     standard: { price: 275000, fare_id: 2 },
    //     flexible: { price: 308000, fare_id: 3 },
    //     premium: { price: 426000, fare_id: 4 }
    //   }
    // }
  },

  // Agregar un nuevo vuelo
  async addExample() {
    const newFlight = await addFlight({
      airline: "Avianca",
      airline_code: "AVA",
      origin_code: "BOG",
      destination_code: "MIA",
      depart_time: "10:00",
      arrive_time: "15:30",
      duration_minutes: 240,
      stops: 0,
      benefits: ["Equipaje mano", "Comida incluida"],
      fares: {
        basic: 350000,
        standard: 420000,
        flexible: 480000,
        premium: 650000
      }
    });
    
    console.log('Vuelo agregado:', newFlight);
  },

  // Actualizar tarifas de un vuelo
  async updateExample() {
    const updated = await updateFlight(1, {
      fares: {
        basic: 260000,
        standard: 280000,
        flexible: 315000,
        premium: 435000
      }
    });
    
    console.log('Vuelo actualizado:', updated);
  }
};
