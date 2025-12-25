'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Input, Textarea, Button } from '@/components/ui'

export default function ContactForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      message: formData.get('message') as string,
      honeypot: formData.get('website') as string,
    }

    try {
      const res = await fetch('/api/leads/contact', {
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

      toast.success('Message sent successfully! We\'ll be in touch soon.')
      router.push('/contact/thank-you')
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot field - hidden from users */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        placeholder="Tell us about your industrial space requirements..."
        rows={5}
      />

      <Button type="submit" loading={loading} className="w-full md:w-auto">
        Send Message
      </Button>
    </form>
  )
}
