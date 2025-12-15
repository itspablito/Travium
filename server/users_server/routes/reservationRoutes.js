const express = require('express');
const router = express.Router();
const { getReservationsByUser } = require('../controllers/reservationController');

// GET /api/reservations/:userId
router.get('/:userId', getReservationsByUser);

module.exports = router;
