require('dotenv').config()
const crypto = require('crypto')
const prisma = require('../src/prisma')

// 一些假数据池,随机组合
const jobTitles = [
  'Frontend Developer', 'Backend Engineer', 'Full Stack Developer',
  'React Developer', 'Node.js Engineer', 'UI/UX Designer',
  'DevOps Engineer', 'Data Analyst', 'Product Manager',
  'Mobile Developer', 'QA Engineer', 'Software Architect',
  'Cloud Engineer', 'Database Administrator', 'Security Engineer',
  'Machine Learning Engineer', 'Technical Lead', 'Scrum Master',
  'Business Analyst', 'System Administrator',
]

const locations = [
  'Kuala Lumpur', 'Petaling Jaya', 'Cyberjaya',
  'Penang', 'Johor Bahru', 'Remote',
]

const types = ['FULLTIME', 'PARTTIME', 'CONTRACT', 'INTERNSHIP']

const salaries = [
  '3000-5000', '5000-8000', '8000-12000', '12000-18000', 'Negotiable',
]

// 随机从数组里挑一个
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  // 找一个现有的 employer 和 company(用第一个)
  const employer = await prisma.user.findFirst({
    where: { role: 'EMPLOYER' },
  })

  if (!employer) {
    console.log('没有 employer,请先注册一个 employer 账号')
    return
  }

  const company = await prisma.company.findFirst({
    where: { ownerId: employer.id },
  })

  if (!company) {
    console.log('这个 employer 还没有公司,请先建立公司')
    return
  }

  const category = await prisma.category.findFirst()

  // 造 20 个职位
  for (let i = 0; i < 60; i++) {
    await prisma.job.create({
      data: {
        id: crypto.randomUUID(),
        title: pick(jobTitles),
        description: 'We are looking for a talented professional to join our team. This is a great opportunity to grow your career.',
        location: pick(locations),
        salary: pick(salaries),
        type: pick(types),
        status: 'ACTIVE',
        employerId: employer.id,
        companyId: company.id,
        categoryId: category.id,
      },
    })
  }

  console.log('20 个职位建好了!去 /jobs 看分页效果')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())