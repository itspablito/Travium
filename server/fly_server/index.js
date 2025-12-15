import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import crypto from "crypto";

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a Neon
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

/* ======================================================
   1️⃣ VERIFICAR CONEXIÓN A LA BASE DE DATOS
====================================================== */
async function initDB() {
  try {
    // Verificar estructura de la tabla vuelos existente
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vuelos'
      ORDER BY ordinal_position;
    `);
    
    console.log("✅ Conectado a tabla 'vuelos' existente");
    console.log("📋 Columnas disponibles:", result.rows.map(r => r.column_name).join(", "));
  } catch (err) {
    console.error("⚠️ Error verificando tabla vuelos:", err.message);
    console.error(err.stack); // Agrega un stack trace para más detalles
  }
}

initDB()
  .then(() => console.log("✅ Base de datos lista"))
  .catch((err) => {
    console.error("❌ Error conectando a la base de datos", err);
  });

/* ======================================================
   2️⃣ ENDPOINT: LISTAR TODOS LOS VUELOS
====================================================== */
app.get("/api/flights", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM vuelos ORDER BY id`
    );

    res.json({
      flights: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error listando vuelos" });
  }
});

/* ======================================================
   3️⃣ ENDPOINT: BUSCAR VUELOS POR ORIGEN Y DESTINO
====================================================== */
app.get("/api/flights/search", async (req, res) => {
  const { origin, destination } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({ error: "origin y destination requeridos" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM vuelos 
       WHERE UPPER(aeropuerto_origen) = UPPER($1) 
         AND UPPER(aeropuerto_destino) = UPPER($2)
       ORDER BY hora_salida`,
      [origin, destination]
    );

    res.json({
      flights: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error buscando vuelos" });
  }
});

/* ======================================================
   4️⃣ ENDPOINT: OBTENER VUELO POR ID
====================================================== */
app.get("/api/flights/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM vuelos WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vuelo no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo vuelo" });
  }
});

/* ======================================================
   5️⃣ ENDPOINT: AGREGAR NUEVO VUELO
====================================================== */
app.post("/api/flights", async (req, res) => {
  const flightData = req.body;

  try {
    // Obtener las columnas de la tabla vuelos
    const columns = Object.keys(flightData).filter(key => key !== 'id');
    const values = columns.map(col => flightData[col]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO vuelos (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Vuelo agregado exitosamente",
      flight: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error agregando vuelo: " + err.message });
  }
});

/* ======================================================
   6️⃣ ENDPOINT: ACTUALIZAR VUELO
====================================================== */
app.put("/api/flights/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'id') {
        updates.push(`${key} = $${paramCount++}`);
        values.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: "No hay datos para actualizar" });
    }

    values.push(id);
    const query = `
      UPDATE vuelos 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vuelo no encontrado" });
    }

    res.json({
      message: "Vuelo actualizado exitosamente",
      flight: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando vuelo: " + err.message });
  }
});

/* ======================================================
   7️⃣ ENDPOINT: ELIMINAR VUELO
====================================================== */
app.delete("/api/flights/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM vuelos WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vuelo no encontrado" });
    }

    res.json({ 
      message: "Vuelo eliminado exitosamente",
      id: result.rows[0].id 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error eliminando vuelo" });
  }
});

/* ======================================================
   9️⃣ ENDPOINT: HEALTH CHECK
====================================================== */
app.get("/health", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: r.rows[0] });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

/* ======================================================
   🚀 START SERVER
====================================================== */
app.listen(PORT, () => {
  console.log(`✅ Backend de vuelos corriendo en http://localhost:${PORT}`);
});
