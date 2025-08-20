require('dotenv').config();
// ...middlewares...
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Ruta general para /api
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API GestionRentameCarmen Backend v2',
    endpoints: ['/api/auth', '/api/admins', '/api/equipos', '/v1']
  });
});
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const equiposRoutes = require('./routes/equipos');
const legacyRoutes = require('./routes/legacy');
// ...línea eliminada: supabaseClient ya no se usa en backend...

const app = express();
const PORT = process.env.PORT || 8085;
const MONGO_URI = process.env.LINK_DB;

// Conexión Mongo
if (MONGO_URI) {
  mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error al conectar MongoDB:', err));
} else {
  console.warn('MONGO_URI no configurada. Usando datos mock en memoria.');
}

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/admins', authRoutes); // Compatibilidad: algunas vistas/clientes usan /api/admins/*
app.use('/api/equipos', equiposRoutes);
app.use('/v1', legacyRoutes);

module.exports.start = function() {
  app.listen(PORT, () => console.log(`BackEnd escuchando en http://localhost:${PORT}`));
};
