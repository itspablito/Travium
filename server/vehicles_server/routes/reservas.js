import express from "express";
import { createReserva, getUserReservas } from "../controllers/reservasController.js";
import { authenticateToken } from "../../login_server/controllers/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken); // todas requieren login
router.post("/", createReserva);
router.get("/", getUserReservas);

export default router;
