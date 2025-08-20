const mongoose = require('mongoose');

const EquipoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: String,
  subcategoria: String,
  descripcion: String,
  precio: Number,
  estado: { type: String, default: 'activo' },
  fecha_adquisicion: Date,
  vida_util_meses: Number,
  ubicacion: String,
  imagen: String,
  creado_en: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Equipo || mongoose.model('Equipo', EquipoSchema);
