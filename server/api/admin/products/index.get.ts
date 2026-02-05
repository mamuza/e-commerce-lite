import { prisma } from '~/server/utils/prisma'

/** GET /api/admin/products — all products including inactive (admin only). */
export default defineEventHandler(async () => {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      stockQuantity: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  return products
})
