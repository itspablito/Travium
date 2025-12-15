import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import crypto from "crypto";

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/* ======================================================
   1️⃣ CREAR TABLA AUTOMÁTICAMENTE (si no existe)
====================================================== */
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotel_prices (
      id SERIAL PRIMARY KEY,
      osm_type TEXT NOT NULL,
      osm_id BIGINT NOT NULL,
      hotel_name TEXT,
      base_price_cop INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (osm_type, osm_id)
    );
  `);
}

initDB()
  .then(() => console.log("✅ Tabla hotel_prices lista"))
  .catch((err) => {
    console.error("❌ Error creando tabla", err);
    process.exit(1);
  });

/* ======================================================
   2️⃣ FUNCIÓN DE PRECIO DETERMINÍSTICO (OPCIÓN A)
====================================================== */
function deterministicPrice(osmType, osmId) {
  // hash estable
  const hash = crypto
    .createHash("sha256")
    .update(`${osmType}-${osmId}`)
    .digest("hex");

  // rango COP: 90.000 – 340.000
  const min = 90000;
  const max = 340000;

  const num = parseInt(hash.slice(0, 8), 16);
  return min + (num % (max - min));
}

/* ======================================================
   3️⃣ ENDPOINT: HEALTH CHECK
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
   4️⃣ ENDPOINT: ASEGURAR PRECIO DE HOTEL
   - Si existe → devuelve el mismo
   - Si no existe → lo crea (determinístico)
====================================================== */
app.post("/api/hotels/ensure-price", async (req, res) => {
  const { osmType, osmId, name } = req.body;

  if (!osmType || !osmId) {
    return res.status(400).json({ error: "osmType y osmId requeridos" });
  }

  try {
    // ¿Ya existe?
    const existing = await pool.query(
      `SELECT base_price_cop
       FROM hotel_prices
       WHERE osm_type = $1 AND osm_id = $2`,
      [osmType, osmId]
    );

    if (existing.rows.length > 0) {
      return res.json({
        basePrice: existing.rows[0].base_price_cop,
        created: false,
      });
    }

    // Crear precio nuevo
    const price = deterministicPrice(osmType, osmId);

    await pool.query(
      `INSERT INTO hotel_prices (osm_type, osm_id, hotel_name, base_price_cop)
       VALUES ($1, $2, $3, $4)`,
      [osmType, osmId, name || null, price]
    );

    res.json({
      basePrice: price,
      created: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error asegurando precio" });
  }
});

/* ======================================================
   5️⃣ ENDPOINT: OBTENER PRECIO (solo lectura)
====================================================== */
app.get("/api/hotels/price", async (req, res) => {
  const { osmType, osmId } = req.query;

  if (!osmType || !osmId) {
    return res.status(400).json({ error: "osmType y osmId requeridos" });
  }

  try {
    const r = await pool.query(
      `SELECT base_price_cop
       FROM hotel_prices
       WHERE osm_type = $1 AND osm_id = $2`,
      [osmType, osmId]
    );

    if (r.rows.length === 0) {
      return res.status(404).json({ error: "Precio no encontrado" });
    }

    res.json({ basePrice: r.rows[0].base_price_cop });
  } catch {
    res.status(500).json({ error: "Error consultando precio" });
  }
});

/* ======================================================
   6️⃣ START SERVER
====================================================== */
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
