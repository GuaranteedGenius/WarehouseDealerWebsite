import nodemailer from 'nodemailer'
import { Lead, Property } from '@prisma/client'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function getLeadTypeLabel(type: string): string {
  switch (type) {
    case 'Contact':
      return 'General Contact'
    case 'RequestInfo':
      return 'Information Request'
    case 'ScheduleWalkthrough':
      return 'Walkthrough Request'
    default:
      return type
  }
}

export async function sendLeadNotification(
  lead: Lead,
  property?: Property | null
): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.NOTIFY_TO_EMAIL) {
    console.log('Email not configured, skipping notification')
    return false
  }

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Industrial Realty Partners'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const propertyInfo = property
    ? `
    <h3>Property Details</h3>
    <p><strong>Title:</strong> ${property.title}</p>
    <p><strong>Address:</strong> ${property.address}, ${property.city}, ${property.state} ${property.zip}</p>
    <p><strong>View Property:</strong> <a href="${appUrl}/properties/${property.slug}">${appUrl}/properties/${property.slug}</a></p>
    `
    : '<p><em>General inquiry - not property-specific</em></p>'

  const walkthroughInfo =
    lead.type === 'ScheduleWalkthrough' && lead.preferredDateTime
      ? `<p><strong>Preferred Date/Time:</strong> ${lead.preferredDateTime}</p>`
      : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0070c4; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .lead-info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        h3 { color: #0070c4; margin-top: 20px; }
        a { color: #0070c4; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Lead: ${getLeadTypeLabel(lead.type)}</h1>
        </div>
        <div class="content">
          <div class="lead-info">
            <h3>Contact Information</h3>
            <p><strong>Name:</strong> ${lead.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
            ${lead.phone ? `<p><strong>Phone:</strong> ${lead.phone}</p>` : ''}
            ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ''}
            ${walkthroughInfo}
            <h3>Message</h3>
            <p>${lead.message.replace(/\n/g, '<br>')}</p>
          </div>
          ${propertyInfo}
          <p style="margin-top: 20px;">
            <a href="${appUrl}/admin/leads">View all leads in admin dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>This email was sent from ${siteName}</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"${siteName}" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_TO_EMAIL,
      subject: `New ${getLeadTypeLabel(lead.type)} from ${lead.name}`,
      html,
    })
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
