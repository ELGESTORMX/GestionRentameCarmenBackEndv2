const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);
// Nuevo endpoint seguro para obtener info del usuario autenticado
router.get('/me', auth.me);

module.exports = router;
