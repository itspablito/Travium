import fetch from 'node-fetch';

const API_URL = 'http://localhost:3002/api/flights';

// Vuelos de ejemplo basados en la imagen
const flights = [
  {
    airline: "LATAM",
    airline_code: "LTM",
    origin_code: "BOG",
    destination_code: "MAD",
    depart_time: "08:45",
    arrive_time: "13:35",
    duration_minutes: 327,
    stops: 1,
    benefits: ["Equipaje mano"],
    fares: {
      basic: 258000,
      standard: 275000,
      flexible: 308000,
      premium: 426000
    }
  },
  {
    airline: "Viva Air",
    airline_code: "VVA",
    origin_code: "BOG",
    destination_code: "MAD",
    depart_time: "06:15",
    arrive_time: "12:10",
    duration_minutes: 416,
    stops: 0,
    benefits: ["Equipaje mano", "Asiento estándar"],
    fares: {
      basic: 275000,
      standard: 293000,
      flexible: 328000,
      premium: 454000
    }
  },
  {
    airline: "Iberia",
    airline_code: "IBE",
    origin_code: "BOG",
    destination_code: "MAD",
    depart_time: "14:15",
    arrive_time: "19:10",
    duration_minutes: 328,
    stops: 0,
    benefits: ["Equipaje mano", "Asiento estándar"],
    fares: {
      basic: 286000,
      standard: 305000,
      flexible: 341000,
      premium: 472000
    }
  }
];

async function seedFlights() {
  console.log('🚀 Iniciando población de base de datos de vuelos...\n');

  for (const flight of flights) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flight)
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Vuelo agregado: ${flight.airline} ${flight.origin_code} → ${flight.destination_code}`);
        console.log(`   Tarifas: Basic $${flight.fares.basic/1000}k | Standard $${flight.fares.standard/1000}k | Flexible $${flight.fares.flexible/1000}k | Premium $${flight.fares.premium/1000}k\n`);
      } else {
        console.error(`❌ Error agregando ${flight.airline}:`, data.error);
      }
    } catch (error) {
      console.error(`❌ Error de conexión:`, error.message);
      console.log('\n⚠️  Asegúrate de que el servidor esté corriendo en http://localhost:3002\n');
      process.exit(1);
    }
  }

  console.log('✨ Población completada!\n');
  
  // Verificar vuelos agregados
  try {
    const response = await fetch(`${API_URL}/search?origin=BOG&destination=MAD`);
    const data = await response.json();
    console.log(`📊 Total de vuelos BOG → MAD: ${data.count}`);
  } catch (error) {
    console.error('Error verificando vuelos:', error.message);
  }
}

seedFlights();
