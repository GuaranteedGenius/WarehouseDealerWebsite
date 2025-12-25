import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatNumber, formatRelativeTime, getLeadTypeLabel } from '@/lib/utils'
import { StatusBadge } from '@/components/ui'
import Card from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

async function getStats() {
  const [
    totalProperties,
    availableProperties,
    totalLeads,
    newLeads,
    recentLeads,
    recentProperties,
  ] = await Promise.all([
    prisma.property.count({ where: { archived: false } }),
    prisma.property.count({ where: { status: 'Available', archived: false } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'New' } }),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { property: { select: { title: true, slug: true } } },
    }),
    prisma.property.findMany({
      take: 5,
      where: { archived: false },
      orderBy: { createdAt: 'desc' },
      include: { images: { take: 1 } },
    }),
  ])

  return {
    totalProperties,
    availableProperties,
    totalLeads,
    newLeads,
    recentLeads,
    recentProperties,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your property listings and leads</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalProperties}</div>
              <div className="text-sm text-gray-500">Total Properties</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.availableProperties}</div>
              <div className="text-sm text-gray-500">Available</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalLeads}</div>
              <div className="text-sm text-gray-500">Total Leads</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.newLeads}</div>
              <div className="text-sm text-gray-500">New Leads</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <Card padding="none">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-display font-semibold text-gray-900">Recent Leads</h2>
            <Link href="/admin/leads" className="text-sm text-primary-600 hover:text-primary-700">
              View all &rarr;
            </Link>
          </div>
          {stats.recentLeads.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {stats.recentLeads.map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/admin/leads?id=${lead.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{lead.name}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {getLeadTypeLabel(lead.type)}
                        {lead.property && ` - ${lead.property.title}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={lead.status} />
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(lead.createdAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No leads yet
            </div>
          )}
        </Card>

        {/* Recent Properties */}
        <Card padding="none">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-display font-semibold text-gray-900">Recent Properties</h2>
            <Link href="/admin/properties" className="text-sm text-primary-600 hover:text-primary-700">
              View all &rarr;
            </Link>
          </div>
          {stats.recentProperties.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {stats.recentProperties.map((property) => (
                <li key={property.id}>
                  <Link
                    href={`/admin/properties/${property.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {property.images[0] ? (
                        <img
                          src={property.images[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{property.title}</div>
                      <div className="text-sm text-gray-500">
                        {formatNumber(property.squareFeet)} SF &middot; {property.city}
                      </div>
                    </div>
                    <StatusBadge status={property.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No properties yet
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="font-display font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Property
          </Link>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View All Leads
          </Link>
        </div>
      </Card>
    </div>
  )
}
