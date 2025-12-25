import { prisma } from './db'

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 5

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - WINDOW_MS)

  // Clean up expired entries
  await prisma.rateLimit.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  })

  const key = `rate:${identifier}`
  const existing = await prisma.rateLimit.findUnique({
    where: { id: key },
  })

  if (!existing) {
    await prisma.rateLimit.create({
      data: {
        id: key,
        count: 1,
        expiresAt: new Date(now.getTime() + WINDOW_MS),
      },
    })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (existing.expiresAt < now) {
    await prisma.rateLimit.update({
      where: { id: key },
      data: {
        count: 1,
        expiresAt: new Date(now.getTime() + WINDOW_MS),
      },
    })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (existing.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  await prisma.rateLimit.update({
    where: { id: key },
    data: { count: { increment: 1 } },
  })

  return { allowed: true, remaining: MAX_REQUESTS - existing.count - 1 }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return 'unknown'
}
