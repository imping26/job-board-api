const express = require('express')
const router = express.Router()
const {
  createCompany,
  getMyCompany,
  updateCompany,
  getCompanyById
} = require('../controllers/companiesController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const validate = require('../middleware/validate')
const { createCompanyRules } = require('../middleware/validationRules')
// 公开 route
router.get('/:id', getCompanyById)

// 只限 EMPLOYER
router.get('/:id', getCompanyById)
router.post('/', authMiddleware, roleMiddleware('EMPLOYER'), createCompanyRules, validate, createCompany)
router.get('/me/profile', authMiddleware, roleMiddleware('EMPLOYER'), getMyCompany)
router.put('/me/profile', authMiddleware, roleMiddleware('EMPLOYER'), updateCompany)
module.exports = router