const express = require('express')
const router = express.Router()
const { getJobs, getJobById, createJob, updateJob, deleteJob } = require('../controllers/jobsController')
const { saveJob, unsaveJob, getMySavedJobs } = require('../controllers/savedJobsController')
const { applyJob, getJobApplications } = require('../controllers/applicationsController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const validate = require('../middleware/validate')
const { createJobRules } = require('../middleware/validationRules')

// 公开 routes
router.get('/', getJobs)

// 固定路径放在 :id 前面，避免冲突
router.get('/saved', authMiddleware, getMySavedJobs)

// :id 相关的 routes
router.get('/:id', getJobById)
router.post('/', authMiddleware, roleMiddleware('EMPLOYER'), createJobRules, validate, createJob)
router.put('/:id', authMiddleware, roleMiddleware('EMPLOYER'), updateJob)
router.delete('/:id', authMiddleware, roleMiddleware('EMPLOYER'), deleteJob)

// 收藏
router.post('/:id/save', authMiddleware, saveJob)
router.delete('/:id/save', authMiddleware, unsaveJob)

// 申请
router.post('/:id/apply', authMiddleware, roleMiddleware('JOBSEEKER'), applyJob)
router.get('/:id/applications', authMiddleware, roleMiddleware('EMPLOYER'), getJobApplications)

module.exports = router