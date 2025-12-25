import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { PropertyGallery } from '@/components/properties'
import { StatusBadge } from '@/components/ui'
import { formatNumber, getLeaseOrSaleLabel, formatDate } from '@/lib/utils'
import { parseHighlights } from '@/types'
import PropertyDetailClient from './PropertyDetailClient'

export const dynamic = 'force-dynamic'

interface PropertyPageProps {
  params: Promise<{ slug: string }>
}

async function getProperty(slug: string) {
  const property = await prisma.property.findUnique({
    where: { slug },
    include: { images: true },
  })
  return property
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params
  const property = await getProperty(slug)

  if (!property) {
    return { title: 'Property Not Found' }
  }

  return {
    title: property.title,
    description: `${property.title} - ${formatNumber(property.squareFeet)} SF industrial property in ${property.city}, ${property.state}. ${property.description.slice(0, 150)}...`,
    openGraph: {
      title: property.title,
      description: `${formatNumber(property.squareFeet)} SF ${getLeaseOrSaleLabel(property.leaseOrSale).toLowerCase()} in ${property.city}, ${property.state}`,
      images: property.images[0]?.url ? [{ url: property.images[0].url }] : [],
    },
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params
  const property = await getProperty(slug)

  if (!property) {
    notFound()
  }

  const isAvailable = property.status === 'Available'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/properties" className="text-gray-500 hover:text-gray-700">
              Properties
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium truncate max-w-xs">{property.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <PropertyGallery images={property.images} title={property.title} />

            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <StatusBadge status={property.status} />
                <span className="badge bg-primary-100 text-primary-700">
                  {getLeaseOrSaleLabel(property.leaseOrSale)}
                </span>
                {property.featured && (
                  <span className="badge bg-accent-100 text-accent-700">Featured</span>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {property.title}
              </h1>
              <p className="text-gray-600 text-lg">
                {property.address}, {property.city}, {property.state} {property.zip}
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Size</div>
                <div className="font-semibold text-gray-900">{formatNumber(property.squareFeet)} SF</div>
              </div>
              {property.clearHeight && (
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Clear Height</div>
                  <div className="font-semibold text-gray-900">{property.clearHeight}</div>
                </div>
              )}
              {property.dockDoors > 0 && (
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Dock Doors</div>
                  <div className="font-semibold text-gray-900">{property.dockDoors}</div>
                </div>
              )}
              {property.driveInDoors > 0 && (
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Drive-In Doors</div>
                  <div className="font-semibold text-gray-900">{property.driveInDoors}</div>
                </div>
              )}
              {property.acreage && (
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Acreage</div>
                  <div className="font-semibold text-gray-900">{property.acreage} acres</div>
                </div>
              )}
              {property.availableDate && (
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Available</div>
                  <div className="font-semibold text-gray-900">{formatDate(property.availableDate)}</div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose prose-gray max-w-none">
                {property.description.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Highlights */}
            {(() => {
              const highlights = parseHighlights(property.highlights)
              return highlights.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h2 className="font-display text-xl font-semibold text-gray-900 mb-4">Property Highlights</h2>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">
                  {property.leaseOrSale === 'Lease' ? 'Lease Rate' : property.leaseOrSale === 'Sale' ? 'Sale Price' : 'Price / Rate'}
                </div>
                <div className="font-display text-2xl font-bold text-primary-600 mb-6">
                  {property.priceOrRate || 'Call for Pricing'}
                </div>

                {isAvailable ? (
                  <PropertyDetailClient propertyId={property.id} propertyTitle={property.title} />
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">This property is {property.status.toLowerCase()}</p>
                  </div>
                )}
              </div>

              {/* Brochure Download */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Property Brochure</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Download our detailed property brochure with specifications and floor plans.
                </p>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Brochure
                </button>
              </div>

              {/* Contact Card */}
              <div className="bg-industrial-900 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2">Have Questions?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Our team is here to help you find the right industrial space.
                </p>
                <div className="space-y-3">
                  <a href="tel:+15551234567" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    (555) 123-4567
                  </a>
                  <a href="mailto:info@industrialrealty.com" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@industrialrealty.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
