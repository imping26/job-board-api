const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  try {
    // 从 request header 取出 token
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'No token, access denied' })
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 把 userId 和 role 存进 req，让下一个 function 可以用
    req.userId = decoded.userId
    req.role = decoded.role

    next() // 验证通过，继续去下一个 function
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' })
  }
}

module.exports = authMiddleware