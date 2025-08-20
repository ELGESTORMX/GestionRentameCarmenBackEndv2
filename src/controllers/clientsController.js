const Clients = require('../models/clients');

// Listar todos los clientes
exports.getAllClients = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const allowedLimits = [10,20,30,40,50];
    let limit = parseInt(req.query.limit) || 10;
    if (!allowedLimits.includes(limit)) limit = 10;
    const skip = (page - 1) * limit;

    const filtros = {};
    if (req.query.q) filtros.$text = { $search: req.query.q };

    const total = await Clients.countDocuments(filtros);
    const clients = await Clients.find(filtros).skip(skip).limit(limit).lean();
    const totalPages = Math.ceil(total / limit);
    res.json({ data: clients, meta: { total, page, limit, totalPages } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un cliente por ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Clients.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un cliente
exports.createClient = async (req, res) => {
  try {
    const client = new Clients(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un cliente
exports.updateClient = async (req, res) => {
  try {
    const client = await Clients.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar un cliente
exports.deleteClient = async (req, res) => {
  try {
    const client = await Clients.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
