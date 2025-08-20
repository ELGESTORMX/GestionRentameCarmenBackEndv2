const express = require('express');
const router = express.Router();
const upload = require('multer')({ storage: require('multer').memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const legacy = require('../controllers/legacyController');
const { verifyToken, requireRole } = require('../middleware/auth');

// admins handled in auth routes; here map clients/rentas/categorias/notas
router.post('/clients/create', upload.any(), legacy.createClient);
router.get('/clients', legacy.listClients);
router.get('/clients/read_especific', legacy.listClients);
router.put('/clients/update/:_id', upload.any(), legacy.createClient);
router.delete('/clients/delete', legacy.createClient);

router.post('/rentas/create', upload.any(), legacy.createRenta);
router.get('/rentas', legacy.listRentas);
router.get('/rentas/read_especific', legacy.listRentas);
router.put('/rentas/update/:_id', upload.any(), legacy.createRenta);
router.delete('/rentas/delete', legacy.createRenta);

router.post('/categorias/create', legacy.createCategoria);
router.get('/categorias', legacy.listCategorias);
router.put('/categorias/update/:_id', legacy.createCategoria);
router.delete('/categorias/delete', legacy.createCategoria);

router.post('/notas_remision/create', legacy.createNota);
router.get('/notas_remision', legacy.listNotas);
router.put('/notas_remision/update/:_id', legacy.createNota);
router.delete('/notas_remision/delete', legacy.createNota);

module.exports = router;
