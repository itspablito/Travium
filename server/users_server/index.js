require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/reservations', reservationRoutes);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
