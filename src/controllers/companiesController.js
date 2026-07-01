const prisma = require('../prisma')

// 建立公司
const createCompany = async (req, res, next) => {
  try {
    const { name, description, website, logo } = req.body

    // 检查这个 employer 有没有已经建了公司
    const existing = await prisma.company.findUnique({
      where: { ownerId: req.userId }
    })
    if (existing) {
      const error = new Error('You already have a company')
      error.status = 400
      return next(error)
    }

    const company = await prisma.company.create({
      data: {
        id: require('crypto').randomUUID(),
        name,
        description,
        website,
        logo,
        ownerId: req.userId
      }
    })

    res.status(201).json(company)
  } catch (error) {
    next(error)
  }
}

// 取得自己的公司资料
const getMyCompany = async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { ownerId: req.userId },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!company) {
      const error = new Error('Company not found')
      error.status = 404
      return next(error)
    }

    res.json(company)
  } catch (error) {
    next(error)
  }
}

// 更新公司资料
const updateCompany = async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { ownerId: req.userId }
    })

    if (!company) {
      const error = new Error('Company not found')
      error.status = 404
      return next(error)
    }

    const updated = await prisma.company.update({
      where: { ownerId: req.userId },
      data: req.body
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
}

// 取得单个公司资料（公开）
const getCompanyById = async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        jobs: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!company) {
      const error = new Error('Company not found')
      error.status = 404
      return next(error)
    }

    res.json(company)
  } catch (error) {
    next(error)
  }
}

module.exports = { createCompany, getMyCompany, updateCompany, getCompanyById }