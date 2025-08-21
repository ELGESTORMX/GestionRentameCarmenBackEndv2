const mongoose = require('mongoose');

const RentasSchema = new mongoose.Schema({
  folio: Number,
  nombre: String,
  telefono: String,
  direccion: String,
  fecha_renta: String,
  hora_renta: String,
  fecha_vencimiento: String,
  usuario_rentador: String,
  productos: Array,
  total_renta: Number, // Cambiado de Mixed a Number
  fotos_estado_inicial: [String],
  IVA: Boolean,
  creado_en: { type: Date, default: Date.now }
});
module.exports = mongoose.models.Rentas || mongoose.model('Rentas', RentasSchema);
