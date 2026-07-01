const prisma = require("../prisma");
const { sendApplicationEmail, sendStatusEmail } = require("../lib/email");

// Jobseeker 申请职位
const applyJob = async (req, res, next) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.id;

    // 检查职位存不存在
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      const error = new Error("Job not found");
      error.status = 404;
      return next(error);
    }

    // 防止重复申请
    const existing = await prisma.application.findUnique({
      where: {
        applicantId_jobId: {
          applicantId: req.userId,
          jobId,
        },
      },
    });
    if (existing) {
      const error = new Error("You have already applied for this job");
      error.status = 400;
      return next(error);
    }

    const application = await prisma.application.create({
      data: {
        applicantId: req.userId,
        jobId,
        coverLetter,
      },
    });

    // 发确认邮件(失败也不影响申请成功)
    const applicant = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    const jobWithCompany = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    sendApplicationEmail({
      to: applicant.email,
      applicantName: applicant.name,
      jobTitle: jobWithCompany.title,
      companyName: jobWithCompany.company.name,
    }).catch((err) => console.error("Email failed:", err));

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// Jobseeker 查看自己所有申请
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: { applicantId: req.userId },
      include: {
        job: {
          include: {
            company: { select: { name: true, logo: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// Employer 查看某职位所有申请人
const getJobApplications = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
    });

    if (!job) {
      const error = new Error("Job not found");
      error.status = 404;
      return next(error);
    }

    // 确认是这个职位的 owner
    if (job.employerId !== req.userId) {
      const error = new Error("Not authorized");
      error.status = 403;
      return next(error);
    }

    const applications = await prisma.application.findMany({
      where: { jobId: req.params.id },
      include: {
        applicant: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// Employer 更新申请状态
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"];

    if (!validStatuses.includes(status)) {
      const error = new Error("Invalid status");
      error.status = 400;
      return next(error);
    }

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      return next(error);
    }

    // 确认是这个职位的 employer
    if (application.job.employerId !== req.userId) {
      const error = new Error("Not authorized");
      error.status = 403;
      return next(error);
    }

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
    });

    // 只在 ACCEPTED 或 REJECTED 时发邮件(REVIEWED/PENDING 不发)
    if (status === "ACCEPTED" || status === "REJECTED") {
      const applicant = await prisma.user.findUnique({
        where: { id: application.applicantId },
      });
      const jobInfo = await prisma.job.findUnique({
        where: { id: application.jobId },
        include: { company: true },
      });

      sendStatusEmail({
        to: applicant.email,
        applicantName: applicant.name,
        jobTitle: jobInfo.title,
        companyName: jobInfo.company.name,
        status,
      }).catch((err) => console.error("Email failed:", err));
    }

    res.json(updated);

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Employer 接受某个申请人（自动拒绝其他人 + 关闭职位）
const acceptApplication = async (req, res, next) => {
  try {
    const applicationId = req.params.id;

    // 先找到这个申请，连同它的 job 一起
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      return next(error);
    }

    // 确认是这个职位的 employer
    if (application.job.employerId !== req.userId) {
      const error = new Error("Not authorized");
      error.status = 403;
      return next(error);
    }

    // ── Transaction 开始 ──
    // 这三个操作必须一起成功，否则全部撤销
    const result = await prisma.$transaction(async (tx) => {
      // 1. 接受这个申请人
      const accepted = await tx.application.update({
        where: { id: applicationId },
        data: { status: "ACCEPTED" },
      });

      // 2. 拒绝同职位的其他申请人
      await tx.application.updateMany({
        where: {
          jobId: application.jobId,
          id: { not: applicationId }, // 除了被接受的这个
          status: { not: "REJECTED" }, // 还没被拒绝的
        },
        data: { status: "REJECTED" },
      });

      // 3. 关闭这个职位
      await tx.job.update({
        where: { id: application.jobId },
        data: { status: "CLOSED" },
      });

      return accepted;
    });
    // ── Transaction 结束 ──
    // 发邮件给被接受的人
    const acceptedApplicant = await prisma.user.findUnique({
      where: { id: result.applicantId },
    });
    const jobInfo = await prisma.job.findUnique({
      where: { id: application.jobId },
      include: { company: true },
    });

    sendStatusEmail({
      to: acceptedApplicant.email,
      applicantName: acceptedApplicant.name,
      jobTitle: jobInfo.title,
      companyName: jobInfo.company.name,
      status: "ACCEPTED",
    }).catch((err) => console.error("Email failed:", err));

    res.json({
      message: "Applicant accepted, others rejected, job closed",
      application: result,
    });

    res.json({
      message: "Applicant accepted, others rejected, job closed",
      application: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  acceptApplication,
};
