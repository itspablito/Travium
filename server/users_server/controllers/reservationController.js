const pool = require('../db');

// Obtener reservas por usuario
const getReservationsByUser = async (req, res) => {
  const userId = req.params.userId;
  console.log("Obteniendo reservas para usuario:", userId);

  try {
    // Próximos viajes
    const upcomingQuery = `
      SELECT *
      FROM reservas_vehiculos
      WHERE usuario_id = $1
        AND fecha_inicio >= NOW()
      ORDER BY fecha_inicio ASC
    `;
    const upcoming = await pool.query(upcomingQuery, [userId]);
    console.log("Próximos viajes:", upcoming.rows);

    // Viajes realizados
    const completedQuery = `
      SELECT *
      FROM reservas_vehiculos
      WHERE usuario_id = $1
        AND fecha_inicio < NOW()
      ORDER BY fecha_inicio DESC
    `;
    const completed = await pool.query(completedQuery, [userId]);
    console.log("Viajes realizados:", completed.rows);

    res.json({
      upcoming: upcoming.rows,
      completed: completed.rows
    });
  } catch (err) {
    console.error("ERROR SERVER:", err);
    res.status(500).json({ error: 'Error obteniendo reservas' });
  }
};

module.exports = {
  getReservationsByUser
};
