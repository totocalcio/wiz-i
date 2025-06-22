<template>
  <div class="max-w-2xl mx-auto">
    <ClientOnly>
      <template #fallback>
        <div class="card">
          <div class="text-center py-12">
            <div class="loading-spinner mx-auto mb-4" role="status" aria-label="Loading settings panel"></div>
            <p class="text-gray-600">Loading settings panel...</p>
          </div>
        </div>
      </template>
      
      <!-- Settings Panel -->
      <div class="space-y-8">
        <div class="card">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p class="text-gray-600">Configure your wizI conversational video agent settings</p>
          </div>

          <form @submit.prevent="saveSettings" class="space-y-6" novalidate>
            <fieldset class="space-y-6">
              <legend class="sr-only">Tavus API Configuration</legend>
              
              <div>
                <label class="label" for="persona_id">
                  Persona ID <span class="text-red-600" aria-label="required">*</span>
                </label>
                <input
                  id="persona_id"
                  v-model="formData.persona_id"
                  type="text"
                  class="input-field"
                  placeholder="Enter your persona ID"
                  required
                  aria-describedby="persona_id_help"
                  :aria-invalid="!formData.persona_id && formSubmitted ? 'true' : 'false'"
                />
                <p id="persona_id_help" class="text-xs text-gray-500 mt-1">
                  The persona configuration for your conversational agent
                </p>
                <div v-if="!formData.persona_id && formSubmitted" class="text-red-600 text-sm mt-1" role="alert">
                  Persona ID is required
                </div>
              </div>

              <div>
                <label class="label" for="replica_id">
                  Replica ID <span class="text-red-600" aria-label="required">*</span>
                </label>
                <input
                  id="replica_id"
                  v-model="formData.replica_id"
                  type="text"
                  class="input-field"
                  placeholder="Enter your replica ID"
                  required
                  aria-describedby="replica_id_help"
                  :aria-invalid="!formData.replica_id && formSubmitted ? 'true' : 'false'"
                />
                <p id="replica_id_help" class="text-xs text-gray-500 mt-1">
                  The unique identifier for your Tavus replica
                </p>
                <div v-if="!formData.replica_id && formSubmitted" class="text-red-600 text-sm mt-1" role="alert">
                  Replica ID is required
                </div>
              </div>

              <div>
                <label class="label" for="api_key">
                  Tavus API Key <span class="text-red-600" aria-label="required">*</span>
                </label>
                <input
                  id="api_key"
                  v-model="formData.api_key"
                  type="password"
                  class="input-field"
                  placeholder="Enter your Tavus API key"
                  required
                  aria-describedby="api_key_help"
                  :aria-invalid="!formData.api_key && formSubmitted ? 'true' : 'false'"
                  autocomplete="current-password"
                />
                <p id="api_key_help" class="text-xs text-gray-500 mt-1">
                  Your Tavus API key for authentication
                </p>
                <div v-if="!formData.api_key && formSubmitted" class="text-red-600 text-sm mt-1" role="alert">
                  API Key is required
                </div>
              </div>
            </fieldset>

            <div class="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                class="btn-primary flex-1 focus:ring-4 focus:ring-blue-300"
                :disabled="isSaving"
                :aria-describedby="isSaving ? 'saving_status' : undefined"
              >
                <span v-if="isSaving" class="loading-spinner mr-2" role="status" aria-hidden="true"></span>
                {{ isSaving ? 'Saving...' : 'Save Settings' }}
              </button>
              <div v-if="isSaving" id="saving_status" class="sr-only" aria-live="polite">
                Saving settings, please wait
              </div>
              
              <button
                type="button"
                @click="resetToDefaults"
                class="btn-secondary flex-1 focus:ring-4 focus:ring-gray-300"
                :disabled="isSaving"
              >
                Reset to Defaults
              </button>
            </div>
          </form>

          <div v-if="showSuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg" role="alert" aria-live="polite">
            <div class="flex items-center">
              <div class="text-green-600 mr-3" aria-hidden="true">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p class="text-green-800 font-medium">Settings saved successfully!</p>
            </div>
          </div>
        </div>

        <!-- Create Conversation Section -->
        <section class="card" aria-labelledby="create_conversation_heading">
          <h2 id="create_conversation_heading" class="text-lg font-semibold text-gray-900 mb-4">Create New Conversation</h2>
          <p class="text-gray-600 mb-6">Create a new conversation session with the wizI agent</p>
          
          <div class="space-y-4">
            <div>
              <label class="label" for="conversation_name">
                Conversation Name (Optional)
              </label>
              <input
                id="conversation_name"
                v-model="conversationName"
                type="text"
                class="input-field"
                placeholder="Enter conversation name"
                aria-describedby="conversation_name_help"
              />
              <p id="conversation_name_help" class="text-xs text-gray-500 mt-1">
                Optional name to help identify this conversation
              </p>
            </div>

            <button
              @click="createConversation"
              class="btn-primary w-full focus:ring-4 focus:ring-blue-300"
              :disabled="isCreatingConversation"
              :aria-describedby="isCreatingConversation ? 'creating_status' : undefined"
            >
              <span v-if="isCreatingConversation" class="loading-spinner mr-2" role="status" aria-hidden="true"></span>
              {{ isCreatingConversation ? 'Creating Conversation...' : 'Create Conversation' }}
            </button>
            <div v-if="isCreatingConversation" id="creating_status" class="sr-only" aria-live="polite">
              Creating conversation, please wait
            </div>

            <div v-if="conversationResult" 
                 class="p-4 rounded-lg" 
                 :class="conversationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'"
                 role="alert"
                 aria-live="polite">
              <p :class="conversationResult.success ? 'text-green-800' : 'text-red-800'" class="font-medium">
                {{ conversationResult.message }}
              </p>
              <div v-if="conversationResult.success && conversationResult.data" class="mt-2 text-sm text-green-700">
                <p><strong>Conversation ID:</strong> {{ conversationResult.data.conversation_id }}</p>
                <p><strong>Status:</strong> {{ conversationResult.data.status }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Conversation Management Section -->
        <section class="card" aria-labelledby="conversation_management_heading">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 id="conversation_management_heading" class="text-lg font-semibold text-gray-900">Recent Conversations</h2>
              <div class="flex items-center gap-2 mt-2">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="showActiveOnly"
                    class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    aria-describedby="filter_help"
                  />
                  <span class="text-sm text-gray-600">Show active only</span>
                </label>
                <p id="filter_help" class="sr-only">Filter to show only active conversations</p>
              </div>
            </div>
            <button
              @click="loadConversations"
              class="btn-secondary focus:ring-4 focus:ring-gray-300"
              :disabled="isLoadingConversations"
              :aria-describedby="isLoadingConversations ? 'loading_status' : undefined"
            >
              <span v-if="isLoadingConversations" class="loading-spinner mr-2" role="status" aria-hidden="true"></span>
              {{ isLoadingConversations ? 'Loading...' : 'Refresh' }}
            </button>
            <div v-if="isLoadingConversations" id="loading_status" class="sr-only" aria-live="polite">
              Loading conversations, please wait
            </div>
          </div>

          <div v-if="conversationError" class="p-4 bg-red-50 border border-red-200 rounded-lg mb-4" role="alert" aria-live="polite">
            <p class="text-red-800">{{ conversationError }}</p>
          </div>

          <div v-if="filteredConversations.length === 0 && !isLoadingConversations" 
               class="text-center py-8 text-gray-500"
               role="status"
               aria-live="polite">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <p>{{ showActiveOnly ? 'No active conversations found' : 'No conversations found' }}</p>
            <p v-if="showActiveOnly && conversations.length > 0" class="text-sm text-gray-400 mt-1">
              {{ conversations.length }} total conversations available (uncheck filter to see all)
            </p>
          </div>

          <div v-else class="space-y-4" role="list" aria-label="Conversations list">
            <template v-for="conversation in filteredConversations" :key="conversation.conversation_id">
              <div
                class="border rounded-lg p-4 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 transition-colors"
                :class="isActiveConversation(conversation) ? 'border-green-300 bg-green-50' : 'border-gray-200'"
                role="listitem"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="font-medium text-gray-900">
                        {{ conversation.conversation_name || 'Unnamed Conversation' }}
                      </h3>
                      <span
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="getStatusColor(conversation.status)"
                        :aria-label="`Status: ${conversation.status || 'Unknown'}`"
                      >
                        {{ conversation.status || 'Unknown' }}
                      </span>
                      <span v-if="isActiveConversation(conversation)" 
                            class="px-2 py-1 text-xs font-medium rounded-full bg-green-600 text-white"
                            aria-label="Currently active conversation">
                        ACTIVE
                      </span>
                    </div>
                    <div class="text-sm text-gray-600 space-y-1">
                      <p><span class="font-medium">ID:</span> {{ conversation.conversation_id }}</p>
                      <p v-if="conversation.created_at">
                        <span class="font-medium">Created:</span> 
                        <time :datetime="conversation.created_at">
                          {{ new Date(conversation.created_at).toLocaleString() }}
                        </time>
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-2" role="group" :aria-label="`Actions for ${conversation.conversation_name || 'Unnamed Conversation'}`">
                    <button
                      v-if="conversation.status === 'active' || 
                            conversation.status === 'connected' || 
                            conversation.status === 'ready' || 
                            conversation.status === 'live'"
                      @click="endConversation(conversation.conversation_id)"
                      class="bg-red-600 hover:bg-red-700 focus:bg-red-700 focus:ring-4 focus:ring-red-300 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      :aria-label="`End conversation ${conversation.conversation_name || conversation.conversation_id}`"
                    >
                      End
                    </button>
                    <button
                      v-if="!isActiveConversation(conversation)"
                      @click="deleteConversation(conversation.conversation_id)"
                      class="bg-gray-600 hover:bg-gray-700 focus:bg-gray-700 focus:ring-4 focus:ring-gray-300 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      :disabled="isDeletingConversation"
                      :aria-label="`Delete conversation ${conversation.conversation_name || conversation.conversation_id}`"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="card" aria-labelledby="quick_actions_heading">
          <h2 id="quick_actions_heading" class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div class="flex flex-col sm:flex-row gap-3" role="group" aria-label="Quick action buttons">
            <NuxtLink to="/" class="btn-primary flex-1 text-center focus:ring-4 focus:ring-blue-300">
              Go to Main Screen
            </NuxtLink>
            <button 
              @click="testConnection" 
              class="btn-secondary flex-1 focus:ring-4 focus:ring-gray-300" 
              :disabled="isTestingConnection"
              :aria-describedby="isTestingConnection ? 'testing_status' : undefined"
            >
              <span v-if="isTestingConnection" class="loading-spinner mr-2" role="status" aria-hidden="true"></span>
              {{ isTestingConnection ? 'Testing...' : 'Test API Connection' }}
            </button>
            <div v-if="isTestingConnection" id="testing_status" class="sr-only" aria-live="polite">
              Testing API connection, please wait
            </div>
          </div>
        </section>

        <div v-if="connectionTestResult" class="card" role="alert" aria-live="polite">
          <div class="p-4 rounded-lg" :class="connectionTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <p :class="connectionTestResult.success ? 'text-green-800' : 'text-red-800'" class="font-medium">
              {{ connectionTestResult.message }}
            </p>
            <div v-if="connectionTestResult.details" class="mt-2 text-sm" :class="connectionTestResult.success ? 'text-green-700' : 'text-red-700'">
              <pre class="whitespace-pre-wrap">{{ connectionTestResult.details }}</pre>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
const tavusStore = useTavusStore()

// Form data
const formData = ref({
  replica_id: tavusStore.settings.replica_id,
  persona_id: tavusStore.settings.persona_id,
  api_key: tavusStore.settings.api_key || ''
})

// UI state
const isSaving = ref(false)
const showSuccess = ref(false)
const isTestingConnection = ref(false)
const connectionTestResult = ref(null)
const formSubmitted = ref(false)

// Create conversation
const conversationName = ref('')
const isCreatingConversation = ref(false)
const conversationResult = ref(null)

// Conversation management
const conversations = ref([])
const isLoadingConversations = ref(false)
const conversationError = ref(null)
const isDeletingConversation = ref(false)
const showActiveOnly = ref(false)

// Computed property to filter conversations
const filteredConversations = computed(() => {
  if (!showActiveOnly.value) {
    return conversations.value
  }
  
  return conversations.value.filter(conversation => isActiveConversation(conversation))
})

const isActiveConversation = (conversation) => {
  const status = conversation.status?.toLowerCase()
  return status === 'active' || 
         status === 'connected' || 
         status === 'ready' || 
         status === 'live' ||
         status === 'running'
}

const loadConversations = async () => {
  isLoadingConversations.value = true
  conversationError.value = null
  
  try {
    console.log('🔄 Loading conversations from API...')
    const result = await tavusStore.listConversations()
    console.log(`📋 Loaded ${result.length} conversations from API`)
    conversations.value = result
  } catch (error) {
    conversationError.value = error.message
    console.error('Failed to load conversations:', error)
  } finally {
    isLoadingConversations.value = false
  }
}

const endConversation = async (conversationId) => {
  try {
    await tavusStore.endConversationById(conversationId)
    // Refresh the conversations list only if API key is available
    if (!tavusStore.settings.api_key) {
      return
    }
    await loadConversations()
  } catch (error) {
    console.error('Failed to end conversation:', error)
    alert('Failed to end conversation: ' + error.message)
  }
}

const deleteConversation = async (conversationId) => {
  if (!confirm('Are you sure you want to PERMANENTLY DELETE this conversation? This action cannot be undone and will remove all conversation data.')) {
    return
  }
  
  isDeletingConversation.value = true
  
  try {
    await tavusStore.deleteConversationById(conversationId)
    // Refresh the conversations list
    await loadConversations()
  } catch (error) {
    console.error('Failed to delete conversation:', error)
    alert('Failed to delete conversation: ' + error.message)
  } finally {
    isDeletingConversation.value = false
  }
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'connected':
    case 'ready':
    case 'live':
      return 'text-green-800 bg-green-100'
    case 'ended':
    case 'disconnected':
    case 'completed':
    case 'finished':
      return 'text-gray-800 bg-gray-100'
    case 'pending':
    case 'creating':
    case 'initializing':
      return 'text-yellow-800 bg-yellow-100'
    case 'error':
    case 'failed':
      return 'text-red-800 bg-red-100'
    default:
      return 'text-gray-800 bg-gray-100'
  }
}

