const mongoose = require('mongoose');

const EquipoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, default: '' },
  subcategoria: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  precio: { type: Number, required: true, min: 0 },
  tipo: { type: String, required: true }, // clasificación: tipo
  uso: { type: String, required: true }, // clasificación: uso
  tamano: { type: String, default: '' }, // clasificación: tamaño
  peso: { type: Number, min: 0 }, // clasificación: peso (kg)
  estado: { type: String, default: 'activo' },
  estado_fisico: {
    entrada: { type: Boolean, default: false },
    mantenimiento: { type: Boolean, default: false },
    salida_renta: { type: Boolean, default: false },
    reparacion: { type: Boolean, default: false },
    venta: { type: Boolean, default: false },
    desecho: { type: Boolean, default: false }
  },
  disponibilidad: {
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, default: '' },
    qr: { type: String, default: '' }
  },
  fecha_adquisicion: Date,
  vida_util_meses: { type: Number, min: 0 },
  ubicacion: { type: String, default: '' },
  imagen: { type: String, default: '' },
  creado_en: { type: Date, default: Date.now }
});

// Índices útiles
EquipoSchema.index({ nombre: 'text', descripcion: 'text', categoria: 'text', tipo: 'text', uso: 'text' });

module.exports = mongoose.models.Equipo || mongoose.model('Equipo', EquipoSchema);
