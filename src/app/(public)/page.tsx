import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'
import { PropertyCard } from '@/components/properties'
import { Button } from '@/components/ui'

export const dynamic = 'force-dynamic'

async function getFeaturedProperties() {
  const properties = await prisma.property.findMany({
    where: {
      status: 'Available',
      featured: true,
      archived: false,
    },
    include: { images: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })
  return properties
}

async function getStats() {
  const [total, available, cities] = await Promise.all([
    prisma.property.count({ where: { archived: false } }),
    prisma.property.count({ where: { status: 'Available', archived: false } }),
    prisma.property.groupBy({
      by: ['city'],
      where: { archived: false },
      _count: true,
    }),
  ])

  return { total, available, cityCount: cities.length }
}

export default async function HomePage() {
  const [featuredProperties, stats] = await Promise.all([
    getFeaturedProperties(),
    getStats(),
  ])

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Modern warehouse facility"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-industrial-950/95 via-industrial-900/80 to-industrial-900/60" />
        </div>

        <div className="container-custom relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {stats.available} Properties Available
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Premium Industrial &
              <span className="text-primary-400"> Warehouse Space</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              Your trusted partner for finding the perfect distribution center, warehouse, or manufacturing facility.
              We specialize in industrial real estate that powers your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/properties" className="btn-primary btn-lg">
                Browse Properties
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/contact" className="btn btn-lg bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20">
                Contact Us
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/10">
              <div>
                <div className="font-display text-3xl font-bold text-white">{stats.total}+</div>
                <div className="text-gray-400 text-sm">Total Properties</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-white">{stats.cityCount}</div>
                <div className="text-gray-400 text-sm">Markets Served</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-white">25+</div>
                <div className="text-gray-400 text-sm">Years Experience</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
                Featured Properties
              </h2>
              <p className="text-gray-600 mt-2">
                Handpicked industrial spaces ready for immediate occupancy
              </p>
            </div>
            <Link href="/properties" className="btn-outline">
              View All Properties
            </Link>
          </div>

          {featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No featured properties available at the moment.</p>
              <Link href="/properties" className="btn-primary mt-4">
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
                About Us
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Industry Expertise You Can Trust
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                With over 25 years of experience in industrial real estate, we understand what it takes
                to find the perfect warehouse or distribution facility for your operations.
              </p>
              <p className="text-gray-600 mb-8">
                Our team specializes in connecting businesses with premium industrial spaces that meet
                their exact specifications—from clear heights and dock configurations to location and
                accessibility requirements.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Expert Knowledge</div>
                    <div className="text-sm text-gray-500">Deep market insights</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Client Focused</div>
                    <div className="text-sm text-gray-500">Your needs first</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Fast Results</div>
                    <div className="text-sm text-gray-500">Quick turnaround</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Best Value</div>
                    <div className="text-sm text-gray-500">Competitive rates</div>
                  </div>
                </div>
              </div>

              <Link href="/contact" className="btn-primary mt-8">
                Get in Touch
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Warehouse interior with organized inventory"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-primary-600 rounded-2xl -z-10" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent-500/20 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="section bg-industrial-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Industrial Space Solutions
            </h2>
            <p className="text-gray-400">
              We offer a wide range of industrial properties to meet your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Distribution Centers',
                description: 'High-throughput facilities designed for efficient logistics operations',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                ),
              },
              {
                title: 'Warehouses',
                description: 'Flexible storage solutions with various clear heights and configurations',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
              },
              {
                title: 'Manufacturing',
                description: 'Purpose-built facilities for production and assembly operations',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                title: 'Flex Space',
                description: 'Versatile properties combining warehouse, office, and showroom',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                ),
              },
            ].map((type, index) => (
              <div
                key={type.title}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 mb-4">
                  {type.icon}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{type.title}</h3>
                <p className="text-gray-400 text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary-600">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Find Your Perfect Space?
            </h2>
            <p className="text-primary-100 text-lg mb-8">
              Let us help you find the industrial property that fits your exact requirements.
              Contact us today for a personalized consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/properties" className="btn-lg bg-white text-primary-600 hover:bg-gray-100">
                View Properties
              </Link>
              <Link href="/contact" className="btn-lg bg-primary-700 text-white hover:bg-primary-800 border border-primary-500">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
