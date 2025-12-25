import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { scheduleWalkthroughFormSchema } from '@/lib/validations'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { sendLeadNotification } from '@/lib/email'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const { allowed, remaining } = await checkRateLimit(ip)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate form data
    const validatedData = scheduleWalkthroughFormSchema.parse(body)

    // Check honeypot
    if (validatedData.honeypot) {
      return NextResponse.json({ success: true })
    }

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        type: 'ScheduleWalkthrough',
        propertyId: validatedData.propertyId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        company: validatedData.company || null,
        message: validatedData.message,
        preferredDateTime: validatedData.preferredDateTime,
      },
    })

    // Send email notification
    await sendLeadNotification(lead, property)

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message
        }
      })
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 })
    }

    console.error('Schedule walkthrough form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit form. Please try again.' },
      { status: 500 }
    )
  }
}
