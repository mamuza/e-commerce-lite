/**
 * Redirect bare /_nuxt and /_nuxt/ to / to avoid unhandled 404 in dev
 * (something requests GET /_nuxt/ which has no asset file and triggers createError)
 */
export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (path === '/_nuxt' || path === '/_nuxt/') {
    return sendRedirect(event, '/', 302)
  }
})
