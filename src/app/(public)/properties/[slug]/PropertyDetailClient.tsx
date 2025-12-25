'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { RequestInfoForm, ScheduleWalkthroughForm } from '@/components/forms'

interface PropertyDetailClientProps {
  propertyId: string
  propertyTitle: string
}

export default function PropertyDetailClient({ propertyId, propertyTitle }: PropertyDetailClientProps) {
  const [requestInfoOpen, setRequestInfoOpen] = useState(false)
  const [walkthroughOpen, setWalkthroughOpen] = useState(false)

  return (
    <>
      <div className="space-y-3">
        <Button
          onClick={() => setRequestInfoOpen(true)}
          className="w-full"
        >
          Request More Info
        </Button>
        <Button
          onClick={() => setWalkthroughOpen(true)}
          variant="outline"
          className="w-full"
        >
          Schedule a Walkthrough
        </Button>
      </div>

      <RequestInfoForm
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        isOpen={requestInfoOpen}
        onClose={() => setRequestInfoOpen(false)}
      />

      <ScheduleWalkthroughForm
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        isOpen={walkthroughOpen}
        onClose={() => setWalkthroughOpen(false)}
      />
    </>
  )
}
