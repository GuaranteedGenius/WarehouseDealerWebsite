'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Input, Select, Button } from '@/components/ui'

interface PropertyFiltersProps {
  cities: string[]
}

const sizeRanges = [
  { value: '', label: 'Any Size' },
  { value: '0-25000', label: 'Under 25,000 SF' },
  { value: '25000-50000', label: '25,000 - 50,000 SF' },
  { value: '50000-100000', label: '50,000 - 100,000 SF' },
  { value: '100000-200000', label: '100,000 - 200,000 SF' },
  { value: '200000+', label: 'Over 200,000 SF' },
]

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'Lease', label: 'For Lease' },
  { value: 'Sale', label: 'For Sale' },
]

export default function PropertyFilters({ cities }: PropertyFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [size, setSize] = useState(searchParams.get('size') || '')
  const [type, setType] = useState(searchParams.get('type') || '')

  const cityOptions = [
    { value: '', label: 'All Cities' },
    ...cities.map((c) => ({ value: c, label: c })),
  ]

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (city) params.set('city', city)
    if (size) params.set('size', size)
    if (type) params.set('type', type)
    params.set('page', '1')

    router.push(`/properties?${params.toString()}`)
  }, [router, search, city, size, type])

  const clearFilters = useCallback(() => {
    setSearch('')
    setCity('')
    setSize('')
    setType('')
    router.push('/properties')
  }, [router])

  const hasFilters = search || city || size || type

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <Input
            placeholder="Search by title or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          />
        </div>

        <Select
          options={cityOptions}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Select City"
        />

        <Select
          options={sizeRanges}
          value={size}
          onChange={(e) => setSize(e.target.value)}
        />

        <Select
          options={typeOptions}
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          <Button onClick={applyFilters} size="sm">
            Apply Filters
          </Button>
          {hasFilters && (
            <Button onClick={clearFilters} variant="ghost" size="sm">
              Clear All
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
