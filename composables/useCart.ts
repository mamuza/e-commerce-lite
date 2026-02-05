/**
 * Phase 4: Cart — client shape: productId + quantity only (no price).
 * Persisted in cookie; survives reload; works for guests and authenticated users.
 */

export type CartItem = { productId: string; quantity: number }

const CART_COOKIE_NAME = 'ecommerce_cart'
const CART_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

export function useCart() {
  const cookie = useCookie<CartItem[]>(CART_COOKIE_NAME, {
    default: () => [],
    maxAge: CART_MAX_AGE,
    sameSite: 'lax',
  })

  const items = computed<CartItem[]>(() => [...(cookie.value ?? [])])

  const totalItemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  function add(productId: string, quantity = 1) {
    const next = [...(cookie.value ?? [])]
    const i = next.findIndex((x) => x.productId === productId)
    if (i >= 0) next[i] = { ...next[i], quantity: next[i].quantity + quantity }
    else next.push({ productId, quantity })
    cookie.value = next
  }

  function remove(productId: string) {
    cookie.value = (cookie.value ?? []).filter((x) => x.productId !== productId)
  }

  function setQuantity(productId: string, quantity: number) {
    if (quantity < 1) {
      remove(productId)
      return
    }
    const next = [...(cookie.value ?? [])]
    const i = next.findIndex((x) => x.productId === productId)
    if (i >= 0) next[i] = { ...next[i], quantity }
    else next.push({ productId, quantity })
    cookie.value = next
  }

  function clear() {
    cookie.value = []
  }

  function getQuantity(productId: string): number {
    const item = (cookie.value ?? []).find((x) => x.productId === productId)
    return item?.quantity ?? 0
  }

  return {
    items,
    totalItemCount,
    isEmpty,
    add,
    remove,
    setQuantity,
    clear,
    getQuantity,
  }
}
