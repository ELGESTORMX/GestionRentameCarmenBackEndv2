const mongoose = require('mongoose');

const CategoriasSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  creado_en: { type: Date, default: Date.now }
});
module.exports = mongoose.models.Categorias || mongoose.model('Categorias', CategoriasSchema);
