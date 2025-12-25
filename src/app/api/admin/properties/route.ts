import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import { propertySchema } from '@/lib/validations'
import { generateSlug } from '@/lib/utils'
import { ZodError } from 'zod'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const properties = await prisma.property.findMany({
    where: { archived: false },
    include: { images: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(properties)
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate
    const validatedData = propertySchema.parse(body)

    // Generate unique slug
    const existingSlugs = (
      await prisma.property.findMany({
        select: { slug: true },
      })
    ).map((p) => p.slug)

    const slug = generateSlug(validatedData.title, existingSlugs)

    // Create property
    const property = await prisma.property.create({
      data: {
        ...validatedData,
        slug,
        availableDate: validatedData.availableDate ? new Date(validatedData.availableDate) : null,
      },
    })

    // Update image associations if provided
    if (body.images && Array.isArray(body.images)) {
      for (const img of body.images) {
        await prisma.propertyImage.update({
          where: { id: img.id },
          data: { propertyId: property.id, sortOrder: img.sortOrder },
        })
      }
    }

    return NextResponse.json(property, { status: 201 })
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

    console.error('Create property error:', error)
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
  }
}
