// Fallback: redirect GET /_nuxt to / (middleware handles /_nuxt and /_nuxt/)
export default defineEventHandler((event) => sendRedirect(event, getRequestURL(event).origin + '/', 302))
