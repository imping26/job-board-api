const express = require('express')
const router = express.Router()
const { uploadImage } = require('../controllers/uploadController')
const authMiddleware = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')

// upload.single('image') 处理单个文件,字段名叫 'image'
router.post('/', authMiddleware, upload.single('image'), uploadImage)

module.exports = router