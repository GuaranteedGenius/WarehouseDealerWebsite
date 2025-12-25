'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Input, Textarea, Button, Modal } from '@/components/ui'

interface ScheduleWalkthroughFormProps {
  propertyId: string
  propertyTitle: string
  isOpen: boolean
  onClose: () => void
}

export default function ScheduleWalkthroughForm({ propertyId, propertyTitle, isOpen, onClose }: ScheduleWalkthroughFormProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      propertyId,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      message: formData.get('message') as string,
      preferredDateTime: formData.get('preferredDateTime') as string,
      honeypot: formData.get('website') as string,
    }

    try {
      const res = await fetch('/api/leads/schedule-walkthrough', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.errors) {
          setErrors(result.errors)
        } else {
          toast.error(result.error || 'Failed to submit form')
        }
        return
      }

      setSuccess(true)
      toast.success('Walkthrough request sent!')
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setSuccess(false)
    setErrors({})
    onClose()
  }

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Walkthrough Requested!">
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Request Received!</h3>
          <p className="text-gray-600 mb-6">
            We&apos;ve received your walkthrough request for {propertyTitle}.
            Our team will contact you to confirm the scheduling details.
          </p>
          <Button onClick={handleClose}>Close</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Schedule a Walkthrough" size="lg">
      <p className="text-gray-600 mb-6">
        Ready to see <strong>{propertyTitle}</strong> in person? Fill out the form below and we&apos;ll coordinate a time.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot */}
        <div className="hidden" aria-hidden="true">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name *"
            name="name"
            required
            error={errors.name}
            placeholder="John Smith"
          />
          <Input
            label="Email *"
            name="email"
            type="email"
            required
            error={errors.email}
            placeholder="john@company.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone"
            name="phone"
            type="tel"
            error={errors.phone}
            placeholder="(555) 123-4567"
          />
          <Input
            label="Company"
            name="company"
            error={errors.company}
            placeholder="Your Company Name"
          />
        </div>

        <Input
          label="Preferred Date & Time *"
          name="preferredDateTime"
          required
          error={errors.preferredDateTime}
          placeholder="e.g., Tuesday Jan 15 at 2pm, or flexible weekday mornings"
          hint="Let us know your preferred times and we'll do our best to accommodate."
        />

        <Textarea
          label="Additional Notes *"
          name="message"
          required
          error={errors.message}
          placeholder="Any specific areas you'd like to see or questions you have..."
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Request Walkthrough
          </Button>
        </div>
      </form>
    </Modal>
  )
}
