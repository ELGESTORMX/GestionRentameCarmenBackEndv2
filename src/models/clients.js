const mongoose = require('mongoose');

const ClientsSchema = new mongoose.Schema({
  nombre: String,
  telefono: String,
  direccion: String,
  correo: String,
  tipo: String,
  foto: String,
  foto_ine_delantero: String,
  foto_ine_trasero: String,
  creado_en: { type: Date, default: Date.now }
});
module.exports = mongoose.models.Clients || mongoose.model('Clients', ClientsSchema);
