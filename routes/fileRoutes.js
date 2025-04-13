const express = require('express');
const fileController = require('../controllers/filecontroller');
const authMiddleware = require('./middlewares/authMiddleware');

const router = express.Router();

router.post('/upload', authMiddleware, fileController.uploadFile);
router.get('/', authMiddleware, fileController.listFiles);

module.exports = router;
