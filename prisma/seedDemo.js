// Seeds realistic demo data: 5 employer accounts with companies and ~25 jobs
// spread across all categories. Safe to re-run: existing records are reused.
//
//   DATABASE_URL=<url> node prisma/seedDemo.js
//
// All demo employer accounts use the password below.
require('dotenv').config()
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const prisma = require('../src/prisma')

const DEMO_PASSWORD = 'Demo1234!'

const companies = [
  {
    name: 'Nimbus Technologies',
    email: 'hr@nimbus-tech.demo',
    ownerName: 'Aisyah Rahman',
    website: 'https://nimbus-tech.example.com',
    description:
      'Nimbus builds cloud infrastructure tooling used by fast-growing startups across Southeast Asia. We are a remote-friendly team of 120 engineers headquartered in Kuala Lumpur.',
  },
  {
    name: 'Meridian Capital',
    email: 'careers@meridian-capital.demo',
    ownerName: 'Daniel Lim',
    website: 'https://meridian-capital.example.com',
    description:
      'Meridian Capital is a boutique investment and advisory firm serving mid-market companies in Malaysia and Singapore since 2009.',
  },
  {
    name: 'Bloom Digital Agency',
    email: 'talent@bloomdigital.demo',
    ownerName: 'Priya Nair',
    website: 'https://bloomdigital.example.com',
    description:
      'Bloom is a full-service digital agency crafting brands, campaigns and products for consumer companies. Our studio is in Bangsar with a satellite team in Penang.',
  },
  {
    name: 'Orion Manufacturing',
    email: 'jobs@orion-mfg.demo',
    ownerName: 'Wei Jun Tan',
    website: 'https://orion-mfg.example.com',
    description:
      'Orion designs and manufactures precision components for the automotive and electronics industries from our facilities in Johor Bahru and Penang.',
  },
  {
    name: 'Helio Retail Group',
    email: 'people@helioretail.demo',
    ownerName: 'Sarah Wong',
    website: 'https://helioretail.example.com',
    description:
      'Helio operates 60+ lifestyle stores nationwide and a growing e-commerce platform. We are known for a people-first culture and strong internal promotion.',
  },
]

