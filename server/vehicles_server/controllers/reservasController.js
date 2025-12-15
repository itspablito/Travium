import { pool } from "../db.js";

// Crear reserva (solo usuario logueado)
export const createReserva = async (req, res) => {
  console.log("🔑 createReserva - Request body:", req.body);
  console.log("👤 Usuario logueado:", req.user);

  const userId = req.user?.id;
  if (!userId) {
    console.warn("⚠️ Usuario no logueado");
    return res.status(401).json({ error: "Usuario no logueado" });
  }

  const { vehiculo_id, fecha_inicio, duracion, modo, pasajeros, extras, total } = req.body;

  console.log("🚗 Datos de reserva:", { vehiculo_id, fecha_inicio, duracion, modo, pasajeros, extras, total });

  try {
    const result = await pool.query(
      `INSERT INTO reservas_vehiculos 
       (usuario_id, vehiculo_id, fecha_inicio, duracion, modo, pasajeros, extras, total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [userId, vehiculo_id, fecha_inicio, duracion, modo, pasajeros, JSON.stringify(extras), total]
    );

    console.log("✅ Reserva creada:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creando reserva:", err);
    res.status(500).json({ error: "Error creando reserva" });
  }
};

// Listar reservas del usuario
export const getUserReservas = async (req, res) => {
  console.log("🔎 getUserReservas - Usuario logueado:", req.user);

  const userId = req.user?.id;
  if (!userId) {
    console.warn("⚠️ Usuario no logueado");
    return res.status(401).json({ error: "Usuario no logueado" });
  }

  try {
    const result = await pool.query(
      `SELECT r.*, v.tipo, v.icon FROM reservas_vehiculos r
       JOIN vehiculos v ON v.id = r.vehiculo_id
       WHERE r.usuario_id=$1
       ORDER BY r.fecha_inicio DESC`,
      [userId]
    );

    console.log(`📦 Reservas encontradas para usuario ${userId}:`, result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error listando reservas:", err);
    res.status(500).json({ error: "Error listando reservas" });
  }
};
