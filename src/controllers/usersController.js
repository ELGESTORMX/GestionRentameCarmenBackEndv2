const Usuario = require('../models/usuario');

// Listar todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const allowedLimits = [10,20,30,40,50];
    let limit = parseInt(req.query.limit) || 10;
    if (!allowedLimits.includes(limit)) limit = 10;
    const skip = (page - 1) * limit;

    const filtros = {};
    if (req.query.q) filtros.usuario = { $regex: req.query.q, $options: 'i' }; // Búsqueda por usuario, no sensible a mayúsculas

    const total = await Usuario.countDocuments(filtros);
    const users = await Usuario.find(filtros).skip(skip).limit(limit).lean();
    const totalPages = Math.ceil(total / limit);
    res.json({ data: users, meta: { total, page, limit, totalPages } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await Usuario.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un usuario (requiere usuario y contraseña)
exports.createUser = async (req, res) => {
  try {
    const { usuario, contraseña, rol } = req.body;
    if (!usuario || !contraseña) return res.status(400).json({ error: 'usuario y contraseña requeridos' });
    const user = new Usuario({ usuario, contraseña, rol });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un usuario (por ID)
exports.updateUser = async (req, res) => {
  try {
    const user = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar un usuario (por ID)
exports.deleteUser = async (req, res) => {
  try {
    const user = await Usuario.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
