<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

type Product = {
  id: string
  name: string
  description: string | null
  priceCents: number
  stockQuantity: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const { data: products, refresh } = await useFetch<Product[]>('/api/admin/products', {
  key: 'admin-products',
  credentials: 'include',
})

const editingId = ref<string | null>(null)
const editForm = ref<{ name: string; description: string; priceCents: number; stockQuantity: number }>({
  name: '',
  description: '',
  priceCents: 0,
  stockQuantity: 0,
})
const errorMessage = ref('')

function startEdit(p: Product) {
  editingId.value = p.id
  editForm.value = {
    name: p.name,
    description: p.description ?? '',
    priceCents: p.priceCents,
    stockQuantity: p.stockQuantity,
  }
  errorMessage.value = ''
}

function cancelEdit() {
  editingId.value = null
  errorMessage.value = ''
}

async function saveEdit() {
  const id = editingId.value
  if (!id) return
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      body: {
        title: editForm.value.name,
        description: editForm.value.description || null,
        priceCents: Math.round(editForm.value.priceCents),
        stockQuantity: Math.max(0, Math.floor(editForm.value.stockQuantity)),
      },
      credentials: 'include',
    })
    cancelEdit()
    await refresh()
  } catch (e: unknown) {
    errorMessage.value = e && typeof e === 'object' && 'data' in e
      ? String((e as { data?: { message?: string } }).data?.message ?? 'Failed to update')
      : 'Failed to update product'
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">Products</h1>
    <p class="text-gray-600 text-sm mb-6">Update title, description, price, and stock.</p>

    <p v-if="errorMessage" class="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
      {{ errorMessage }}
    </p>

    <template v-if="!products?.length">
      <p class="text-gray-500">No products.</p>
    </template>
    <template v-else>
      <ul class="space-y-4">
        <li
          v-for="p in products"
          :key="p.id"
          class="border border-gray-200 rounded-lg bg-white p-4"
        >
          <template v-if="editingId === p.id">
            <form class="space-y-3" @submit.prevent="saveEdit">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Title</label>
                <input
                  v-model="editForm.name"
                  type="text"
                  class="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea
                  v-model="editForm.description"
                  rows="2"
                  class="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div class="flex flex-wrap gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Price (cents)</label>
                  <input
                    v-model.number="editForm.priceCents"
                    type="number"
                    min="0"
                    step="1"
                    class="block w-28 rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Stock</label>
                  <input
                    v-model.number="editForm.stockQuantity"
                    type="number"
                    min="0"
                    step="1"
                    class="block w-24 rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div class="flex gap-2 pt-2">
                <button
                  type="submit"
                  class="px-3 py-1.5 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  @click="cancelEdit"
                >
                  Cancel
                </button>
              </div>
            </form>
          </template>
          <template v-else>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="font-medium text-gray-900">{{ p.name }}</p>
                <p v-if="p.description" class="text-sm text-gray-600 mt-0.5 line-clamp-2">{{ p.description }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ (p.priceCents / 100).toFixed(2) }} · Stock: {{ p.stockQuantity }}
                  <span v-if="!p.isActive" class="text-amber-600">· Inactive</span>
                </p>
              </div>
              <button
                type="button"
                class="text-sm font-medium text-gray-700 hover:text-gray-900"
                @click="startEdit(p)"
              >
                Edit
              </button>
            </div>
          </template>
        </li>
      </ul>
    </template>
  </div>
</template>