// category: must match names in seedCategories.js
const jobs = [
  // Nimbus Technologies
  {
    company: 'Nimbus Technologies', category: 'Information Technology',
    title: 'Senior Backend Engineer (Node.js)', location: 'Kuala Lumpur', type: 'FULLTIME', salary: 'RM 10,000 - 14,000',
    description: `We are looking for a Senior Backend Engineer to own core services on our cloud platform.

What you will do:
- Design and build APIs in Node.js and TypeScript serving thousands of requests per second
- Own PostgreSQL schema design, migrations and query performance
- Mentor mid-level engineers and lead technical design reviews
- Participate in an on-call rotation with a healthy, well-staffed team

What we are looking for:
- 5+ years of backend experience, at least 2 with Node.js in production
- Strong SQL skills and experience with Prisma, Knex or similar
- Comfortable with Docker, CI/CD and at least one major cloud provider

Benefits include hybrid work (2 days in office), medical coverage for you and dependents, and an annual learning budget.`,
  },
  {
    company: 'Nimbus Technologies', category: 'Information Technology',
    title: 'Frontend Developer (React)', location: 'Remote', type: 'FULLTIME', salary: 'RM 6,500 - 9,000',
    description: `Join our product team to build the dashboards our customers use every day.

Responsibilities:
- Build responsive, accessible interfaces with React, TypeScript and Tailwind
- Collaborate closely with designers to translate Figma mockups into polished UI
- Write unit and integration tests and take part in code review
- Improve performance and bundle size across the web app

Requirements:
- 3+ years of professional frontend experience
- Solid understanding of React hooks, state management and data fetching
- Experience with Vite or similar modern build tooling

This role is fully remote within Malaysia with quarterly team meetups in Kuala Lumpur.`,
  },
  {
    company: 'Nimbus Technologies', category: 'Engineering',
    title: 'DevOps Engineer', location: 'Cyberjaya', type: 'FULLTIME', salary: 'RM 8,000 - 12,000',
    description: `Help us run reliable, secure infrastructure for a multi-tenant SaaS platform.

You will:
- Manage Kubernetes clusters on AWS and improve our deployment pipelines
- Build observability with Prometheus, Grafana and OpenTelemetry
- Automate infrastructure with Terraform and harden our security posture
- Lead incident reviews and drive down mean time to recovery

You have:
- 3+ years in DevOps, SRE or platform engineering
- Hands-on Kubernetes and Terraform experience
- Working knowledge of networking, IAM and secrets management`,
  },
  {
    company: 'Nimbus Technologies', category: 'Information Technology',
    title: 'Software Engineering Intern', location: 'Kuala Lumpur', type: 'INTERNSHIP', salary: 'RM 1,500 - 2,000',
    description: `A 3 to 6 month internship for students in their final year of a computer science or related degree.

You will be paired with a mentor and ship real features to production, working across our React frontend and Node.js services. Past interns have built internal tools, improved test coverage and contributed to customer-facing features.

We are looking for curiosity, a solid grasp of programming fundamentals and some experience with JavaScript. Prior internship experience is not required.`,
  },
  {
    company: 'Nimbus Technologies', category: 'Customer Service',
    title: 'Technical Support Specialist', location: 'Kuala Lumpur', type: 'FULLTIME', salary: 'RM 4,000 - 5,500',
    description: `Be the first line of support for our developer customers.

- Respond to support tickets and live chat with clear, friendly technical guidance
- Reproduce bugs and write detailed reports for the engineering team
- Maintain and expand our help centre and documentation
- Identify recurring issues and propose product improvements

You should have strong written English, a basic understanding of web technologies (HTTP, APIs, browsers) and a genuine interest in helping people. Experience with a ticketing tool such as Zendesk or Intercom is a plus.`,
  },

  // Meridian Capital
  {
    company: 'Meridian Capital', category: 'Finance & Accounting',
    title: 'Financial Analyst', location: 'Kuala Lumpur', type: 'FULLTIME', salary: 'RM 5,500 - 7,500',
    description: `Support our advisory team with financial modelling and due diligence on mid-market transactions.

Key responsibilities:
- Build and maintain three-statement models, DCF and comparable analyses
- Prepare pitch books, information memoranda and investment committee papers
- Conduct industry and company research
- Support senior team members during client meetings

Requirements:
- Degree in finance, accounting or economics; CFA progress is an advantage
- 1 to 3 years of experience in investment banking, corporate finance or Big 4 transaction services
- Advanced Excel and PowerPoint skills`,
  },
  {
    company: 'Meridian Capital', category: 'Finance & Accounting',
    title: 'Senior Accountant', location: 'Kuala Lumpur', type: 'FULLTIME', salary: 'RM 7,000 - 9,000',
    description: `Own month-end close and statutory reporting for the firm and its fund vehicles.

- Prepare monthly management accounts and annual financial statements under MFRS
- Manage audit and tax filing processes with external advisors
- Oversee accounts payable, receivable and treasury operations
- Improve internal controls and finance processes

You are a qualified accountant (ACCA, CPA or MIA) with 4+ years of experience, ideally including time in a professional services or financial services environment.`,
  },
  {
    company: 'Meridian Capital', category: 'Finance & Accounting',
    title: 'Accounts Assistant (Contract)', location: 'Kuala Lumpur', type: 'CONTRACT', salary: 'RM 3,200 - 4,000',
    description: `12-month contract supporting the finance team during a system migration, with possibility of conversion to permanent.

Duties include processing invoices and expense claims, bank reconciliations, maintaining fixed asset registers and assisting with audit queries. A diploma in accounting and 1+ years of experience are required. Familiarity with Xero or SAP is helpful.`,
  },
  {
    company: 'Meridian Capital', category: 'Human Resources',
    title: 'HR & Office Manager', location: 'Kuala Lumpur', type: 'FULLTIME', salary: 'RM 6,000 - 8,000',
    description: `A generalist role running people operations and the office for a 40-person professional firm.

- Manage recruitment, onboarding and performance review cycles
- Administer payroll, benefits and statutory contributions (EPF, SOCSO, EIS)
- Maintain HR policies and ensure compliance with Malaysian employment law
- Oversee office vendors, facilities and events

Requires 4+ years of HR experience with strong knowledge of local employment regulations. Discretion and excellent organisation are essential.`,
  },

  // Bloom Digital Agency
  {
    company: 'Bloom Digital Agency', category: 'Design',
    title: 'UI/UX Designer', location: 'Kuala Lumpur', type: 'FULLTIME', salary: 'RM 5,000 - 7,500',
    description: `Design digital products and campaigns for consumer brands across retail, F&B and travel.

What you will do:
- Lead the design process from research and wireframes to high-fidelity prototypes
- Build and maintain design systems in Figma
- Run usability testing and turn findings into design improvements
- Present work to clients and articulate design decisions

What we look for:
- 3+ years of product or digital design experience with a strong portfolio
- Fluency in Figma and familiarity with front-end constraints
- Ability to juggle multiple client projects with grace`,
  },
  {
    company: 'Bloom Digital Agency', category: 'Design',
    title: 'Graphic Designer (Part-time)', location: 'Penang', type: 'PARTTIME', salary: 'RM 2,000 - 3,000',
    description: `20 hours per week supporting our Penang studio with social media creatives, print collateral and brand assets.

Strong skills in Adobe Illustrator and Photoshop are required; motion design skills in After Effects are a bonus. Ideal for freelancers or recent graduates looking for steady, flexible work.`,
  },
  {
    company: 'Bloom Digital Agency', category: 'Marketing',
    title: 'Digital Marketing Executive', location: 'Kuala Lumpur', type: 'FULLTIME', salary: 'RM 4,000 - 5,500',
    description: `Plan and run paid and organic campaigns for a portfolio of client accounts.

- Manage Meta, Google and TikTok ad campaigns, including budgets and reporting
- Write and schedule social content and coordinate with designers
- Track performance in GA4 and produce monthly client reports
- Stay on top of platform changes and share learnings with the team

2+ years of hands-on digital marketing experience and strong analytical skills are needed. Agency experience preferred.`,
  },
  {
    company: 'Bloom Digital Agency', category: 'Marketing',
    title: 'Content Strategist', location: 'Remote', type: 'CONTRACT', salary: 'RM 6,000 - 8,000',
    description: `6-month contract to develop content strategies and editorial calendars for three client brands launching in Q1.

You will audit existing content, define voice and messaging pillars, plan multi-channel content and brief writers and designers. We need 4+ years of content or brand strategy experience and excellent English writing skills. Bahasa Malaysia or Mandarin proficiency is a plus.`,
  },
  {
    company: 'Bloom Digital Agency', category: 'Information Technology',
    title: 'WordPress Developer', location: 'Kuala Lumpur', type: 'FULLTIME', salary: 'RM 4,500 - 6,500',
    description: `Build fast, maintainable marketing websites for our clients.

- Develop custom WordPress themes and blocks from Figma designs
- Integrate forms, analytics, CRMs and e-commerce (WooCommerce)
- Optimise Core Web Vitals and site security
- Support the team with hosting, deployment and maintenance

You have 2+ years of WordPress development with solid PHP, JavaScript and CSS skills. Experience with headless setups or Next.js is a plus.`,
  },

  // Orion Manufacturing
  {
    company: 'Orion Manufacturing', category: 'Engineering',
    title: 'Mechanical Engineer', location: 'Johor Bahru', type: 'FULLTIME', salary: 'RM 5,000 - 7,000',
    description: `Design and improve precision components and tooling for automotive customers.

Responsibilities:
- Create 3D models and drawings in SolidWorks and manage engineering changes
- Run tolerance analyses and support DFM reviews with production
- Investigate quality issues and drive corrective actions
- Coordinate with suppliers on tooling and materials

Requirements:
- Degree in mechanical engineering
- 2+ years in a manufacturing environment; automotive experience preferred
- Working knowledge of GD&T and ISO 9001 / IATF 16949`,
  },
  {
    company: 'Orion Manufacturing', category: 'Engineering',
    title: 'Process Engineer', location: 'Penang', type: 'FULLTIME', salary: 'RM 5,500 - 7,500',
    description: `Own manufacturing processes on our SMT and assembly lines in Penang.

You will set up and optimise processes, lead yield improvement projects, qualify new equipment and train technicians. We are looking for an engineer with 3+ years in electronics manufacturing, strong Lean and Six Sigma fundamentals and experience with statistical process control.`,
  },
  {
    company: 'Orion Manufacturing', category: 'Engineering',
    title: 'Quality Engineer', location: 'Johor Bahru', type: 'FULLTIME', salary: 'RM 4,800 - 6,500',
    description: `Ensure our components meet customer specifications and industry standards.

- Manage incoming, in-process and outgoing inspection
- Lead 8D problem solving and customer complaint responses
- Maintain PPAP, FMEA and control plan documentation
- Support internal and customer audits

Degree in engineering with 2+ years of quality experience in automotive or electronics manufacturing. Certified Quality Engineer is an advantage.`,
  },
  {
    company: 'Orion Manufacturing', category: 'Human Resources',
    title: 'HR Executive (Recruitment)', location: 'Johor Bahru', type: 'FULLTIME', salary: 'RM 3,800 - 5,000',
    description: `Drive hiring for our Johor Bahru plant across production, technical and office roles.

You will manage the end-to-end recruitment process, coordinate with agencies and job boards, run onboarding and support employee engagement programmes. 2+ years of recruitment experience, ideally in a manufacturing setting, and fluency in Bahasa Malaysia and English are required.`,
  },
  {
    company: 'Orion Manufacturing', category: 'Sales',
    title: 'Key Account Manager (Automotive)', location: 'Johor Bahru', type: 'FULLTIME', salary: 'RM 8,000 - 11,000',
    description: `Grow revenue with our top automotive customers in Malaysia and Thailand.

- Own the relationship with assigned key accounts and build multi-level contacts
- Lead RFQ responses and negotiate pricing and contracts
- Forecast demand and coordinate with planning and engineering
- Identify new programmes and expand share of wallet

You bring 5+ years of B2B sales or account management in automotive components, a strong technical grounding and willingness to travel regionally.`,
  },

  // Helio Retail Group
  {
    company: 'Helio Retail Group', category: 'Sales',
    title: 'Retail Store Manager', location: 'Petaling Jaya', type: 'FULLTIME', salary: 'RM 4,500 - 6,000',
    description: `Lead one of our flagship stores in Petaling Jaya.

- Achieve sales and profitability targets and manage store P&L
- Recruit, train and coach a team of 12 to 15 associates
- Deliver exceptional customer experience and visual merchandising standards
- Manage inventory, loss prevention and store operations

3+ years of retail management experience with a track record of developing people. Weekend and public holiday availability is required.`,
  },
  {
    company: 'Helio Retail Group', category: 'Sales',
    title: 'Sales Associate (Part-time)', location: 'Kuala Lumpur', type: 'PARTTIME', salary: 'RM 10 - 12 per hour',
    description: `Join the team at our Mid Valley store. Flexible shifts of 4 to 8 hours, ideal for students. You will greet customers, offer product advice, process transactions and keep the floor looking great. No experience needed; we provide full training. Commission on top of hourly pay.`,
  },
  {
    company: 'Helio Retail Group', category: 'Customer Service',
    title: 'Customer Experience Executive (E-commerce)', location: 'Petaling Jaya', type: 'FULLTIME', salary: 'RM 3,500 - 4,500',
    description: `Support customers of our online store through chat, email and social channels.

- Resolve order, delivery and return enquiries quickly and warmly
- Coordinate with warehouse and logistics partners on exceptions
- Log feedback and spot trends to improve the shopping experience
- Maintain response time and satisfaction targets

Strong communication in English and Bahasa Malaysia, a customer-first mindset and comfort with tools such as Shopify and Zendesk. Rotating shifts including some weekends.`,
  },
  {
    company: 'Helio Retail Group', category: 'Marketing',
    title: 'Brand Marketing Manager', location: 'Petaling Jaya', type: 'FULLTIME', salary: 'RM 9,000 - 12,000',
    description: `Shape the Helio brand across stores, digital and partnerships.

- Develop annual brand plans and seasonal campaigns
- Manage agency partners and a team of three marketers
- Own the marketing budget and measure campaign effectiveness
- Partner with merchandising and e-commerce on launches and promotions

6+ years of brand or integrated marketing experience, preferably in retail, fashion or consumer goods, with proven people leadership.`,
  },
  {
    company: 'Helio Retail Group', category: 'Information Technology',
    title: 'Data Analyst', location: 'Petaling Jaya', type: 'FULLTIME', salary: 'RM 5,500 - 7,500',
    description: `Turn sales, inventory and customer data into decisions.

- Build dashboards in Power BI for merchandising, store ops and e-commerce
- Write SQL against our data warehouse and maintain data models
- Run analyses on pricing, promotions, assortment and customer retention
- Present findings to business stakeholders in clear, actionable terms

2+ years of analytics experience, strong SQL, and comfort with Python or R. Retail experience is a plus.`,
  },
  {
    company: 'Helio Retail Group', category: 'Finance & Accounting',
    title: 'Finance Intern', location: 'Petaling Jaya', type: 'INTERNSHIP', salary: 'RM 1,200 - 1,500',
    description: `A 3 to 6 month internship in our group finance team. You will assist with store reconciliations, month-end close tasks, expense processing and ad hoc analysis. Open to students in accounting or finance. Good Excel skills and attention to detail are what we care about most.`,
  },
]

