import { prisma } from '@/lib/db'
import LeadsTable from './LeadsTable'

export const dynamic = 'force-dynamic'

async function getLeads() {
  const leads = await prisma.lead.findMany({
    include: {
      property: {
        select: { id: true, title: true, slug: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return leads
}

export default async function AdminLeadsPage() {
  const leads = await getLeads()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-500 mt-1">View and manage inbound inquiries</p>
      </div>

      {/* Leads Table */}
      <LeadsTable initialLeads={leads} />
    </div>
  )
}
