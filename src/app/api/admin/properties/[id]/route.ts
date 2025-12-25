import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import { propertyUpdateSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/utils'
import { ZodError } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  return NextResponse.json(property)
}

export async function PUT(request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Validate
    const validatedData = propertyUpdateSchema.parse(body)

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    })

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Update slug if title changed
    let slug = existingProperty.slug
    if (validatedData.title && validatedData.title !== existingProperty.title) {
      const existingSlugs = (
        await prisma.property.findMany({
          where: { id: { not: id } },
          select: { slug: true },
        })
      ).map((p) => p.slug)

      slug = generateSlug(validatedData.title, existingSlugs)
    }

    // Update property
    const property = await prisma.property.update({
      where: { id },
      data: {
        ...validatedData,
        slug,
        availableDate: validatedData.availableDate
          ? new Date(validatedData.availableDate)
          : existingProperty.availableDate,
      },
    })

    // Update image order if provided
    if (body.images && Array.isArray(body.images)) {
      for (const img of body.images) {
        await prisma.propertyImage.update({
          where: { id: img.id },
          data: { sortOrder: img.sortOrder },
        })
      }
    }

    return NextResponse.json(property)
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

    console.error('Update property error:', error)
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const property = await prisma.property.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Patch property error:', error)
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.property.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete property error:', error)
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
  }
}
