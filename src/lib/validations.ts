import { z } from 'zod'

// String enums for SQLite compatibility
const PropertyStatusEnum = z.enum(['Available', 'UnderContract', 'Leased', 'Sold'])
const LeaseOrSaleEnum = z.enum(['Lease', 'Sale', 'Both'])
const LeadStatusEnum = z.enum(['New', 'Contacted', 'Closed'])

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().max(100).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  honeypot: z.string().max(0, 'Bot detected').optional(),
})

export const requestInfoFormSchema = contactFormSchema.extend({
  propertyId: z.string().uuid('Invalid property'),
})

export const scheduleWalkthroughFormSchema = requestInfoFormSchema.extend({
  preferredDateTime: z.string().min(1, 'Please provide a preferred date/time'),
})

export const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  address: z.string().min(5, 'Address is required').max(200),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(50),
  zip: z.string().min(5, 'ZIP code is required').max(10),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  squareFeet: z.number().int().positive('Square feet must be positive'),
  clearHeight: z.string().max(50).optional().nullable(),
  dockDoors: z.number().int().min(0).default(0),
  driveInDoors: z.number().int().min(0).default(0),
  acreage: z.number().positive().optional().nullable(),
  leaseOrSale: LeaseOrSaleEnum.default('Lease'),
  priceOrRate: z.string().max(100).optional().nullable(),
  availableDate: z.string().optional().nullable(),
  highlights: z.array(z.string()).default([]),
  status: PropertyStatusEnum.default('Available'),
  featured: z.boolean().default(false),
})

export const propertyUpdateSchema = propertySchema.partial()

export const leadStatusUpdateSchema = z.object({
  status: LeadStatusEnum,
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const imageOrderSchema = z.object({
  images: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>
export type RequestInfoFormInput = z.infer<typeof requestInfoFormSchema>
export type ScheduleWalkthroughFormInput = z.infer<typeof scheduleWalkthroughFormSchema>
export type PropertyInput = z.infer<typeof propertySchema>
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>
export type LoginInput = z.infer<typeof loginSchema>
