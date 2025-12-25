'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { Input, Textarea, Select, Button, Card } from '@/components/ui'
import { Property, PropertyImage } from '@prisma/client'
import { parseHighlights } from '@/types'

type PropertyWithImages = Property & { images: PropertyImage[] }

interface PropertyFormProps {
  property?: PropertyWithImages
}

const statusOptions = [
  { value: 'Available', label: 'Available' },
  { value: 'UnderContract', label: 'Under Contract' },
  { value: 'Leased', label: 'Leased' },
  { value: 'Sold', label: 'Sold' },
]

const leaseOrSaleOptions = [
  { value: 'Lease', label: 'For Lease' },
  { value: 'Sale', label: 'For Sale' },
  { value: 'Both', label: 'For Lease or Sale' },
]

export default function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [images, setImages] = useState<PropertyImage[]>(property?.images || [])
  const [uploading, setUploading] = useState(false)
  const [highlights, setHighlights] = useState<string[]>(() => {
    const parsed = property?.highlights ? parseHighlights(property.highlights) : []
    return parsed.length > 0 ? parsed : ['']
  })

  const isEdit = Boolean(property)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        if (property?.id) {
          formData.append('propertyId', property.id)
        }

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) throw new Error('Upload failed')

        const newImage = await res.json()
        setImages((prev) => [...prev, newImage])
      }
      toast.success('Images uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }, [property?.id])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)

    const data = {
      title: formData.get('title') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip: formData.get('zip') as string,
      description: formData.get('description') as string,
      squareFeet: parseInt(formData.get('squareFeet') as string) || 0,
      clearHeight: formData.get('clearHeight') as string || null,
      dockDoors: parseInt(formData.get('dockDoors') as string) || 0,
      driveInDoors: parseInt(formData.get('driveInDoors') as string) || 0,
      acreage: parseFloat(formData.get('acreage') as string) || null,
      leaseOrSale: formData.get('leaseOrSale') as string,
      priceOrRate: formData.get('priceOrRate') as string || null,
      availableDate: formData.get('availableDate') as string || null,
      highlights: highlights.filter((h) => h.trim() !== ''),
      status: formData.get('status') as string,
      featured: formData.get('featured') === 'on',
      images: images.map((img, index) => ({ id: img.id, sortOrder: index })),
    }

    try {
      const url = isEdit && property ? `/api/admin/properties/${property.id}` : '/api/admin/properties'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.errors) {
          setErrors(result.errors)
        } else {
          toast.error(result.error || 'Failed to save property')
        }
        return
      }

      toast.success(isEdit ? 'Property updated!' : 'Property created!')
      router.push('/admin/properties')
      router.refresh()
    } catch (error) {
      toast.error('Failed to save property')
    } finally {
      setLoading(false)
    }
  }

  function handleRemoveImage(imageId: string) {
    setImages((prev) => prev.filter((img) => img.id !== imageId))
    // Note: In production, you might want to also delete from storage
  }

  function moveImage(index: number, direction: 'up' | 'down') {
    const newImages = [...images]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newImages.length) return
    ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
    setImages(newImages)
  }

  function addHighlight() {
    setHighlights((prev) => [...prev, ''])
  }

  function removeHighlight(index: number) {
    setHighlights((prev) => prev.filter((_, i) => i !== index))
  }

  function updateHighlight(index: number, value: string) {
    setHighlights((prev) => prev.map((h, i) => (i === index ? value : h)))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="font-display font-semibold text-lg text-gray-900 mb-6">Basic Information</h2>
        <div className="grid gap-6">
          <Input
            label="Property Title *"
            name="title"
            defaultValue={property?.title}
            error={errors.title}
            placeholder="e.g., Class A Warehouse – 120,000 SF"
          />

          <Textarea
            label="Description *"
            name="description"
            defaultValue={property?.description}
            error={errors.description}
            rows={5}
            placeholder="Describe the property features, location benefits, and key selling points..."
          />

          <div className="grid md:grid-cols-2 gap-6">
            <Select
              label="Status"
              name="status"
              options={statusOptions}
              defaultValue={property?.status || 'Available'}
            />

            <Select
              label="Listing Type"
              name="leaseOrSale"
              options={leaseOrSaleOptions}
              defaultValue={property?.leaseOrSale || 'Lease'}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              defaultChecked={property?.featured}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">
              Featured Property (shown prominently on homepage)
            </label>
          </div>
        </div>
      </Card>

      {/* Location */}
      <Card className="p-6">
        <h2 className="font-display font-semibold text-lg text-gray-900 mb-6">Location</h2>
        <div className="grid gap-6">
          <Input
            label="Street Address *"
            name="address"
            defaultValue={property?.address}
            error={errors.address}
            placeholder="123 Industrial Boulevard"
          />

          <div className="grid md:grid-cols-3 gap-6">
            <Input
              label="City *"
              name="city"
              defaultValue={property?.city}
              error={errors.city}
              placeholder="Houston"
            />

            <Input
              label="State *"
              name="state"
              defaultValue={property?.state}
              error={errors.state}
              placeholder="TX"
            />

            <Input
              label="ZIP Code *"
              name="zip"
              defaultValue={property?.zip}
              error={errors.zip}
              placeholder="77001"
            />
          </div>
        </div>
      </Card>

      {/* Property Details */}
      <Card className="p-6">
        <h2 className="font-display font-semibold text-lg text-gray-900 mb-6">Property Details</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            label="Square Feet *"
            name="squareFeet"
            type="number"
            defaultValue={property?.squareFeet}
            error={errors.squareFeet}
            placeholder="120000"
          />

          <Input
            label="Clear Height"
            name="clearHeight"
            defaultValue={property?.clearHeight || ''}
            placeholder="32' Clear"
          />

          <Input
            label="Dock Doors"
            name="dockDoors"
            type="number"
            defaultValue={property?.dockDoors || 0}
            placeholder="24"
          />

          <Input
            label="Drive-In Doors"
            name="driveInDoors"
            type="number"
            defaultValue={property?.driveInDoors || 0}
            placeholder="2"
          />

          <Input
            label="Acreage"
            name="acreage"
            type="number"
            step="0.01"
            defaultValue={property?.acreage || ''}
            placeholder="12.5"
          />

          <Input
            label="Price / Rate"
            name="priceOrRate"
            defaultValue={property?.priceOrRate || ''}
            placeholder="$6.50/SF NNN or Call for Pricing"
          />

          <Input
            label="Available Date"
            name="availableDate"
            type="date"
            defaultValue={property?.availableDate?.toString().split('T')[0] || ''}
          />
        </div>
      </Card>

      {/* Highlights */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-lg text-gray-900">Property Highlights</h2>
          <Button type="button" variant="ghost" size="sm" onClick={addHighlight}>
            + Add Highlight
          </Button>
        </div>
        <div className="space-y-3">
          {highlights.map((highlight, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={highlight}
                onChange={(e) => updateHighlight(index, e.target.value)}
                placeholder="e.g., ESFR sprinkler system"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeHighlight(index)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Images */}
      <Card className="p-6">
        <h2 className="font-display font-semibold text-lg text-gray-900 mb-6">Property Images</h2>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {uploading ? (
            <p className="text-gray-600">Uploading...</p>
          ) : isDragActive ? (
            <p className="text-primary-600">Drop images here...</p>
          ) : (
            <>
              <p className="text-gray-600 mb-1">Drag & drop images here, or click to select</p>
              <p className="text-sm text-gray-400">Max 10MB per file. JPG, PNG, WebP</p>
            </>
          )}
        </div>

        {/* Image List */}
        {images.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={image.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'up')}
                      className="p-1.5 bg-white rounded text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'down')}
                      className="p-1.5 bg-white rounded text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    className="p-1.5 bg-red-500 rounded text-white hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {index === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? 'Save Changes' : 'Create Property'}
        </Button>
      </div>
    </form>
  )
}
