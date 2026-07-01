const prisma = require('../prisma')

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    res.json(categories)
  } catch (error) {
    next(error)
  }
}

module.exports = { getCategories }