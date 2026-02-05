// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    // Private keys (server-only): use NUXT_ prefix in env
    databaseUrl: '',
    sessionSecret: '',
    sessionCookieName: 'ecommerce_session',
    sessionMaxAge: 60 * 60 * 24 * 7, // 7 days in seconds

    // Public keys (exposed to client) - add if needed
    public: {},
  },

  nitro: {
    // Only use node-server for production build; dev uses default preset for correct _nuxt asset serving
    ...(process.env.NODE_ENV === 'production' ? { preset: 'node-server' } : {}),
  },

  devtools: { enabled: true },
})
