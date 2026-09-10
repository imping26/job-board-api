require('dotenv').config()
const crypto = require('crypto')
const prisma = require('../src/prisma')

const categories = [
  'Information Technology',
  'Finance & Accounting',
  'Marketing',
  'Design',
  'Sales',
  'Human Resources',
  'Engineering',
  'Customer Service',
]

async function main() {
  for (const name of categories) {
    // upsert:已存在就跳过，不存在才建（避免重复）
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { id: crypto.randomUUID(), name },
    }) 
  }
  console.log(`${categories.length} categories ready`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())