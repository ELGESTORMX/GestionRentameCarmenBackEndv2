const mongoose = require('mongoose');

const NotasRemisionSchema = new mongoose.Schema({
  folio: Number,
  cliente: String,
  items: Array,
  total: Number,
  creado_en: { type: Date, default: Date.now }
});
module.exports = mongoose.models.NotasRemision || mongoose.model('NotasRemision', NotasRemisionSchema);
