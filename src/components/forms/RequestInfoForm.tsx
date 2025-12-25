'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Input, Textarea, Button, Modal } from '@/components/ui'

interface RequestInfoFormProps {
  propertyId: string
  propertyTitle: string
  isOpen: boolean
  onClose: () => void
}

export default function RequestInfoForm({ propertyId, propertyTitle, isOpen, onClose }: RequestInfoFormProps) {
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
      honeypot: formData.get('website') as string,
    }

    try {
      const res = await fetch('/api/leads/request-info', {
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
      toast.success('Request sent successfully!')
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
      <Modal isOpen={isOpen} onClose={handleClose} title="Request Sent!">
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-6">
            We&apos;ve received your request for information about {propertyTitle}.
            Our team will be in touch shortly.
          </p>
          <Button onClick={handleClose}>Close</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request More Information" size="lg">
      <p className="text-gray-600 mb-6">
        Interested in <strong>{propertyTitle}</strong>? Fill out the form below and we&apos;ll get back to you with more details.
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

        <Textarea
          label="Message *"
          name="message"
          required
          error={errors.message}
          placeholder="Tell us about your requirements and any specific questions..."
          rows={4}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Send Request
          </Button>
        </div>
      </form>
    </Modal>
  )
}
