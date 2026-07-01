const prisma = require('../prisma')

// 收藏职位
const saveJob = async (req, res, next) => {
  try {
    const jobId = req.params.id

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    })
    if (!job) {
      const error = new Error('Job not found')
      error.status = 404
      return next(error)
    }

    // 检查有没有已经收藏过
    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: req.userId,
          jobId
        }
      }
    })
    if (existing) {
      const error = new Error('Job already saved')
      error.status = 400
      return next(error)
    }

    const saved = await prisma.savedJob.create({
      data: {
        id: require('crypto').randomUUID(),
        userId: req.userId,
        jobId
      }
    })

    res.status(201).json(saved)
  } catch (error) {
    next(error)
  }
}

// 取消收藏
const unsaveJob = async (req, res, next) => {
  try {
    const jobId = req.params.id

    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: req.userId,
          jobId
        }
      }
    })
    if (!existing) {
      const error = new Error('Job is not saved')
      error.status = 404
      return next(error)
    }

    await prisma.savedJob.delete({
      where: {
        userId_jobId: {
          userId: req.userId,
          jobId
        }
      }
    })

    res.json({ message: 'Job unsaved successfully' })
  } catch (error) {
    next(error)
  }
}

// 查看所有收藏的职位
const getMySavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: req.userId },
      include: {
        job: {
          include: {
            company: { select: { name: true, logo: true } },
            category: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(savedJobs)
  } catch (error) {
    next(error)
  }
}

module.exports = { saveJob, unsaveJob, getMySavedJobs }