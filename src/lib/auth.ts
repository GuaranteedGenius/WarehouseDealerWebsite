import { cookies } from 'next/headers'
import { getIronSession, IronSession } from 'iron-session'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

export interface SessionData {
  adminId?: string
  email?: string
  isLoggedIn: boolean
}

const sessionOptions = {
  password: process.env.AUTH_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'warehouse_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    session.isLoggedIn = false
  }

  return session
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!admin) {
    return { success: false, error: 'Invalid credentials' }
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash)

  if (!isValid) {
    return { success: false, error: 'Invalid credentials' }
  }

  const session = await getSession()
  session.adminId = admin.id
  session.email = admin.email
  session.isLoggedIn = true
  await session.save()

  return { success: true }
}

export async function logout(): Promise<void> {
  const session = await getSession()
  session.destroy()
}

export async function getCurrentAdmin() {
  const session = await getSession()

  if (!session.isLoggedIn || !session.adminId) {
    return null
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, email: true, name: true },
  })

  return admin
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
