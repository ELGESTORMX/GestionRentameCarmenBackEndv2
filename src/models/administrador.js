const mongoose = require('mongoose');

const AdministradorSchema = new mongoose.Schema({
  usuario: { type: String, unique: true, required: true },
  contraseña: { type: String, required: true },
  nombre: String,
  rol: { type: Number, default: 1 },
  online: Boolean,
  foto: String,
  createdAt: Date,
  updatedAt: Date
}, { collection: 'administradores' });

module.exports = mongoose.models.Administrador || mongoose.model('Administrador', AdministradorSchema);
