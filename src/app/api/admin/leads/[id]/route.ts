import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import { leadStatusUpdateSchema } from '@/lib/validations'
import { ZodError } from 'zod'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      property: true,
    },
  })

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  return NextResponse.json(lead)
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate
    const { status } = leadStatusUpdateSchema.parse(body)

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json(lead)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    console.error('Update lead error:', error)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.lead.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete lead error:', error)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
