const NotasRemision = require('../models/notasRemision');

exports.getAllNotas = async (req, res) => {
  try {
    const notas = await NotasRemision.find();
    res.json(notas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotaById = async (req, res) => {
  try {
    const nota = await NotasRemision.findById(req.params.id);
    if (!nota) return res.status(404).json({ error: 'Nota no encontrada' });
    res.json(nota);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNota = async (req, res) => {
  try {
    const nota = new NotasRemision(req.body);
    await nota.save();
    res.status(201).json(nota);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateNota = async (req, res) => {
  try {
    const nota = await NotasRemision.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!nota) return res.status(404).json({ error: 'Nota no encontrada' });
    res.json(nota);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteNota = async (req, res) => {
  try {
    const nota = await NotasRemision.findByIdAndDelete(req.params.id);
    if (!nota) return res.status(404).json({ error: 'Nota no encontrada' });
    res.json({ message: 'Nota eliminada' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
