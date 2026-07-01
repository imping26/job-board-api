const { body } = require('express-validator')

const registerRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['JOBSEEKER', 'EMPLOYER']).withMessage('Role must be JOBSEEKER or EMPLOYER')
]

const loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
]

const createJobRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('type').optional().isIn(['FULLTIME', 'PARTTIME', 'CONTRACT', 'INTERNSHIP'])
    .withMessage('Invalid job type')
]

const createCompanyRules = [
  body('name').notEmpty().withMessage('Company name is required'),
  body('website').optional().isURL().withMessage('Please provide a valid URL')
]

const updateApplicationStatusRules = [
  body('status').isIn(['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'])
    .withMessage('Invalid status')
]

module.exports = {
  registerRules,
  loginRules,
  createJobRules,
  createCompanyRules,
  updateApplicationStatusRules
}