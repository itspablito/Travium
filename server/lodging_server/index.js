// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import jwt from "jsonwebtoken";

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3001;

// ====================== MIDDLEWARES ======================
app.use(cors());
app.use(express.json());

// ====================== DB ======================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ====================== AUTH MIDDLEWARE ======================
// Usa JWT que viene del login server
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    console.warn("❌ Token no enviado");
    return res.status(401).json({ error: "Token requerido" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.warn("❌ Token inválido", err.message);
      return res.status(403).json({ error: "Token inválido" });
    }
    req.user = user; // Contiene id, username y role
    console.log("✅ Usuario autenticado:", user);
    next();
  });
};

// ====================== HOTEL PRICES ======================
app.get("/api/hotels/price", async (req, res) => {
  const { osmType, osmId } = req.query;
  if (!osmType || !osmId) {
    console.warn("❌ osmType u osmId no enviados");
    return res.status(400).json({ error: "osmType y osmId requeridos" });
  }

  try {
    console.log(`🔍 Buscando precio para ${osmType}:${osmId}`);
    const result = await pool.query(
      "SELECT base_price_cop FROM hotel_prices WHERE osm_type=$1 AND osm_id=$2",
      [osmType, osmId]
    );
    if (result.rows.length === 0) {
      console.warn("⚠️ Precio no encontrado");
      return res.status(404).json({ error: "Precio no encontrado" });
    }
    console.log("✅ Precio encontrado:", result.rows[0].base_price_cop);
    res.json({ basePrice: result.rows[0].base_price_cop });
  } catch (err) {
    console.error("💥 Error obteniendo precio:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ====================== RESERVATIONS ======================
app.post("/api/reservations", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { hotelName, osmType, osmId, city, country, checkIn, checkOut, guests, basePrice } = req.body;

  if (!hotelName || !osmType || !osmId || !checkIn || !checkOut || !guests || !basePrice) {
    console.warn("❌ Datos incompletos para crear reserva", req.body);
    return res.status(400).json({ error: "Faltan datos" });
  }

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * guests * basePrice;

  try {
    console.log(`🛎 Creando reserva para usuario ${userId} en hotel ${hotelName}`);
    const result = await pool.query(
      `INSERT INTO reservations
        (user_id, hotel_name, osm_type, osm_id, city, country, check_in, check_out, guests, total_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [userId, hotelName, osmType, osmId, city, country, checkIn, checkOut, guests, totalPrice]
    );
    console.log("✅ Reserva creada:", result.rows[0]);
    res.json({ reservation: result.rows[0] });
  } catch (err) {
    console.error("💥 Error creando reserva:", err);
    res.status(500).json({ error: "Error interno al crear reserva" });
  }
});

app.get("/api/reservations", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    console.log(`📄 Obteniendo reservas para usuario ${userId}`);
    const result = await pool.query(
      "SELECT * FROM reservations WHERE user_id=$1 ORDER BY created_at DESC",
      [userId]
    );
    console.log(`✅ ${result.rows.length} reservas encontradas`);
    res.json({ reservations: result.rows });
  } catch (err) {
    console.error("💥 Error obteniendo reservas:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ====================== HEALTHCHECK ======================
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// ====================== START SERVER ======================
app.listen(PORT, () => console.log(`✅ Hotels backend running on http://localhost:${PORT}`));
