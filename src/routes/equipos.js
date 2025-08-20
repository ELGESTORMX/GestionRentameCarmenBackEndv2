const express = require('express');
const router = express.Router();
const upload = require('multer')({ storage: require('multer').memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const { list, create, createWithImage } = require('../controllers/equiposController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, list);
router.post('/', verifyToken, requireRole('admin'), create);
router.post('/upload', verifyToken, requireRole('admin'), upload.single('imagen'), createWithImage);

module.exports = router;
