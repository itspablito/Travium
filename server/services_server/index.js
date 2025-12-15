import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import crypto from "crypto";

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3003;

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
    // Verificar estructura de la tabla servicios existente
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'servicios'
      ORDER BY ordinal_position;
    `);
    
    console.log("✅ Conectado a tabla 'servicios' existente");
    console.log("📋 Columnas disponibles:", result.rows.map(r => r.column_name).join(", "));
  } catch (err) {
    console.error("⚠️  Error verificando tabla servicios:", err.message);
  }
}

initDB()
  .then(() => console.log("✅ Base de datos lista"))
  .catch((err) => {
    console.error("❌ Error conectando a la base de datos", err);
  });

/* ======================================================
   2️⃣ ENDPOINT: LISTAR TODOS LOS SERVICIOS
====================================================== */
app.get("/api/services", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM servicios ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Error al obtener servicios" });
  }
});

/* ======================================================
   3️⃣ ENDPOINT: BUSCAR SERVICIOS CON FILTROS
====================================================== */
app.get("/api/services/search", async (req, res) => {
  try {
    const { ciudad, categoria } = req.query;
    let query = "SELECT * FROM servicios WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (ciudad) {
      query += ` AND ciudad = $${paramCount}`;
      params.push(ciudad);
      paramCount++;
    }

    if (categoria) {
      query += ` AND categoria = $${paramCount}`;
      params.push(categoria);
      paramCount++;
    }

    query += " ORDER BY rating DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error searching services:", err);
    res.status(500).json({ error: "Error al buscar servicios" });
  }
});

/* ======================================================
   4️⃣ ENDPOINT: OBTENER UN SERVICIO POR ID
====================================================== */
app.get("/api/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM servicios WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching service:", err);
    res.status(500).json({ error: "Error al obtener servicio" });
  }
});

/* ======================================================
   5️⃣ ENDPOINT: CREAR UN NUEVO SERVICIO
====================================================== */
app.post("/api/services", async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      ciudad,
      pais,
      direccion,
      latitud,
      longitud,
      telefono,
      rating,
      numero_reseñas,
      nivel_precios,
      tipo_comida,
      abierto_24h,
      hora_apertura,
      hora_cierre,
      imagenes,
      descripcion
    } = req.body;

    const result = await pool.query(
      `INSERT INTO servicios (
        nombre, categoria, ciudad, pais, direccion, latitud, longitud, 
        telefono, rating, numero_reseñas, nivel_precios, tipo_comida, 
        abierto_24h, hora_apertura, hora_cierre, imagenes, descripcion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [nombre, categoria, ciudad, pais, direccion, latitud, longitud,
       telefono, rating, numero_reseñas, nivel_precios, tipo_comida,
       abierto_24h, hora_apertura, hora_cierre, imagenes, descripcion]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating service:", err);
    res.status(500).json({ error: "Error al crear servicio" });
  }
});

/* ======================================================
   6️⃣ ENDPOINT: ACTUALIZAR UN SERVICIO
====================================================== */
app.put("/api/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      categoria,
      ciudad,
      pais,
      direccion,
      latitud,
      longitud,
      telefono,
      rating,
      numero_reseñas,
      nivel_precios,
      tipo_comida,
      abierto_24h,
      hora_apertura,
      hora_cierre,
      imagenes,
      descripcion
    } = req.body;

    const result = await pool.query(
      `UPDATE servicios SET
        nombre = $1,
        categoria = $2,
        ciudad = $3,
        pais = $4,
        direccion = $5,
        latitud = $6,
        longitud = $7,
        telefono = $8,
        rating = $9,
        numero_reseñas = $10,
        nivel_precios = $11,
        tipo_comida = $12,
        abierto_24h = $13,
        hora_apertura = $14,
        hora_cierre = $15,
        imagenes = $16,
        descripcion = $17
      WHERE id = $18
      RETURNING *`,
      [nombre, categoria, ciudad, pais, direccion, latitud, longitud,
       telefono, rating, numero_reseñas, nivel_precios, tipo_comida,
       abierto_24h, hora_apertura, hora_cierre, imagenes, descripcion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ error: "Error al actualizar servicio" });
  }
});

/* ======================================================
   7️⃣ ENDPOINT: ELIMINAR UN SERVICIO
====================================================== */
app.delete("/api/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM servicios WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    res.json({ message: "Servicio eliminado exitosamente", service: result.rows[0] });
  } catch (err) {
    console.error("Error deleting service:", err);
    res.status(500).json({ error: "Error al eliminar servicio" });
  }
});

/* ======================================================
   8️⃣ HEALTH CHECK
====================================================== */
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Services API está funcionando correctamente" });
});

/* ======================================================
   9️⃣ INICIAR SERVIDOR
====================================================== */
app.listen(PORT, () => {
  console.log(`✈️  Servidor de Servicios escuchando en http://localhost:${PORT}`);
  console.log(`📍 API disponible en http://localhost:${PORT}/api/services`);
});
