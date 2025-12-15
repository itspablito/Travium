// controllers/reservationController.js
import { pool } from "../db.js";

export const createReservation = async (req, res) => {
  const userId = req.user?.id;
  const { hotelName, osmType, osmId, city, country, checkIn, checkOut, guests, basePrice } = req.body;

  if (!userId) return res.status(401).json({ error: "Usuario no autenticado" });
  if (!hotelName || !osmType || !osmId || !checkIn || !checkOut || !guests || !basePrice)
    return res.status(400).json({ error: "Faltan datos" });

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * guests * basePrice;

  try {
    const result = await pool.query(
      `INSERT INTO reservations 
        (user_id, hotel_name, osm_type, osm_id, city, country, check_in, check_out, guests, total_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [userId, hotelName, osmType, osmId, city, country, checkIn, checkOut, guests, totalPrice]
    );

    res.json({ reservation: result.rows[0] });
  } catch (err) {
    console.error("💥 Error creando reserva:", err);
    res.status(500).json({ error: "Error interno al crear reserva" });
  }
};
