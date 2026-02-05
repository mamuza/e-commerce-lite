import { prisma } from '~/server/utils/prisma'
import { verifyPassword } from '~/server/utils/password'
import { createSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    throw createError({ status: 400, message: 'Email and password are required' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw createError({ status: 401, message: 'Invalid email or password' })
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    throw createError({ status: 401, message: 'Invalid email or password' })
  }

  await createSession(event, user.id)
  return { id: user.id, email: user.email }
})
