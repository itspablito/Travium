import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3006;

// ====================== MIDDLEWARES ======================
app.use(cors());
app.use(express.json());

// ====================== DB ======================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en cliente del pool:', err);
});

// Verificar conexión y estructura de la tabla
async function initDB() {
  let retries = 3;
  while (retries > 0) {
    try {
      const result = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'facturas'
        ORDER BY ordinal_position
      `);
      
      console.log('✅ Conectado a tabla \'facturas\' existente');
      console.log('📋 Columnas disponibles:', result.rows.map(r => r.column_name).join(', '));
      console.log('✅ Base de datos lista');
      break;
    } catch (error) {
      retries--;
      console.error(`❌ Error verificando tabla facturas (${3 - retries}/3):`, error.message);
      if (retries === 0) {
        console.error('❌ No se pudo conectar a la base de datos después de 3 intentos');
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
}

initDB();

// Generar número de factura único
function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
}

// ====================== ENDPOINTS ======================

// Obtener todas las facturas (o filtrar por user_id)
app.get('/api/invoices', async (req, res) => {
  try {
    const { user_id, estado } = req.query;
    
    let query = 'SELECT * FROM facturas WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (user_id) {
      query += ` AND user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    if (estado) {
      query += ` AND estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ invoices: result.rows });
  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    res.status(500).json({ error: 'Error obteniendo facturas' });
  }
});

// Obtener una factura por ID
app.get('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM facturas WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo factura:', error);
    res.status(500).json({ error: 'Error obteniendo factura' });
  }
});

// Obtener factura por reserva_id
app.get('/api/invoices/reservation/:reserva_id', async (req, res) => {
  try {
    const { reserva_id } = req.params;
    const result = await pool.query('SELECT * FROM facturas WHERE reserva_id = $1', [reserva_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada para esta reserva' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo factura:', error);
    res.status(500).json({ error: 'Error obteniendo factura' });
  }
});

// Crear nueva factura
app.post('/api/invoices', async (req, res) => {
  try {
    const {
      reserva_id,
      user_id,
      tipo_item,
      descripcion,
      fecha_inicio,
      fecha_fin,
      cantidad,
      subtotal,
      impuestos,
      total,
      moneda,
      metodo_pago,
      estado,
      nombre_cliente,
      identificacion_fiscal,
      direccion_fiscal
    } = req.body;

    // Validaciones básicas
    if (!reserva_id || !user_id || !tipo_item || !descripcion || !fecha_inicio || !subtotal || !total || !nombre_cliente) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: reserva_id, user_id, tipo_item, descripcion, fecha_inicio, subtotal, total, nombre_cliente' 
      });
    }

    if (!['Vuelo', 'Alojamiento', 'Vehículo'].includes(tipo_item)) {
      return res.status(400).json({ 
        error: 'tipo_item debe ser: Vuelo, Alojamiento o Vehículo' 
      });
    }

    // Generar número de factura único
    let numero_factura = generateInvoiceNumber();
    
    // Verificar que sea único (en caso de colisión)
    let attempts = 0;
    while (attempts < 5) {
      const existing = await pool.query('SELECT id FROM facturas WHERE numero_factura = $1', [numero_factura]);
      if (existing.rows.length === 0) break;
      numero_factura = generateInvoiceNumber();
      attempts++;
    }

    const result = await pool.query(`
      INSERT INTO facturas (
        reserva_id, user_id, numero_factura,
        tipo_item, descripcion,
        fecha_inicio, fecha_fin, cantidad,
        subtotal, impuestos, total, moneda,
        metodo_pago, estado,
        nombre_cliente, identificacion_fiscal, direccion_fiscal
      ) VALUES (
        $1, $2, $3,
        $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14,
        $15, $16, $17
      ) RETURNING *
    `, [
      reserva_id, user_id, numero_factura,
      tipo_item, descripcion,
      fecha_inicio, fecha_fin, cantidad || 1,
      subtotal, impuestos || 0, total, moneda || 'USD',
      metodo_pago, estado || 'pagada',
      nombre_cliente, identificacion_fiscal, direccion_fiscal
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando factura:', error);
    res.status(500).json({ error: 'Error creando factura', details: error.message });
  }
});

// Actualizar estado de factura
app.patch('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !['pagada', 'anulada', 'reembolsada'].includes(estado)) {
      return res.status(400).json({ 
        error: 'estado debe ser: pagada, anulada o reembolsada' 
      });
    }

    const result = await pool.query(
      'UPDATE facturas SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando factura:', error);
    res.status(500).json({ error: 'Error actualizando factura' });
  }
});

// Eliminar factura
app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM facturas WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json({ message: 'Factura eliminada', invoice: result.rows[0] });
  } catch (error) {
    console.error('Error eliminando factura:', error);
    res.status(500).json({ error: 'Error eliminando factura' });
  }
});

// Estadísticas de facturas por usuario
app.get('/api/invoices/stats/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        tipo_item,
        COUNT(*) as total_facturas,
        SUM(total) as total_gastado,
        estado
      FROM facturas 
      WHERE user_id = $1
      GROUP BY tipo_item, estado
      ORDER BY tipo_item
    `, [user_id]);

    res.json({ stats: result.rows });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// ====================== START SERVER ======================
app.listen(PORT, () => {
  console.log(`🧾 Servidor de Facturas escuchando en http://localhost:${PORT}`);
  console.log(`📍 API disponible en http://localhost:${PORT}/api/invoices`);
});
