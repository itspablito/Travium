import { pool } from "../db.js";

// Listar todos los vehículos
export const getVehicles = async (req, res) => {
  try {
    console.log("🔎 Consultando todos los vehículos...");
    const result = await pool.query("SELECT * FROM vehiculos ORDER BY id");
    console.log("✅ Vehículos encontrados:", result.rows.length);
    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error listando vehículos:", err);
    res.status(500).json({ error: "Error listando vehículos" });
  }
};

// Obtener vehículo por ID
export const getVehicleById = async (req, res) => {
  const { id } = req.params;
  console.log("🔎 Consultando vehículo ID:", id);
  try {
    const result = await pool.query("SELECT * FROM vehiculos WHERE id=$1", [id]);
    if (!result.rows.length) {
      console.log("⚠️ Vehículo no encontrado");
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    console.log("✅ Vehículo encontrado:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error obteniendo vehículo:", err);
    res.status(500).json({ error: "Error obteniendo vehículo" });
  }
};

// Crear vehículo
export const createVehicle = async (req, res) => {
  console.log("✏️ Creando vehículo:", req.body);
  const { tipo, icon, precio_hora, precio_dia, capacidad, combustible, transmision, rating, recomendado } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO vehiculos (tipo, icon, precio_hora, precio_dia, capacidad, combustible, transmision, rating, recomendado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [tipo, icon, precio_hora, precio_dia, capacidad, combustible, transmision, rating, recomendado]
    );
    console.log("✅ Vehículo creado:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creando vehículo:", err);
    res.status(500).json({ error: "Error creando vehículo" });
  }
};

// Actualizar vehículo
export const updateVehicle = async (req, res) => {
  const { id } = req.params;
  console.log("📝 Actualizando vehículo ID:", id, "con datos:", req.body);
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);

  if (!fields.length) return res.status(400).json({ error: "No hay campos para actualizar" });

  const setString = fields.map((f, i) => `${f}=$${i + 1}`).join(", ");

  try {
    const result = await pool.query(
      `UPDATE vehiculos SET ${setString} WHERE id=$${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    if (!result.rows.length) {
      console.log("⚠️ Vehículo no encontrado para actualizar");
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    console.log("✅ Vehículo actualizado:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error actualizando vehículo:", err);
    res.status(500).json({ error: "Error actualizando vehículo" });
  }
};

// Eliminar vehículo
export const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  console.log("🗑 Eliminando vehículo ID:", id);
  try {
    const result = await pool.query("DELETE FROM vehiculos WHERE id=$1 RETURNING id", [id]);
    if (!result.rows.length) {
      console.log("⚠️ Vehículo no encontrado para eliminar");
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    console.log("✅ Vehículo eliminado:", result.rows[0].id);
    res.json({ message: "Vehículo eliminado", id: result.rows[0].id });
  } catch (err) {
    console.error("❌ Error eliminando vehículo:", err);
    res.status(500).json({ error: "Error eliminando vehículo" });
  }
};
