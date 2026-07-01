require('dotenv').config()
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const prisma = require('../src/prisma')

async function main() {
  // 密码统一用 123456(加密后)
  const password = await bcrypt.hash('123456', 10)

  // 1. 建一个 employer
  const employer = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Test Employer',
      email: `employer_${Date.now()}@test.com`,  // 用时间戳避免 email 重复
      password,
      role: 'EMPLOYER',
    },
  })
  console.log('Employer created:', employer.email)

  // 2. 给 employer 建公司
  const company = await prisma.company.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Test Company',
      ownerId: employer.id,
    },
  })

  // 3. 找一个 category(用现有的第一个)
  const category = await prisma.category.findFirst()

  // 4. 建一个职位
  const job = await prisma.job.create({
    data: {
      id: crypto.randomUUID(),
      title: 'Test Job for Deletion',
      description: 'This job is for testing delete',
      location: 'Kuala Lumpur',
      type: 'FULLTIME',
      employerId: employer.id,
      companyId: company.id,
      categoryId: category.id,
    },
  })
  console.log('Job created:', job.id)

  // 5. 建 3 个 jobseeker 并让他们申请这个职位
  for (let i = 1; i <= 3; i++) {
    const seeker = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: `Test Seeker ${i}`,
        email: `seeker_${Date.now()}_${i}@test.com`,
        password,
        role: 'JOBSEEKER',
      },
    })

    await prisma.application.create({
      data: {
        id: crypto.randomUUID(),
        applicantId: seeker.id,
        jobId: job.id,
        coverLetter: `I am applicant ${i}`,
      },
    })
  }

  console.log('3 applicants created for job:', job.id)
  console.log('\n你可以用这个 jobId 来测试删除:', job.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())