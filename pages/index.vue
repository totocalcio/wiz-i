<template>
  <div class="max-w-4xl mx-auto text-center">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">wizI</h1>
      <p class="text-xl text-gray-600 mb-8">Access conversations using their unique ID</p>
    </div>

    <div class="card">
      <div class="max-w-md mx-auto">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Join Conversation</h2>
        
        <form @submit.prevent="joinConversation" class="space-y-4">
          <div>
            <label class="label" for="conversation_id">
              Conversation ID
            </label>
            <input
              id="conversation_id"
              v-model="conversationId"
              type="text"
              class="input-field"
              placeholder="Enter conversation ID"
              required
            />
            <p class="text-xs text-gray-500 mt-1">
              Enter the unique ID of the conversation you want to join
            </p>
          </div>

          <button
            type="submit"
            class="btn-primary w-full flex items-center justify-center"
            :disabled="!conversationId.trim()"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Join Conversation
          </button>
        </form>
      </div>
    </div>

    <div class="mt-8 p-6 bg-blue-50 rounded-lg">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Need to create a conversation?</h3>
      <p class="text-gray-600 mb-4">
        You can create and manage conversations through the settings panel.
      </p>
      <NuxtLink to="/settings" class="btn-secondary">
        Settings
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const conversationId = ref<string>('')

const joinConversation = async (): Promise<void> => {
  if (!conversationId.value.trim()) {
    return
  }

  // Navigate to the conversation page
  await navigateTo(`/${conversationId.value.trim()}`)
}

// Auto-fill conversation ID if provided in query params
onMounted(() => {
  const route = useRoute()
  if (route.query.id && typeof route.query.id === 'string') {
    conversationId.value = route.query.id
  }
})
</script>