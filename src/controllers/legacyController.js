const Clients = require('../models/clients');
const Rentas = require('../models/rentas');
const Categorias = require('../models/categorias');
const NotasRemision = require('../models/notasRemision');
const { storeFile } = require('../utils/storage');
const dayjs = require('dayjs');

exports.createClient = async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.files && req.files.length > 0) {
      for (const f of req.files) {
        const url = await storeFile(f.buffer, f.originalname, f.mimetype);
        body[f.fieldname] = url;
      }
    }
    const created = await Clients.create(body);
    return res.status(200).json({ response: created, message: 'Cliente creado con exito' });
  } catch (err) {
    return res.status(500).json({ response: null, message: err.message });
  }
};

exports.listClients = async (req, res) => {
  try {
    const all = await Clients.find({}).collation({ locale: 'en', strength: 1 }).sort({ nombre: 1 });
    if (all.length > 0) return res.status(200).json({ response: all, message: 'Clientes encontrados' });
    return res.status(404).json({ response: null, message: 'No se encontraron clientes' });
  } catch (err) {
    return res.status(500).json({ response: null, message: 'Error del servidor' });
  }
};

exports.createRenta = async (req, res) => {
  try {
    const rentaData = { ...req.body };
    if (req.files && req.files.length > 0) {
      rentaData.fotos_estado_inicial = rentaData.fotos_estado_inicial || [];
      for (const f of req.files) {
        const url = await storeFile(f.buffer, f.originalname, f.mimetype);
        rentaData.fotos_estado_inicial.push(url);
      }
    }
    const ultima = await Rentas.findOne({}, { folio: 1 }).sort({ folio: -1 });
    const folioInicial = parseInt(process.env.FOLIO_INICIAL || '2868', 10);
    rentaData.folio = ultima && ultima.folio ? ultima.folio + 1 : folioInicial;
    const folioExistente = await Rentas.findOne({ folio: rentaData.folio });
    if (folioExistente) return res.status(400).json({ response: null, success: false, message: 'Este Folio ya existe' });

    rentaData.nombre = rentaData.nombre || 'Cliente de prueba';
    rentaData.telefono = rentaData.telefono || '0000000000';
    rentaData.direccion = rentaData.direccion || 'Dirección genérica';
    rentaData.fecha_renta = rentaData.fecha_renta || dayjs().format('YYYY-MM-DD');
    rentaData.hora_renta = rentaData.hora_renta || dayjs().format('HH:mm:ss');
    rentaData.fecha_vencimiento = rentaData.fecha_vencimiento || dayjs().add(3, 'day').format('YYYY-MM-DD');
    rentaData.usuario_rentador = rentaData.usuario_rentador || 'admin';
    rentaData.productos = Array.isArray(rentaData.productos) && rentaData.productos.length > 0 ? rentaData.productos : [
      { nombre: 'Producto genérico', codigo: 'P001', cantidad: 1, dias_renta: 3, descripcion: 'Descripción genérica', precio_unitario: 100, importe_total: 100 }
    ];
    rentaData.total_renta = rentaData.total_renta || '100';
    rentaData.fotos_estado_inicial = rentaData.fotos_estado_inicial || ['foto1.jpg'];
    rentaData.IVA = typeof rentaData.IVA === 'boolean' ? rentaData.IVA : false;

    let rentaCreada = null;
    let intentos = 0;
    const maxIntentos = 5;
    while (!rentaCreada && intentos < maxIntentos) {
      try {
        rentaCreada = await Rentas.create(rentaData);
      } catch (e) {
        intentos++;
        if (intentos >= maxIntentos) throw e;
      }
    }
    if (rentaCreada) return res.status(200).json({ response: rentaCreada, _id: rentaCreada._id, message: 'Renta creada con éxito' });
    return res.status(400).json({ response: null, message: 'No se pudo crear la renta' });
  } catch (err) {
    return res.status(500).json({ response: null, message: 'Error en el servidor al crear renta' });
  }
};

exports.listRentas = async (req, res) => {
  try {
    const all = await Rentas.find(req.query || {});
    if (all && all.length > 0) return res.status(200).json({ response: all, message: 'Rentas encontradas' });
    return res.status(404).json({ response: null, message: 'No se encontraron rentas' });
  } catch (err) {
    return res.status(500).json({ response: null, message: 'Ocurrió un error en el servidor' });
  }
};

exports.listCategorias = async (req, res) => {
  try {
    const all = await Categorias.find({});
    return res.status(200).json({ response: all, message: 'Categorias' });
  } catch (err) {
    return res.status(500).json({ response: null, message: err.message });
  }
};

exports.createCategoria = async (req, res) => {
  try {
    const created = await Categorias.create(req.body);
    return res.status(201).json({ response: created, message: 'Categoria creada' });
  } catch (err) {
    return res.status(500).json({ response: null, message: err.message });
  }
};

exports.createNota = async (req, res) => {
  try {
    const created = await NotasRemision.create(req.body);
    return res.status(201).json({ response: created, message: 'Nota creada' });
  } catch (err) {
    return res.status(500).json({ response: null, message: err.message });
  }
};

exports.listNotas = async (req, res) => {
  try {
    const all = await NotasRemision.find({});
    return res.status(200).json({ response: all, message: 'Notas' });
  } catch (err) {
    return res.status(500).json({ response: null, message: err.message });
  }
};
