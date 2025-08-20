const Rentas = require('../models/rentas');

exports.getAllRentas = async (req, res) => {
  try {
    const rentas = await Rentas.find();
    res.json(rentas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRentaById = async (req, res) => {
  try {
    const renta = await Rentas.findById(req.params.id);
    if (!renta) return res.status(404).json({ error: 'Renta no encontrada' });
    res.json(renta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRenta = async (req, res) => {
  try {
    const renta = new Rentas(req.body);
    await renta.save();
    res.status(201).json(renta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateRenta = async (req, res) => {
  try {
    const renta = await Rentas.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!renta) return res.status(404).json({ error: 'Renta no encontrada' });
    res.json(renta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteRenta = async (req, res) => {
  try {
    const renta = await Rentas.findByIdAndDelete(req.params.id);
    if (!renta) return res.status(404).json({ error: 'Renta no encontrada' });
    res.json({ message: 'Renta eliminada' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