async function main() {
  const categories = await prisma.category.findMany()
  if (categories.length === 0) {
    throw new Error('No categories found. Run `node prisma/seedCategories.js` first.')
  }
  const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c]))

  const password = await bcrypt.hash(DEMO_PASSWORD, 10)
  const companyByName = {}

  for (const c of companies) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: c.ownerName,
        email: c.email,
        password,
        role: 'EMPLOYER',
      },
    })
    const company = await prisma.company.upsert({
      where: { ownerId: user.id },
      update: { description: c.description, website: c.website },
      create: {
        id: crypto.randomUUID(),
        name: c.name,
        description: c.description,
        website: c.website,
        ownerId: user.id,
      },
    })
    companyByName[c.name] = { user, company }
  }
  console.log(`${companies.length} employers and companies ready`)

  let created = 0
  let skipped = 0
  for (const j of jobs) {
    const { user, company } = companyByName[j.company]
    const category = categoryByName[j.category]
    if (!category) throw new Error(`Unknown category: ${j.category}`)

    const exists = await prisma.job.findFirst({
      where: { title: j.title, companyId: company.id },
      select: { id: true },
    })
    if (exists) {
      skipped++
      continue
    }

    await prisma.job.create({
      data: {
        id: crypto.randomUUID(),
        title: j.title,
        description: j.description,
        location: j.location,
        salary: j.salary,
        type: j.type,
        status: 'ACTIVE',
        employerId: user.id,
        companyId: company.id,
        categoryId: category.id,
      },
    })
    created++
  }
  console.log(`${created} jobs created, ${skipped} already existed`)
  console.log(`Demo employer login: ${companies[0].email} / ${DEMO_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
