const Equipo = require('../models/equipo');
const { storeFile } = require('../utils/storage');

// Listar todos los equipos
exports.getAllEquipos = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const allowedLimits = [10, 20, 30, 40, 50];
    let limit = parseInt(req.query.limit) || 10;
    if (!allowedLimits.includes(limit)) limit = 10;
    const skip = (page - 1) * limit;

    // Búsqueda opcional
    const qObj = req.query.q ? { $text: { $search: req.query.q } } : null;
    // Incluir documentos que tengan estado 'activo' o que no tengan el campo 'estado' (compatibilidad con datos existentes)
    const estadoFilter = { $or: [ { estado: 'activo' }, { estado: { $exists: false } } ] };
    const filtros = qObj ? { $and: [ qObj, estadoFilter ] } : estadoFilter;

    const total = await Equipo.countDocuments(filtros);
    const equipos = await Equipo.find(filtros).skip(skip).limit(limit).populate('categoria', 'nombre').lean();

    const totalPages = Math.ceil(total / limit);
    res.json({ data: equipos, meta: { total, page, limit, totalPages } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un equipo por ID
exports.getEquipoById = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id).populate('categoria', 'nombre');
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
    res.json(equipo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un equipo
exports.createEquipo = async (req, res) => {
  try {
    const payload = { ...req.body };
    const equipo = new Equipo({
      nombre: payload.nombre,
      categoria: payload.categoria || '',
      subcategoria: payload.subcategoria || '',
      descripcion: payload.descripcion || '',
      precio: payload.precio ? parseFloat(payload.precio) : undefined,
      tipo: payload.tipo,
      uso: payload.uso,
      tamano: payload.tamano || '',
      peso: payload.peso ? parseFloat(payload.peso) : undefined,
      estado: payload.estado || 'activo',
      estado_fisico: {
        entrada: payload.estado_fisico_entrada === 'true' || payload.estado_fisico_entrada === true,
        mantenimiento: payload.estado_fisico_mantenimiento === 'true' || payload.estado_fisico_mantenimiento === true,
        salida_renta: payload.estado_fisico_salida_renta === 'true' || payload.estado_fisico_salida_renta === true,
        reparacion: payload.estado_fisico_reparacion === 'true' || payload.estado_fisico_reparacion === true,
        venta: payload.estado_fisico_venta === 'true' || payload.estado_fisico_venta === true,
        desecho: payload.estado_fisico_desecho === 'true' || payload.estado_fisico_desecho === true
      },
      disponibilidad: {
        stock: payload.disponibilidad_stock ? parseInt(payload.disponibilidad_stock, 10) : 0,
        sku: payload.disponibilidad_sku || '',
        qr: payload.disponibilidad_qr || ''
      },
      fecha_adquisicion: payload.fecha_adquisicion ? new Date(payload.fecha_adquisicion) : undefined,
      vida_util_meses: payload.vida_util_meses ? parseInt(payload.vida_util_meses, 10) : undefined,
      ubicacion: payload.ubicacion || '',
      imagen: payload.imagen || '',
      creado_en: new Date()
    });
    await equipo.save();
    res.status(201).json(equipo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Crear un equipo con imagen
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
      tipo: payload.tipo || '',
      uso: payload.uso || '',
      tamano: payload.tamano || '',
      peso: payload.peso ? parseFloat(payload.peso) : undefined,
      estado: payload.estado || 'activo',
      estado_fisico: {
        entrada: payload.estado_fisico_entrada === 'true' || payload.estado_fisico_entrada === true,
        mantenimiento: payload.estado_fisico_mantenimiento === 'true' || payload.estado_fisico_mantenimiento === true,
        salida_renta: payload.estado_fisico_salida_renta === 'true' || payload.estado_fisico_salida_renta === true,
        reparacion: payload.estado_fisico_reparacion === 'true' || payload.estado_fisico_reparacion === true,
        venta: payload.estado_fisico_venta === 'true' || payload.estado_fisico_venta === true,
        desecho: payload.estado_fisico_desecho === 'true' || payload.estado_fisico_desecho === true
      },
      disponibilidad: {
        stock: payload.disponibilidad_stock ? parseInt(payload.disponibilidad_stock, 10) : 0,
        sku: payload.disponibilidad_sku || '',
        qr: payload.disponibilidad_qr || ''
      },
      fecha_adquisicion: payload.fecha_adquisicion ? new Date(payload.fecha_adquisicion) : undefined,
      vida_util_meses: payload.vida_util_meses ? parseInt(payload.vida_util_meses, 10) : undefined,
      ubicacion: payload.ubicacion || '',
      imagen: imagenUrl || '',
      creado_en: new Date()
    });
    await equipoDoc.save();
    await equipoDoc.populate('categoria', 'nombre');
    return res.status(201).json({ data: equipoDoc });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Error al crear equipo con imagen' });
  }
};

// Actualizar un equipo
exports.updateEquipo = async (req, res) => {
  try {
    const payload = { ...req.body };
    const update = {
      ...(payload.nombre && { nombre: payload.nombre }),
      ...(payload.categoria && { categoria: payload.categoria }),
      ...(payload.subcategoria && { subcategoria: payload.subcategoria }),
      ...(payload.descripcion && { descripcion: payload.descripcion }),
      ...(payload.precio !== undefined && { precio: payload.precio ? parseFloat(payload.precio) : 0 }),
      ...(payload.tipo && { tipo: payload.tipo }),
      ...(payload.uso && { uso: payload.uso }),
      ...(payload.tamano && { tamano: payload.tamano }),
      ...(payload.peso !== undefined && { peso: payload.peso ? parseFloat(payload.peso) : 0 }),
      ...(payload.estado && { estado: payload.estado }),
      ...(payload.fecha_adquisicion && { fecha_adquisicion: new Date(payload.fecha_adquisicion) }),
      ...(payload.vida_util_meses !== undefined && { vida_util_meses: payload.vida_util_meses ? parseInt(payload.vida_util_meses, 10) : 0 }),
      ...(payload.ubicacion && { ubicacion: payload.ubicacion }),
      ...(payload.imagen && { imagen: payload.imagen })
    };

    // estado_fisico y disponibilidad son objetos; manejarlos si vienen
    if (payload.estado_fisico_entrada !== undefined) update['estado_fisico.entrada'] = payload.estado_fisico_entrada === 'true' || payload.estado_fisico_entrada === true;
    if (payload.estado_fisico_mantenimiento !== undefined) update['estado_fisico.mantenimiento'] = payload.estado_fisico_mantenimiento === 'true' || payload.estado_fisico_mantenimiento === true;
    if (payload.estado_fisico_salida_renta !== undefined) update['estado_fisico.salida_renta'] = payload.estado_fisico_salida_renta === 'true' || payload.estado_fisico_salida_renta === true;
    if (payload.estado_fisico_reparacion !== undefined) update['estado_fisico.reparacion'] = payload.estado_fisico_reparacion === 'true' || payload.estado_fisico_reparacion === true;
    if (payload.estado_fisico_venta !== undefined) update['estado_fisico.venta'] = payload.estado_fisico_venta === 'true' || payload.estado_fisico_venta === true;
    if (payload.estado_fisico_desecho !== undefined) update['estado_fisico.desecho'] = payload.estado_fisico_desecho === 'true' || payload.estado_fisico_desecho === true;

    if (payload.disponibilidad_stock !== undefined) update['disponibilidad.stock'] = payload.disponibilidad_stock ? parseInt(payload.disponibilidad_stock, 10) : 0;
    if (payload.disponibilidad_sku !== undefined) update['disponibilidad.sku'] = payload.disponibilidad_sku;
    if (payload.disponibilidad_qr !== undefined) update['disponibilidad.qr'] = payload.disponibilidad_qr;

    const equipo = await Equipo.findByIdAndUpdate(req.params.id, update, { new: true }).populate('categoria', 'nombre');
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

exports.list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const q = req.query.q ? { $text: { $search: req.query.q } } : { estado: 'activo' };
    const filtros = { ...q, estado: 'activo' };
    const total = await Equipo.countDocuments(filtros);
    const equipos = await Equipo.find(filtros).skip(skip).limit(limit).populate('categoria', 'nombre').lean();
    return res.json({ data: equipos, meta: { total, page, limit } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const equipo = new Equipo(req.body);
    await equipo.save();
    // devolver con categoria poblada
    await equipo.populate('categoria', 'nombre');
    return res.json({ data: equipo });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
