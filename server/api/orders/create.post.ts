import { prisma } from '~/server/utils/prisma';

/** Request body: cart items (productId + quantity). Auth required via auth-orders middleware. */
type CreateOrderBody = {
  items: Array<{ productId: string; quantity: number }>;
};

/**
 * POST /api/orders/create
 * Re-fetches products, validates active + stock, computes totals in cents,
 * creates Order + OrderItems in a transaction, decrements stock.
 */
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ status: 401, message: 'Unauthorized' });
  }

  const body = await readBody<CreateOrderBody>(event).catch(() => null);
  const items = body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw createError({
      status: 400,
      message: 'Body must include non-empty items array with productId and quantity',
    });
  }

  // Aggregate by productId (cart may have duplicate productIds)
  const byProduct = new Map<string, number>();
  for (const item of items) {
    if (!item.productId || typeof item.quantity !== 'number' || item.quantity < 1) {
      throw createError({
        status: 400,
        message: 'Each item must have productId and quantity >= 1',
      });
    }
    const q = byProduct.get(item.productId) ?? 0;
    byProduct.set(item.productId, q + item.quantity);
  }

  const productIds = [...byProduct.keys()];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      priceCents: true,
      stockQuantity: true,
      isActive: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  type Line = { productId: string; quantity: number; priceCents: number };
  const lines: Line[] = [];
  let totalCents = 0;

  for (const [productId, quantity] of byProduct) {
    const product = productMap.get(productId);
    if (!product) {
      throw createError({
        status: 400,
        message: `Product not found: ${productId}`,
      });
    }
    if (!product.isActive) {
      throw createError({
        status: 400,
        message: `Product no longer available: ${productId}`,
      });
    }
    const available = product.stockQuantity;
    if (quantity > available) {
      throw createError({
        status: 400,
        message: `Insufficient stock for product ${productId}: requested ${quantity}, available ${available}`,
      });
    }
    const lineTotal = product.priceCents * quantity;
    totalCents += lineTotal;
    lines.push({ productId, quantity, priceCents: product.priceCents });
  }

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId: user.id,
        totalCents,
        status: 'PENDING',
      },
    });

    await tx.orderItem.createMany({
      data: lines.map((line) => ({
        orderId: newOrder.id,
        productId: line.productId,
        quantity: line.quantity,
        priceCents: line.priceCents,
      })),
    });

    for (const line of lines) {
      await tx.product.update({
        where: { id: line.productId },
        data: {
          stockQuantity: { decrement: line.quantity },
        },
      });
    }

    return newOrder;
  });

  const orderWithItems = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items: {
        select: {
          productId: true,
          quantity: true,
          priceCents: true,
        },
      },
    },
  });

  return {
    order: orderWithItems
      ? {
          id: orderWithItems.id,
          totalCents: orderWithItems.totalCents,
          createdAt: orderWithItems.createdAt,
          items: orderWithItems.items,
        }
      : { id: order.id, totalCents: order.totalCents, createdAt: order.createdAt, items: lines },
  };
});
