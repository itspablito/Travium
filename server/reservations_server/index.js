import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3005;

// ====================== MIDDLEWARES ======================
app.use(cors());
app.use(express.json());

// ====================== DB ======================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // Máximo número de clientes en el pool
  idleTimeoutMillis: 30000, // Cerrar clientes inactivos después de 30 segundos
  connectionTimeoutMillis: 10000, // Timeout para obtener conexión: 10 segundos
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Manejo de errores del pool
pool.on('error', (err, client) => {
  console.error('❌ Error inesperado en cliente del pool:', err);
});

pool.on('connect', () => {
  console.log('🔌 Nueva conexión establecida con la base de datos');
});

pool.on('remove', () => {
  console.log('🔌 Conexión removida del pool');
});

// Verificar conexión y estructura de la tabla
async function initDB() {
  let retries = 3;
  while (retries > 0) {
    try {
      const result = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'reservas'
        ORDER BY ordinal_position
      `);
      
      console.log('✅ Conectado a tabla \'reservas\' existente');
      console.log('📋 Columnas disponibles:', result.rows.map(r => r.column_name).join(', '));
      console.log('✅ Base de datos lista');
      break;
    } catch (error) {
      retries--;
      console.error(`❌ Error verificando tabla reservas (${3 - retries}/3):`, error.message);
      if (retries === 0) {
        console.error('❌ No se pudo conectar a la base de datos después de 3 intentos');
      } else {
        console.log(`⏳ Reintentando en 2 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
}

initDB();

// ====================== ENDPOINTS ======================

// Obtener todas las reservas (o filtrar por user_id)
app.get('/api/reservations', async (req, res) => {
  try {
    const { user_id, tipo_reserva, estado } = req.query;
    
    let query = 'SELECT * FROM reservas WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (user_id) {
      query += ` AND user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    if (tipo_reserva) {
      query += ` AND tipo_reserva = $${paramCount}`;
      params.push(tipo_reserva);
      paramCount++;
    }

    if (estado) {
      query += ` AND estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ reservations: result.rows });
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    res.status(500).json({ error: 'Error obteniendo reservas' });
  }
});

// Obtener una reserva por ID
app.get('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM reservas WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo reserva:', error);
    res.status(500).json({ error: 'Error obteniendo reserva' });
  }
});

// Crear nueva reserva
app.post('/api/reservations', async (req, res) => {
  try {
    const {
      user_id,
      tipo_reserva,
      producto_id,
      nombre_producto,
      ciudad,
      pais,
      direccion,
      latitud,
      longitud,
      osm_type,
      osm_id,
      fecha_inicio,
      fecha_fin,
      hora_salida,
      hora_llegada,
      aerolinea,
      codigo_vuelo,
      aeropuerto_origen,
      aeropuerto_destino,
      clase_cabina,
      huespedes,
      tipo_vehiculo,
      marca,
      modelo,
      total_price,
      moneda,
      estado
    } = req.body;

    // Validaciones básicas
    if (!user_id || !tipo_reserva || !nombre_producto || !fecha_inicio || !total_price) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: user_id, tipo_reserva, nombre_producto, fecha_inicio, total_price' 
      });
    }

    if (!['vuelo', 'alojamiento', 'vehiculo'].includes(tipo_reserva)) {
      return res.status(400).json({ 
        error: 'tipo_reserva debe ser: vuelo, alojamiento o vehiculo' 
      });
    }

    const result = await pool.query(`
      INSERT INTO reservas (
        user_id, tipo_reserva, producto_id, nombre_producto, ciudad, pais,
        direccion, latitud, longitud, osm_type, osm_id,
        fecha_inicio, fecha_fin,
        hora_salida, hora_llegada,
        aerolinea, codigo_vuelo, aeropuerto_origen, aeropuerto_destino, clase_cabina,
        huespedes,
        tipo_vehiculo, marca, modelo,
        total_price, moneda, estado
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13,
        $14, $15,
        $16, $17, $18, $19, $20,
        $21,
        $22, $23, $24,
        $25, $26, $27
      ) RETURNING *
    `, [
      user_id, tipo_reserva, producto_id, nombre_producto, ciudad, pais,
      direccion, latitud, longitud, osm_type, osm_id,
      fecha_inicio, fecha_fin,
      hora_salida, hora_llegada,
      aerolinea, codigo_vuelo, aeropuerto_origen, aeropuerto_destino, clase_cabina,
      huespedes,
      tipo_vehiculo, marca, modelo,
      total_price, moneda || 'USD', estado || 'confirmada'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando reserva:', error);
    res.status(500).json({ error: 'Error creando reserva', details: error.message });
  }
});

// Actualizar estado de reserva
app.patch('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !['pendiente', 'confirmada', 'cancelada', 'completada'].includes(estado)) {
      return res.status(400).json({ 
        error: 'estado debe ser: pendiente, confirmada, cancelada o completada' 
      });
    }

    const result = await pool.query(
      'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando reserva:', error);
    res.status(500).json({ error: 'Error actualizando reserva' });
  }
});

// Eliminar reserva (cancelar permanentemente)
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM reservas WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json({ message: 'Reserva eliminada', reservation: result.rows[0] });
  } catch (error) {
    console.error('Error eliminando reserva:', error);
    res.status(500).json({ error: 'Error eliminando reserva' });
  }
});

// Estadísticas de reservas por usuario
app.get('/api/reservations/stats/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        tipo_reserva,
        COUNT(*) as total,
        SUM(total_price) as total_gastado
      FROM reservas 
      WHERE user_id = $1
      GROUP BY tipo_reserva
    `, [user_id]);

    res.json({ stats: result.rows });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// ====================== START SERVER ======================
app.listen(PORT, () => {
  console.log(`🎫 Servidor de Reservas escuchando en http://localhost:${PORT}`);
  console.log(`📍 API disponible en http://localhost:${PORT}/api/reservations`);
});
