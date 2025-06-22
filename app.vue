<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Explicitly import the Tavus store
const { useTavusStore } = await import('~/stores/tavus')

// Initialize settings on app load
const tavusStore = useTavusStore()
onMounted(() => {
  tavusStore.loadSettings()
})
</script>