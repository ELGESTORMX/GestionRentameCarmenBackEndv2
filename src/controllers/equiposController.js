// Listar todos los equipos
exports.getAllEquipos = async (req, res) => {
  try {
    const equipos = await Equipo.find();
    res.json(equipos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un equipo por ID
exports.getEquipoById = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
    res.json(equipo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un equipo
exports.createEquipo = async (req, res) => {
  try {
    const equipo = new Equipo(req.body);
    await equipo.save();
    res.status(201).json(equipo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar un equipo
exports.updateEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
    res.json(equipo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar un equipo
exports.deleteEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findByIdAndDelete(req.params.id);
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
    res.json({ message: 'Equipo eliminado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
const Equipo = require('../models/equipo');
const { storeFile } = require('../utils/storage');

exports.list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const q = req.query.q ? { $text: { $search: req.query.q } } : { estado: 'activo' };
    const filtros = { ...q, estado: 'activo' };
    const total = await Equipo.countDocuments(filtros);
    const equipos = await Equipo.find(filtros).skip(skip).limit(limit).lean();
    return res.json({ data: equipos, meta: { total, page, limit } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const equipo = new Equipo(req.body);
    await equipo.save();
    return res.json({ data: equipo });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.createWithImage = async (req, res) => {
  try {
    const payload = { ...req.body };
    let imagenUrl = payload.imagen || null;
    if (req.file) {
      imagenUrl = await storeFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    }
    const equipoDoc = new Equipo({
      nombre: payload.nombre || 'Equipo sin nombre',
      categoria: payload.categoria || '',
      subcategoria: payload.subcategoria || '',
      descripcion: payload.descripcion || '',
      precio: payload.precio ? Number(payload.precio) : (payload.precio ? parseFloat(payload.precio) : undefined),
      estado: payload.estado || 'activo',
      fecha_adquisicion: payload.fecha_adquisicion ? new Date(payload.fecha_adquisicion) : undefined,
      vida_util_meses: payload.vida_util_meses ? parseInt(payload.vida_util_meses, 10) : undefined,
      ubicacion: payload.ubicacion || '',
      imagen: imagenUrl || '',
      creado_en: new Date()
    });
    await equipoDoc.save();
    return res.status(201).json({ data: equipoDoc });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Error al crear equipo con imagen' });
  }
};
