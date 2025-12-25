import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return formatDateShort(d)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateSlug(title: string, existingSlugs: string[] = []): string {
  let slug = slugify(title)
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${slugify(title)}-${counter}`
    counter++
  }

  return slug
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Available':
      return 'bg-green-100 text-green-800'
    case 'UnderContract':
      return 'bg-yellow-100 text-yellow-800'
    case 'Leased':
      return 'bg-blue-100 text-blue-800'
    case 'Sold':
      return 'bg-gray-100 text-gray-800'
    case 'New':
      return 'bg-blue-100 text-blue-800'
    case 'Contacted':
      return 'bg-yellow-100 text-yellow-800'
    case 'Closed':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getLeaseOrSaleLabel(type: string): string {
  switch (type) {
    case 'Lease':
      return 'For Lease'
    case 'Sale':
      return 'For Sale'
    case 'Both':
      return 'For Lease or Sale'
    default:
      return type
  }
}

export function getLeadTypeLabel(type: string): string {
  switch (type) {
    case 'Contact':
      return 'General Contact'
    case 'RequestInfo':
      return 'Info Request'
    case 'ScheduleWalkthrough':
      return 'Walkthrough'
    default:
      return type
  }
}

export function parseSquareFeetRange(range: string): { min?: number; max?: number } {
  const ranges: Record<string, { min?: number; max?: number }> = {
    '0-25000': { max: 25000 },
    '25000-50000': { min: 25000, max: 50000 },
    '50000-100000': { min: 50000, max: 100000 },
    '100000-200000': { min: 100000, max: 200000 },
    '200000+': { min: 200000 },
  }
  return ranges[range] || {}
}
