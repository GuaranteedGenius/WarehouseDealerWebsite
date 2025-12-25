import Link from 'next/link'
import Image from 'next/image'
import { PropertyWithImages } from '@/types'
import { formatNumber, getLeaseOrSaleLabel, getStatusColor } from '@/lib/utils'
import { StatusBadge } from '@/components/ui'

interface PropertyCardProps {
  property: PropertyWithImages
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images.sort((a, b) => a.sortOrder - b.sortOrder)[0]

  return (
    <Link href={`/properties/${property.slug}`} className="group block">
      <div className="card overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage.url}
              alt={mainImage.alt || property.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <StatusBadge status={property.status} />
            {property.featured && (
              <span className="badge bg-accent-500 text-white">Featured</span>
            )}
          </div>

          {/* Lease/Sale Badge */}
          <div className="absolute top-3 right-3">
            <span className="badge bg-industrial-900/80 text-white backdrop-blur-sm">
              {getLeaseOrSaleLabel(property.leaseOrSale)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {property.title}
          </h3>

          <p className="text-gray-500 text-sm mt-1 line-clamp-1">
            {property.address}, {property.city}, {property.state}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{formatNumber(property.squareFeet)} SF</span>
            </div>

            {property.clearHeight && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span>{property.clearHeight}</span>
              </div>
            )}

            {property.dockDoors > 0 && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{property.dockDoors} Docks</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="font-semibold text-primary-600">
              {property.priceOrRate || 'Call for Pricing'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
