const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')

// 注册
const register = async (req, res,next) => {
  try {
    const { name, email, password, role } = req.body

    // 检查 email 有没有被用过
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    // 把密码加密，不能明文存进数据库
    const hashedPassword = await bcrypt.hash(password, 10)

    // 建立新用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'JOBSEEKER'
      }
    })

    // 签发 JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
     next(error)
  }
}

// 登录
const login = async (req, res,next) => {
  try {
    const { email, password } = req.body

    // 找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // 对比密码
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // 签发 JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
     next(error)
  }
}

// 取得当前用户资料
const getMe = async (req, res,next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    res.json(user)
  } catch (error) {
     next(error)
  }
}

module.exports = { register, login, getMe }