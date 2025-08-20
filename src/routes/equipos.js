
const express = require('express');
const router = express.Router();
const upload = require('multer')({ storage: require('multer').memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const { getAllEquipos, getEquipoById, createEquipo, updateEquipo, deleteEquipo, createWithImage } = require('../controllers/equiposController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Endpoints REST
router.get('/', verifyToken, getAllEquipos);
router.get('/:id', verifyToken, getEquipoById);
router.post('/', verifyToken, requireRole('admin'), createEquipo);
router.put('/:id', verifyToken, requireRole('admin'), updateEquipo);
router.delete('/:id', verifyToken, requireRole('admin'), deleteEquipo);
router.post('/upload', verifyToken, requireRole('admin'), upload.single('imagen'), createWithImage);

module.exports = router;
