import { prisma } from '~/server/utils/prisma';

const buildOrderBy = (sortBy: string | undefined) => {
  switch (sortBy) {
    case 'price_asc':
      return { priceCents: 'asc' as const };
    case 'price_desc':
      return { priceCents: 'desc' as const };
    case 'name_asc':
      return { name: 'asc' as const };
    case 'name_desc':
      return { name: 'desc' as const };
    default:
      return { createdAt: 'desc' as const };
  }
};

/** GET /api/products — only active products. Optional ?ids=id1,id2 to filter by IDs (e.g. for cart). */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const idsParam = query.ids;
  const page = query.page;
  const sortBy = query.sort;
  const q = query.q;
  const orderBy = buildOrderBy(sortBy as string | undefined);

  const ids =
    typeof idsParam === 'string'
      ? idsParam.split(',').filter(Boolean)
      : Array.isArray(idsParam)
        ? (idsParam as string[]).filter(Boolean)
        : undefined;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(q ? { name: { contains: String(q), mode: 'insensitive' } } : {}),
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
    orderBy,
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      stockQuantity: true,
    },
    ...(page ? { skip: (Number(page) - 1) * 10, take: 10 } : {}),
  });

  const totalCount = await prisma.product.count({
    where: {
      isActive: true,
      ...(q ? { name: { contains: String(q), mode: 'insensitive' } } : {}),
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
  });

  const totalPages = Math.ceil(totalCount / 10);

  return {
    products,
    totalPages,
  };
});
