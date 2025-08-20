const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  usuario: { type: String, unique: true, required: true },
  contraseñaHash: { type: String, required: true },
  rol: { type: String, default: 'user' },
  nombre: String,
  folios: Array
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
