<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

defineProps<Props>()
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div v-if="title || subtitle" class="mb-6">
      <h2 v-if="title" class="text-xl font-semibold text-gray-900 mb-2">{{ title }}</h2>
      <p v-if="subtitle" class="text-sm text-gray-600">{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>