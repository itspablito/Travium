// routes/reservationRoutes.js
import express from "express";
import { createReservation } from "../controllers/reservationController.js";

const router = express.Router();

router.post("/", authenticateToken, createReservation);

export default router;
