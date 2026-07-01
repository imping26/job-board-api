const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

// 申请确认邮件
async function sendApplicationEmail({ to, applicantName, jobTitle, companyName }) {
  await resend.emails.send({
    from: 'JobBoard <onboarding@resend.dev>',  // 测试用域名
    to,
    subject: `Application received: ${jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Application Confirmed ✓</h2>
        <p>Hi ${applicantName},</p>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received.</p>
        <p>The employer will review your application and get back to you soon.</p>
        <p style="color: #888; font-size: 14px; margin-top: 24px;">— The JobBoard Team</p>
      </div>
    `,
  })
}

// 申请状态更新邮件(被 accept / reject)
async function sendStatusEmail({ to, applicantName, jobTitle, companyName, status }) {
  const isAccepted = status === 'ACCEPTED'

  await resend.emails.send({
    from: 'JobBoard <onboarding@resend.dev>',
    to,
    subject: isAccepted
      ? `Good news about your application: ${jobTitle}`
      : `Update on your application: ${jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>${isAccepted ? 'Congratulations! 🎉' : 'Application Update'}</h2>
        <p>Hi ${applicantName},</p>
        <p>
          ${isAccepted
            ? `Great news! Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been <strong style="color: #16a34a;">accepted</strong>.`
            : `Thank you for your interest in <strong>${jobTitle}</strong> at <strong>${companyName}</strong>. After careful consideration, we've decided to move forward with other candidates.`
          }
        </p>
        <p style="color: #888; font-size: 14px; margin-top: 24px;">— The JobBoard Team</p>
      </div>
    `,
  })
}

module.exports = { sendApplicationEmail, sendStatusEmail }