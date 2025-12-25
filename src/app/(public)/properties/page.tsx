import { Suspense } from 'react'
import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PropertyCard, PropertyFilters } from '@/components/properties'
import { Pagination, PageLoader, EmptyState, NoPropertiesIcon } from '@/components/ui'
import { parseSquareFeetRange } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Available Properties',
  description: 'Browse our selection of premium warehouse and industrial properties available for lease or sale.',
}

interface PropertiesPageProps {
  searchParams: { [key: string]: string | undefined }
}

async function getProperties(searchParams: PropertiesPageProps['searchParams']) {
  const page = parseInt(searchParams.page || '1')
  const limit = 9
  const skip = (page - 1) * limit

  const { min: minSqft, max: maxSqft } = parseSquareFeetRange(searchParams.size || '')

  const where = {
    status: 'Available',
    archived: false,
    ...(searchParams.city && { city: searchParams.city }),
    ...(searchParams.type && { leaseOrSale: searchParams.type }),
    ...(minSqft && { squareFeet: { gte: minSqft } }),
    ...(maxSqft && { squareFeet: { lte: maxSqft } }),
    ...(searchParams.search && {
      OR: [
        { title: { contains: searchParams.search, mode: 'insensitive' as const } },
        { address: { contains: searchParams.search, mode: 'insensitive' as const } },
        { city: { contains: searchParams.search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { images: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ])

  return {
    properties,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

async function getCities() {
  const cities = await prisma.property.groupBy({
    by: ['city'],
    where: { status: 'Available', archived: false },
    orderBy: { city: 'asc' },
  })
  return cities.map((c) => c.city)
}

function PropertiesGrid({ searchParams }: PropertiesPageProps) {
  return (
    <Suspense fallback={<PageLoader />}>
      <PropertiesGridContent searchParams={searchParams} />
    </Suspense>
  )
}

async function PropertiesGridContent({ searchParams }: PropertiesPageProps) {
  const { properties, total, page, totalPages } = await getProperties(searchParams)

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={<NoPropertiesIcon />}
        title="No properties found"
        description="Try adjusting your filters or search criteria"
        action={
          <Link href="/properties" className="btn-primary">
            Clear Filters
          </Link>
        }
      />
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing {properties.length} of {total} properties
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12">
          <PaginationWrapper currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </>
  )
}

function PaginationWrapper({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  return (
    <div className="flex justify-center">
      <nav className="flex items-center gap-1">
        {currentPage > 1 && (
          <Link
            href={`/properties?page=${currentPage - 1}`}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={`/properties?page=${page}`}
            className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
              page === currentPage
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {page}
          </Link>
        ))}

        {currentPage < totalPages && (
          <Link
            href={`/properties?page=${currentPage + 1}`}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </nav>
    </div>
  )
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const cities = await getCities()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Available Properties
          </h1>
          <p className="text-gray-600">
            Find your ideal warehouse or industrial space from our curated selection
          </p>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-32 bg-white rounded-xl animate-pulse" />}>
          <PropertyFilters cities={cities} />
        </Suspense>

        {/* Properties Grid */}
        <PropertiesGrid searchParams={searchParams} />
      </div>
    </div>
  )
}
