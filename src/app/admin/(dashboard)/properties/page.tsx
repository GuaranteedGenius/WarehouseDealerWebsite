import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatNumber, formatDateShort } from '@/lib/utils'
import { StatusBadge, Button } from '@/components/ui'
import PropertiesTable from './PropertiesTable'

export const dynamic = 'force-dynamic'

async function getProperties() {
  const properties = await prisma.property.findMany({
    where: { archived: false },
    include: {
      images: { take: 1, orderBy: { sortOrder: 'asc' } },
      _count: { select: { leads: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return properties
}

export default async function AdminPropertiesPage() {
  const properties = await getProperties()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">Manage your property listings</p>
        </div>
        <Link href="/admin/properties/new">
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Property
          </Button>
        </Link>
      </div>

      {/* Properties Table */}
      <PropertiesTable initialProperties={properties} />
    </div>
  )
}
