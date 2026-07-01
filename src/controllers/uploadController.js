const cloudinary = require('../lib/cloudinary')

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No file uploaded')
      error.status = 400
      return next(error)
    }

    // 把内存里的文件转成 base64,传给 Cloudinary
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'job-board',  // Cloudinary 里的文件夹名
    })

    // 只回传图片 URL 给前端
    res.json({ url: result.secure_url })
  } catch (error) {
    next(error)
  }
}

module.exports = { uploadImage }