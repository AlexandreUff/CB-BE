const express = require('express')
const router = express.Router()
const UploadController = require('../controller/UploadController');

router.post('/sheet', UploadController.upload.single('file'), UploadController.createSheet)

module.exports = router