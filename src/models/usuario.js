const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  usuario: { type: String, unique: true, required: true },
  contraseña: { type: String, required: true },
  nombre: String,
  rol: { type: Number, default: 2 },
  online: Boolean,
  foto: String,
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);
