const User = require('../models/user');

// Listar todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario (username) no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un usuario (requiere username y password)
exports.createUser = async (req, res) => {
  try {
    const { username, password, rol } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username y password requeridos' });
    const user = new User({ username, password, rol });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un usuario (por ID)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'Usuario (username) no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar un usuario (por ID)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario (username) no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
