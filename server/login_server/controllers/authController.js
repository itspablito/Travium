import { pool } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  console.log("💡 Registro recibido:", req.body); // imprime los datos que llegan del frontend

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log("❌ Datos incompletos:", req.body);
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    // Hasheamos la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Contraseña hasheada:", hashedPassword);

    // Query para insertar usuario
    const queryText = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, role
    `;
    console.log("📦 Query a ejecutar:", queryText, [username, email, hashedPassword]);

    const result = await pool.query(queryText, [username, email, hashedPassword]);
    console.log("✅ Registro exitoso:", result.rows[0]);

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error("💥 Error al registrar:", err);
    res.status(400).json({ error: 'Usuario ya existe o datos inválidos' });
  }
};

export const login = async (req, res) => {
  console.log("💡 Login recibido:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    console.log("❌ Datos incompletos para login:", req.body);
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    console.log("🔍 Buscando usuario con email:", email);
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);

    if (result.rows.length === 0) {
      console.log("❌ Usuario no encontrado:", email);
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    console.log("👤 Usuario encontrado:", user);

    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log("🔑 Contraseña válida:", validPassword);

    if (!validPassword) {
      console.log("❌ Contraseña incorrecta para usuario:", email);
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log("🛡 Token generado:", token);

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error("💥 Error en login:", err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateProfile = async (req, res) => {
  console.log("💡 Actualización de perfil recibida:", req.body); // datos enviados
  console.log("👤 UserID recibido desde middleware:", req.user?.id); // ID del usuario


  const { username, email } = req.body;
  const userId = req.user.id; // Assuming middleware sets req.user

  if (!username || !email) {
    console.log("❌ Datos incompletos para actualización:", req.body);
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    console.log("🔄 Actualizando usuario ID:", userId);
    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, role',
      [username, email, userId]
    );
    if (result.rows.length === 0) {
      console.log("❌ Usuario no encontrado para actualización:", userId);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.log("✅ Perfil actualizado:", result.rows[0]);
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("💥 Error al actualizar perfil:", err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
