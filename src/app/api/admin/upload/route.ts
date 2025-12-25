import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import { uploadFile } from '@/lib/storage'

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const propertyId = formData.get('propertyId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { url, key } = await uploadFile(buffer, file.name, file.type)

    // If propertyId is provided, create image record in database
    if (propertyId) {
      const lastImage = await prisma.propertyImage.findFirst({
        where: { propertyId },
        orderBy: { sortOrder: 'desc' },
      })

      const sortOrder = (lastImage?.sortOrder ?? -1) + 1

      const image = await prisma.propertyImage.create({
        data: {
          url,
          propertyId,
          sortOrder,
        },
      })

      return NextResponse.json(image, { status: 201 })
    }

    // If no propertyId, return URL for temporary use (will be linked when property is created)
    return NextResponse.json({
      id: `temp-${Date.now()}`,
      url,
      sortOrder: 0,
      propertyId: null
    }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
