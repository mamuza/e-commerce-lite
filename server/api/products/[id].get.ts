import { prisma } from '~/server/utils/prisma'

/** GET /api/products/:id — single active product; 404 if not found or inactive. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ status: 400, message: 'Missing product id' })
  }

  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      stockQuantity: true,
    },
  })

  if (!product) {
    throw createError({ status: 404, message: 'Product not found' })
  }

  return product
})
