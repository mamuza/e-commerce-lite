import { prisma } from '~/server/utils/prisma'
import { hashPassword } from '~/server/utils/password'

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !isValidEmail(email)) {
    throw createError({ status: 400, message: 'Valid email is required' })
  }
  if (password.length < 8) {
    throw createError({ status: 400, message: 'Password must be at least 8 characters' })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw createError({ status: 409, message: 'Email already registered' })
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true },
  })
  return user
})
