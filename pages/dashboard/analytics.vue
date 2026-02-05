<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const SPANS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
] as const

const span = ref<string>('30d')
const { data: analytics, refresh } = await useFetch(
  () => `/api/admin/analytics?span=${span.value}`,
  {
    key: () => `admin-analytics-${span.value}`,
    credentials: 'include',
  }
)

watch(span, () => refresh())
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">Analytics</h1>
    <p class="text-gray-600 text-sm mb-6">Basic metrics for the selected period.</p>

    <div class="mb-6">
      <label class="block text-xs font-medium text-gray-500 mb-1">Time span</label>
      <select
        v-model="span"
        class="block w-full max-w-[12rem] rounded border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      >
        <option v-for="s in SPANS" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </div>

    <template v-if="analytics">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="text-xs font-medium text-gray-500 uppercase">Orders</p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">{{ analytics.orders?.total ?? 0 }}</p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="text-xs font-medium text-gray-500 uppercase">Revenue</p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">
            {{ analytics.revenue?.totalFormatted ?? '0.00' }}
          </p>
          <p class="text-xs text-gray-500">(excl. cancelled)</p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="text-xs font-medium text-gray-500 uppercase">Products</p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">{{ analytics.products?.total ?? 0 }}</p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="text-xs font-medium text-gray-500 uppercase">Low stock (≤5)</p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">{{ analytics.products?.lowStock ?? 0 }}</p>
        </div>
      </div>

      <div v-if="analytics.orders?.byStatus && Object.keys(analytics.orders.byStatus).length" class="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <p class="text-sm font-medium text-gray-700 mb-3">Orders by status</p>
        <ul class="space-y-2">
          <li
            v-for="(count, status) in analytics.orders.byStatus"
            :key="status"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-gray-600 capitalize">{{ status.toLowerCase() }}</span>
            <span class="font-medium text-gray-900">{{ count }}</span>
          </li>
        </ul>
      </div>
    </template>
    <p v-else class="text-gray-500">Loading analytics…</p>
  </div>
</template>
