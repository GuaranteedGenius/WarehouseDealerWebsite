'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatRelativeTime, getLeadTypeLabel } from '@/lib/utils'
import { StatusBadge, Select, EmptyState, NoLeadsIcon, Modal, Button } from '@/components/ui'
import { Lead, Property } from '@prisma/client'

type LeadWithProperty = Lead & {
  property: { id: string; title: string; slug: string } | null
}

interface LeadsTableProps {
  initialLeads: LeadWithProperty[]
}

export default function LeadsTable({ initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [filter, setFilter] = useState({ type: '', status: '' })
  const [selectedLead, setSelectedLead] = useState<LeadWithProperty | null>(null)

  const filteredLeads = leads.filter((lead) => {
    if (filter.type && lead.type !== filter.type) return false
    if (filter.status && lead.status !== filter.status) return false
    return true
  })

  async function updateLeadStatus(leadId: string, status: string) {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error('Failed to update')

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status } : l))
      )
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Contact', label: 'General Contact' },
    { value: 'RequestInfo', label: 'Info Request' },
    { value: 'ScheduleWalkthrough', label: 'Walkthrough' },
  ]

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'New', label: 'New' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Closed', label: 'Closed' },
  ]

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100">
        <EmptyState
          icon={<NoLeadsIcon />}
          title="No leads yet"
          description="Leads from contact forms and property inquiries will appear here"
        />
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <Select
            options={typeOptions}
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          />
        </div>
        <div className="w-48">
          <Select
            options={statusOptions}
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          />
        </div>
        <div className="flex-1" />
        <div className="text-sm text-gray-500 self-center">
          {filteredLeads.length} of {leads.length} leads
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                      {lead.company && (
                        <div className="text-sm text-gray-400">{lead.company}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {getLeadTypeLabel(lead.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {lead.property ? (
                      <Link
                        href={`/properties/${lead.property.slug}`}
                        target="_blank"
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        {lead.property.title}
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-sm">General inquiry</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      className="text-sm border-0 bg-transparent cursor-pointer focus:ring-0 p-0"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatRelativeTime(lead.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <Modal
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title="Lead Details"
        size="lg"
      >
        {selectedLead && (
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{selectedLead.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p>
                  <a href={`mailto:${selectedLead.email}`} className="text-primary-600 hover:text-primary-700">
                    {selectedLead.email}
                  </a>
                </p>
              </div>
              {selectedLead.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p>
                    <a href={`tel:${selectedLead.phone}`} className="text-primary-600 hover:text-primary-700">
                      {selectedLead.phone}
                    </a>
                  </p>
                </div>
              )}
              {selectedLead.company && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p className="text-gray-900">{selectedLead.company}</p>
                </div>
              )}
            </div>

            {/* Type & Property */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="text-sm font-medium text-gray-500">Inquiry Type</label>
                <p className="text-gray-900">{getLeadTypeLabel(selectedLead.type)}</p>
              </div>
              {selectedLead.property && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Property</label>
                  <p>
                    <Link
                      href={`/properties/${selectedLead.property.slug}`}
                      target="_blank"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {selectedLead.property.title}
                    </Link>
                  </p>
                </div>
              )}
            </div>

            {/* Preferred DateTime */}
            {selectedLead.preferredDateTime && (
              <div className="pt-4 border-t border-gray-100">
                <label className="text-sm font-medium text-gray-500">Preferred Date/Time</label>
                <p className="text-gray-900">{selectedLead.preferredDateTime}</p>
              </div>
            )}

            {/* Message */}
            <div className="pt-4 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-500">Message</label>
              <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedLead.message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-500">Status:</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => {
                    updateLeadStatus(selectedLead.id, e.target.value)
                    setSelectedLead({ ...selectedLead, status: e.target.value })
                  }}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <Button variant="ghost" onClick={() => setSelectedLead(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
