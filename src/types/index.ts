import { Property, PropertyImage, Lead } from '@prisma/client'

export type { Property, PropertyImage, Lead }

// String literal types for SQLite compatibility
export type PropertyStatus = 'Available' | 'UnderContract' | 'Leased' | 'Sold'
export type LeaseOrSale = 'Lease' | 'Sale' | 'Both'
export type LeadType = 'Contact' | 'RequestInfo' | 'ScheduleWalkthrough'
export type LeadStatus = 'New' | 'Contacted' | 'Closed'

export type PropertyWithImages = Property & {
  images: PropertyImage[]
}

export type PropertyWithImagesAndLeads = Property & {
  images: PropertyImage[]
  leads: Lead[]
}

export type LeadWithProperty = Lead & {
  property: Property | null
}

export interface PropertyFilters {
  city?: string
  status?: PropertyStatus
  minSqft?: number
  maxSqft?: number
  leaseOrSale?: LeaseOrSale
  search?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
  honeypot?: string
}

export interface RequestInfoFormData extends ContactFormData {
  propertyId: string
}

export interface ScheduleWalkthroughFormData extends RequestInfoFormData {
  preferredDateTime: string
}

// Helper to parse highlights (handles both JSON string and parsed array)
export function parseHighlights(highlights: unknown): string[] {
  if (Array.isArray(highlights)) {
    return highlights as string[]
  }
  if (typeof highlights === 'string') {
    try {
      const parsed = JSON.parse(highlights)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}
