'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatNumber, formatDateShort } from '@/lib/utils'
import { StatusBadge, Button, ConfirmModal, EmptyState, NoPropertiesIcon } from '@/components/ui'
import { Property, PropertyImage } from '@prisma/client'

type PropertyWithRelations = Property & {
  images: PropertyImage[]
  _count: { leads: number }
}

interface PropertiesTableProps {
  initialProperties: PropertyWithRelations[]
}

export default function PropertiesTable({ initialProperties }: PropertiesTableProps) {
  const router = useRouter()
  const [properties, setProperties] = useState(initialProperties)
  const [archiveModal, setArchiveModal] = useState<{ open: boolean; property: PropertyWithRelations | null }>({
    open: false,
    property: null,
  })
  const [loading, setLoading] = useState(false)

  async function handleArchive() {
    if (!archiveModal.property) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/properties/${archiveModal.property.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      })

      if (!res.ok) throw new Error('Failed to archive property')

      toast.success('Property archived')
      setProperties((prev) => prev.filter((p) => p.id !== archiveModal.property?.id))
      setArchiveModal({ open: false, property: null })
    } catch (error) {
      toast.error('Failed to archive property')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(propertyId: string, status: string) {
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      toast.success('Status updated')
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, status: status as any } : p))
      )
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100">
        <EmptyState
          icon={<NoPropertiesIcon />}
          title="No properties yet"
          description="Get started by adding your first property listing"
          action={
            <Link href="/admin/properties/new">
              <Button>Add Property</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leads
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
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
                      <div>
                        <Link
                          href={`/admin/properties/${property.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {property.title}
                        </Link>
                        {property.featured && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-100 text-accent-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {property.city}, {property.state}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatNumber(property.squareFeet)} SF
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={property.status}
                      onChange={(e) => handleStatusChange(property.id, e.target.value)}
                      className="text-sm border-0 bg-transparent cursor-pointer focus:ring-0 p-0"
                    >
                      <option value="Available">Available</option>
                      <option value="UnderContract">Under Contract</option>
                      <option value="Leased">Leased</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {property._count.leads}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDateShort(property.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/properties/${property.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View on site"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/properties/${property.id}`}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => setArchiveModal({ open: true, property })}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Archive"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={archiveModal.open}
        onClose={() => setArchiveModal({ open: false, property: null })}
        onConfirm={handleArchive}
        title="Archive Property"
        message={`Are you sure you want to archive "${archiveModal.property?.title}"? This will hide it from the public site.`}
        confirmText="Archive"
        loading={loading}
      />
    </>
  )
}
