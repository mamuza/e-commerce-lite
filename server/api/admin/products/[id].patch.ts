import { prisma } from '~/server/utils/prisma';

/** PATCH /api/admin/products/:id — update product (admin only). */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ status: 400, message: 'Missing product id' });
  }

  const body = await readBody<{
    title?: string;
    name?: string;
    description?: string;
    priceCents?: number;
    stockQuantity?: number;
    isActive?: boolean;
  }>(event).catch(() => ({}));
  const title = body?.title ?? body?.name;
  const description = body?.description;
  const priceCents = body?.priceCents;
  const stockQuantity = body?.stockQuantity;
  const isActive = body?.isActive;

  const data: Record<string, unknown> = {};
  if (typeof title === 'string') data.name = title;
  if (description !== undefined) data.description = description ?? null;
  if (typeof priceCents === 'number' && Number.isInteger(priceCents) && priceCents >= 0)
    data.priceCents = priceCents;
  if (typeof stockQuantity === 'number' && Number.isInteger(stockQuantity) && stockQuantity >= 0)
    data.stockQuantity = stockQuantity;
  if (typeof isActive === 'boolean') data.isActive = isActive;

  if (Object.keys(data).length === 0) {
    throw createError({ status: 400, message: 'No valid fields to update' });
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      stockQuantity: true,
      isActive: true,
      updatedAt: true,
    },
  });
  return product;
});
