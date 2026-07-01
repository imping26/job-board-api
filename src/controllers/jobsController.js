const prisma = require('../prisma')

// 取得所有职位（支持搜索过滤 + 分页）
const getJobs = async (req, res ,next) => {
  try {
    const { keyword, location, type, page = 1, limit = 10 } = req.query

    // 建立过滤条件
    const where = {
      status: 'ACTIVE',
      ...(keyword && {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } }
        ]
      }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(type && { type })
    }

    // 计算跳过多少条（分页用）
    const skip = (page - 1) * limit

    // 同时查职位列表和总数
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { name: true, logo: true } },
          category: { select: { name: true } }
        }
      }),
      prisma.job.count({ where })
    ])

    res.json({
      jobs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
     next(error)
  }
}

// 取得单个职位
const getJobById = async (req, res,next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        category: { select: { name: true } },
        employer: { select: { name: true, email: true } }
      }
    })

    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    res.json(job)
  } catch (error) {
     next(error)
  }
}

// 发布职位（只限 EMPLOYER）
const createJob = async (req, res,next) => {
  try {
    const { title, description, location, salary, type, categoryId } = req.body

    // 找到这个 employer 的 company
    const company = await prisma.company.findUnique({
      where: { ownerId: req.userId }
    })

    if (!company) {
      return res.status(400).json({ message: 'You need to create a company first' })
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        salary,
        type: type || 'FULLTIME',
        employerId: req.userId,
        companyId: company.id,
        categoryId
      }
    })

    res.status(201).json(job)
  } catch (error) {
     next(error)
  }
}

// 更新职位（只限该职位的 owner）
const updateJob = async (req, res,next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    })

    if (!job) {
      const error = new Error('Job not found')
      error.status = 404
      return next(error)
    }
    if (job.employerId !== req.userId) {
      const error = new Error('Not authorized')
      error.status = 403
      return next(error)
    }
    
    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
      data: req.body
    })

    res.json(updatedJob)
  } catch (error) {
     next(error)
  }
}

// 删除职位
// 删除职位(连同关联数据一起删)
const deleteJob = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    })

    if (!job) {
      const error = new Error('Job not found')
      error.status = 404
      return next(error)
    }

    if (job.employerId !== req.userId) {
      const error = new Error('Not authorized')
      error.status = 403
      return next(error)
    }

    // ── Transaction:清理关联数据,顺序很重要 ──
    await prisma.$transaction(async (tx) => {
      // 1. 先删所有申请记录
      await tx.application.deleteMany({
        where: { jobId: req.params.id }
      })

      // 2. 再删所有收藏记录
      await tx.savedJob.deleteMany({
        where: { jobId: req.params.id }
      })

      // 3. 最后删职位本身
      await tx.job.delete({
        where: { id: req.params.id }
      })
    })

    res.json({ message: 'Job deleted successfully' })
  } catch (error) {
    next(error)
  }
}

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob }