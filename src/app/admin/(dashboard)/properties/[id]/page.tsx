import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import PropertyForm from '../PropertyForm'

export const dynamic = 'force-dynamic'

interface EditPropertyPageProps {
  params: { id: string }
}

async function getProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })
  return property
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const property = await getProperty(params.id)

  if (!property) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Edit Property</h1>
        <p className="text-gray-500 mt-1">{property.title}</p>
      </div>

      <PropertyForm property={property} />
    </div>
  )
}
