const express = require('express');
const router = express.Router();
const rentasController = require('../controllers/rentasController');

router.get('/', rentasController.getAllRentas);
router.get('/:id', rentasController.getRentaById);
router.post('/', rentasController.createRenta);
router.put('/:id', rentasController.updateRenta);
router.delete('/:id', rentasController.deleteRenta);

module.exports = router;
