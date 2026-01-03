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

    // Check that all images have valid URLs (were successfully uploaded)
    const images = body.images as Array<{ id: string; url: string; sortOrder: number }> | undefined
    if (images && images.length > 0) {
      const failedImages = images.filter(img => !img.url || img.url.trim() === '')
      if (failedImages.length > 0) {
        return NextResponse.json({
          error: 'Some images failed to upload. Please remove failed images and try again.',
          errors: { images: 'One or more images failed to upload' }
        }, { status: 400 })
      }
    }

    // Generate unique slug
    const existingSlugs = (
      await prisma.property.findMany({
        select: { slug: true },
      })
    ).map((p) => p.slug)

    const slug = generateSlug(validatedData.title, existingSlugs)

    // Use a transaction to ensure property and images are created together
    const property = await prisma.$transaction(async (tx) => {
      // Create property
      const newProperty = await tx.property.create({
        data: {
          ...validatedData,
          slug,
          availableDate: validatedData.availableDate ? new Date(validatedData.availableDate) : null,
        },
      })

      // Create or update image associations if provided
      if (images && images.length > 0) {
        for (const img of images) {
          // Check if this is a temp ID (new image) or existing image
          if (img.id.startsWith('temp-')) {
            // Create new image record
            await tx.propertyImage.create({
              data: {
                url: img.url,
                propertyId: newProperty.id,
                sortOrder: img.sortOrder,
              },
            })
          } else {
            // Update existing image
            await tx.propertyImage.update({
              where: { id: img.id },
              data: { propertyId: newProperty.id, sortOrder: img.sortOrder },
            })
          }
        }
      }

      return newProperty
    })

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
