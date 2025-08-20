const express = require('express');
const router = express.Router();
const notasRemisionController = require('../controllers/notasRemisionController');

router.get('/', notasRemisionController.getAllNotas);
router.get('/:id', notasRemisionController.getNotaById);
router.post('/', notasRemisionController.createNota);
router.put('/:id', notasRemisionController.updateNota);
router.delete('/:id', notasRemisionController.deleteNota);

module.exports = router;