const saveSettings = async () => {
  formSubmitted.value = true
  
  // Basic client-side validation
  if (!formData.value.replica_id || !formData.value.persona_id || !formData.value.api_key) {
    return
  }
  
  isSaving.value = true
  
  try {
    await tavusStore.updateSettings(formData.value)
    showSuccess.value = true
    
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
    
    // Load conversations after saving settings if API key is now available
    if (formData.value.api_key) {
      await loadConversations()
    }
  } catch (error) {
    console.error('Failed to save settings:', error)
  } finally {
    isSaving.value = false
  }
}

const resetToDefaults = () => {
  formData.value = {
    replica_id: '',
    persona_id: '',
    api_key: ''
  }
  formSubmitted.value = false
}

const testConnection = async () => {
  isTestingConnection.value = true
  connectionTestResult.value = null
  
  try {
    const result = await tavusStore.testApiConnection()
    connectionTestResult.value = result
  } catch (error) {
    connectionTestResult.value = {
      success: false,
      message: 'Connection test failed',
      details: error.message
    }
  } finally {
    isTestingConnection.value = false
  }
}

const createConversation = async () => {
  isCreatingConversation.value = true
  conversationResult.value = null
  
  try {
    // Create conversation and get immediate result
    const result = await tavusStore.createConversation(conversationName.value)
    
    conversationResult.value = {
      success: true,
      message: 'Conversation created successfully!',
      data: result
    }
    conversationName.value = ''
    
    // Check if the new conversation appears in the GET list, retry if not
    await retryUntilConversationInList(result.conversation_id)
  } catch (error) {
    conversationResult.value = {
      success: false,
      message: 'Failed to create conversation: ' + error.message
    }
  } finally {
    isCreatingConversation.value = false
  }
}

const retryUntilConversationInList = async (conversationId, maxRetries = 5, delayMs = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 Attempt ${attempt}/${maxRetries}: Checking if conversation ${conversationId} appears in GET list...`)
    
    try {
      await loadConversations()
      const found = conversations.value.find(c => c.conversation_id === conversationId)
      
      if (found) {
        console.log(`✅ Conversation ${conversationId} found in GET list on attempt ${attempt}`)
        return
      }
      
      if (attempt < maxRetries) {
        console.log(`⏳ Conversation ${conversationId} not yet in GET list, waiting ${delayMs}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      console.error(`Error on attempt ${attempt}:`, error)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }
  
  console.log(`❌ Conversation ${conversationId} still not found in GET list after ${maxRetries} attempts`)
}

// Watch for changes in store settings
watch(() => tavusStore.settings, (newSettings) => {
  formData.value = { ...newSettings }
}, { deep: true })

// Auto-load conversations when settings panel loads, but only if API key is available
onMounted(() => {
  if (tavusStore.settings.api_key) {
    loadConversations()
  }
})
</script>