import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import vehiclesRoutes from "./routes/vehicles.js";
import reservasRoutes from "./routes/reservas.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/reservas", reservasRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", server: "vehicles_server" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Vehicles server corriendo en http://localhost:${PORT}`);
});
