import { createHmac, randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'
import { prisma } from './prisma'
import type { User } from '@prisma/client'

export type SessionUser = Pick<User, 'id' | 'email' | 'role'>

function getConfig(event: H3Event) {
  const config = useRuntimeConfig(event)
  return {
    secret: config.sessionSecret as string,
    cookieName: (config.sessionCookieName as string) || 'ecommerce_session',
    maxAge: Number(config.sessionMaxAge) || 60 * 60 * 24 * 7, // 7 days
  }
}

function hashToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex')
}

function generateToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Create a session for the user, store token hash in DB, set HTTP-only cookie.
 */
export async function createSession(event: H3Event, userId: string): Promise<void> {
  const { secret, cookieName, maxAge } = getConfig(event)
  const token = generateToken()
  const tokenHash = hashToken(token, secret)
  const expiresAt = new Date(Date.now() + maxAge * 1000)

  await prisma.session.create({
    data: { userId, tokenHash, expiresAt },
  })

  setCookie(event, cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
}

/**
 * Load User from session cookie; enforce expiration. Returns null if invalid/expired.
 */
export async function getSessionUser(event: H3Event): Promise<SessionUser | null> {
  const { secret, cookieName } = getConfig(event)
  const token = getCookie(event, cookieName)
  if (!token) return null

  const tokenHash = hashToken(token, secret)
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, role: true } } },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }

  return session.user
}

/**
 * Invalidate session and clear cookie (our DB session, not h3's).
 */
export async function invalidateSession(event: H3Event): Promise<void> {
  const { secret, cookieName } = getConfig(event)
  const token = getCookie(event, cookieName)
  if (token) {
    const tokenHash = hashToken(token, secret)
    await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => {})
  }
  deleteCookie(event, cookieName, { path: '/' })
}
