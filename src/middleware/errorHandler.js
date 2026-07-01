const errorHandler = (err, req, res, next) => {
  console.error(err)

  const status = err.status || 500
  const message = err.message || 'Something went wrong, please try again'

  // 如果有 validation errors，一起回传
  if (err.errors) {
    return res.status(status).json({ message, errors: err.errors })
  }

  res.status(status).json({ message })
}

module.exports = errorHandler