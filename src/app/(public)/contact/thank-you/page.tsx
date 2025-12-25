import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Thank you for contacting Industrial Realty Partners.',
}

export default function ThankYouPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="container-custom">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">
            Thank You!
          </h1>

          <p className="text-gray-600 mb-8">
            We&apos;ve received your message and will get back to you within 24 hours.
            In the meantime, feel free to browse our available properties.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button>Browse Properties</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
