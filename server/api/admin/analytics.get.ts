import { prisma } from '~/server/utils/prisma'

/** Predefined time spans: from now going back. */
const SPANS = {
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
} as const

export type SpanKey = keyof typeof SPANS

/** GET /api/admin/analytics?span=7d|30d|90d — basic analytics (admin only). */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const spanParam = (query.span as string) || '30d'
  const spanMs = SPANS[spanParam as SpanKey] ?? SPANS['30d']
  const since = new Date(Date.now() - spanMs)

  const [orderCount, totalRevenue, ordersByStatus, productCount, lowStockCount] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: since }, status: { not: 'CANCELLED' } },
      _sum: { totalCents: true },
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
    }),
    prisma.product.count(),
    prisma.product.count({ where: { stockQuantity: { lte: 5 }, isActive: true } }),
  ])

  const totalCents = totalRevenue._sum.totalCents ?? 0
  const statusCounts = Object.fromEntries(
    ordersByStatus.map((s) => [s.status, s._count.id])
  ) as Record<string, number>

  return {
    span: spanParam,
    since: since.toISOString(),
    orders: {
      total: orderCount,
      byStatus: statusCounts,
    },
    revenue: {
      totalCents,
      totalFormatted: (totalCents / 100).toFixed(2),
    },
    products: {
      total: productCount,
      lowStock: lowStockCount,
    },
  }
})
