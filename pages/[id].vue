<template>
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Conversation</h1>
      <p class="text-gray-600">ID: {{ conversationId }}</p>
    </div>

    <!-- Back Navigation -->
    <div class="mb-6">
      <NuxtLink to="/" class="text-blue-600 hover:text-blue-800 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </NuxtLink>
    </div>

    <!-- Conversation Status -->
    <ClientOnly>
      <div class="card mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Conversation Status</h3>
            <p class="text-sm text-gray-600 mt-1">
              Status: 
              <span v-if="conversationStatus === 'checking'" class="text-yellow-600">Checking...</span>
              <span v-else-if="conversationStatus === 'active'" class="text-green-600 font-medium">Active</span>
              <span v-else-if="conversationStatus === 'not_found'" class="text-red-600 font-medium">Not Found</span>
              <span v-else-if="conversationStatus === 'ended'" class="text-gray-600 font-medium">Ended</span>
              <span v-else-if="conversationStatus === 'no_api_key'" class="text-red-600 font-medium">Configuration Required</span>
              <span v-else class="text-gray-600 font-medium">Unknown</span>
            </p>
          </div>
          <button
            @click="checkConversationStatus"
            :disabled="isCheckingStatus"
            class="btn-secondary"
          >
            <span v-if="isCheckingStatus" class="loading-spinner mr-2"></span>
            {{ isCheckingStatus ? 'Checking...' : 'Refresh Status' }}
          </button>
        </div>
      </div>
    </ClientOnly>

    <!-- Video Container -->
    <ClientOnly>
      <div class="card mb-8">
        <div class="video-container">
          <div v-if="conversationStatus !== 'active'" 
               class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div class="text-center text-white">
              <div class="w-24 h-24 mx-auto mb-6 bg-red-600 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">Conversation Not Available</h3>
              <p class="text-gray-300 mb-4">
                {{ getStatusMessage() }}
              </p>
              <div class="space-y-2">
                <NuxtLink to="/" class="btn-primary block">
                  Try Another Conversation
                </NuxtLink>
                <ClientOnly>
                  <NuxtLink to="/settings" class="btn-secondary block">
                    Settings
                  </NuxtLink>
                </ClientOnly>
              </div>
            </div>
          </div>

          <div v-else-if="!tavusStore.conversation.isActive && !tavusStore.conversation.isLoading" 
               class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800">
            <div class="text-center text-white">
              <div class="w-24 h-24 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">Ready to Join</h3>
              <p class="text-blue-200">Click "Join Conversation" to connect to this active conversation</p>
            </div>
          </div>

          <div v-else-if="tavusStore.conversation.isLoading" 
               class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800">
            <div class="text-center text-white">
              <div class="loading-spinner w-12 h-12 mx-auto mb-4 border-4"></div>
              <h3 class="text-xl font-semibold mb-2">Connecting to Agent</h3>
              <p class="text-blue-200">Please wait while we establish the connection...</p>
            </div>
          </div>

          <div v-else-if="tavusStore.conversation.isActive" 
               class="absolute inset-0">
            <!-- Tavus video will be embedded here -->
            <div id="tavus-video-container" class="w-full h-full"></div>
            
            <!-- Overlay controls -->
            <div class="absolute bottom-4 left-4 right-4 flex justify-center">
              <div class="bg-black bg-opacity-50 rounded-lg px-4 py-2 text-white text-sm">
                Connected to Agent • {{ sessionDuration }}
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-if="tavusStore.conversation.error" 
               class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900 to-red-800">
            <div class="text-center text-white p-8">
              <div class="w-24 h-24 mx-auto mb-6 bg-red-600 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">Connection Error</h3>
              <p class="text-red-200">{{ tavusStore.conversation.error }}</p>
              <div v-if="tavusStore.conversation.error?.includes('network') || tavusStore.conversation.error?.includes('Connection')" class="mt-4 text-sm text-red-200">
                <p class="mb-2"><strong>Troubleshooting tips:</strong></p>
                <ul class="text-left space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Disable VPN or proxy if enabled</li>
                  <li>• Try a different network or browser</li>
                  <li>• Contact your network administrator if on corporate network</li>
                </ul>
              </div>
              <div class="mt-4 space-y-2">
                <button
                  @click="retryConnection"
                  class="btn-primary"
                >
                  Retry Connection
                </button>
                <button
                  @click="tavusStore.conversation.error = null"
                  class="btn-secondary"
                >
                  Dismiss Error
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>

    <!-- Controls -->
    <ClientOnly>
      <div class="card">
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            v-if="conversationStatus === 'active' && !tavusStore.conversation.isActive"
            @click="joinConversation"
            :disabled="tavusStore.conversation.isLoading"
            class="btn-primary flex items-center px-8 py-4 text-lg"
          >
            <span v-if="tavusStore.conversation.isLoading" class="loading-spinner mr-3"></span>
            <svg v-else class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            {{ tavusStore.conversation.isLoading ? 'Connecting...' : 'Join Conversation' }}
          </button>

          <button
            v-else-if="tavusStore.conversation.isActive"
            @click="endConversation"
            class="bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-8 rounded-lg transition-colors duration-200 flex items-center text-lg"
          >
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 7v10a2 2 0 002 2h4l3-3h5a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"/>
            </svg>
            End Conversation
          </button>

          <div v-else class="text-center">
            <p class="text-gray-600 mb-4">This conversation is not available for joining.</p>
            <NuxtLink to="/" class="btn-primary">
              Try Another Conversation
            </NuxtLink>
          </div>

          <div class="text-sm text-gray-500 ml-4">
            <p v-if="tavusStore.conversation.isActive">
              Status: <span class="text-green-600 font-medium">Connected</span>
            </p>
            <p v-else>
              Status: <span class="text-gray-600 font-medium">Disconnected</span>
            </p>
          </div>
        </div>
      </div>
    </ClientOnly>

    <!-- Session Information -->
    <ClientOnly>
      <div v-if="tavusStore.conversation.isActive" class="card mt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Session Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ sessionDuration }}</div>
            <div class="text-sm text-blue-800">Duration</div>
          </div>
          <div class="p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">Active</div>
            <div class="text-sm text-green-800">Status</div>
          </div>
          <div class="p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ conversationId.slice(-6) }}</div>
            <div class="text-sm text-purple-800">Session ID</div>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { ConversationData } from '~/stores/tavus'

type ConversationStatus = 'checking' | 'active' | 'not_found' | 'ended' | 'no_api_key' | 'error'

const route = useRoute()
const tavusStore = useTavusStore()

// Get conversation ID from route params
const conversationId = computed<string>(() => route.params.id as string)

// Conversation status tracking
const conversationStatus = ref<ConversationStatus>('checking')
const isCheckingStatus = ref<boolean>(false)

// Session tracking
const sessionStartTime = ref<number | null>(null)
const sessionDuration = ref<string>('00:00')

const getStatusMessage = (): string => {
  switch (conversationStatus.value) {
    case 'checking':
      return 'Checking conversation status...'
    case 'not_found':
      return 'This conversation was not found or has ended.'
    case 'ended':
      return 'This conversation has ended.'
    case 'no_api_key':
      return 'System configuration required. Please contact an administrator.'
    case 'error':
      return 'Unable to verify conversation status.'
    default:
      return 'This conversation is not available.'
  }
}

const checkConversationStatus = async (): Promise<void> => {
  if (!tavusStore.settings.api_key) {
    conversationStatus.value = 'no_api_key'
    return
  }

  isCheckingStatus.value = true
  
  try {
    const conversations = await tavusStore.listConversations()
    const conversation = conversations.find(c => c.conversation_id === conversationId.value)
    
    if (conversation) {
      // Check if conversation is active/available for joining
      if (conversation.status === 'active' || conversation.status === 'connected') {
        conversationStatus.value = 'active'
      } else {
        conversationStatus.value = 'ended'
      }
    } else {
      conversationStatus.value = 'not_found'
    }
  } catch (error: any) {
    console.error('Failed to check conversation status:', error)
    conversationStatus.value = 'error'
  } finally {
    isCheckingStatus.value = false
  }
}

const joinConversation = async (): Promise<void> => {
  if (conversationStatus.value !== 'active') {
    return
  }

  sessionStartTime.value = Date.now()
  
  // Set the conversation ID in the store before starting
  tavusStore.conversation.conversationId = conversationId.value
  
  // Join the existing conversation instead of creating a new one
  await tavusStore.joinExistingConversation(conversationId.value)
  
  if (tavusStore.conversation.isActive) {
    startDurationTimer()
  }
}

const endConversation = async (): Promise<void> => {
  try {
    sessionStartTime.value = null
    sessionDuration.value = '00:00'
    
    // Use the specific endConversationById method instead of the generic endConversation
    if (conversationId.value) {
      await tavusStore.endConversationById(conversationId.value)
    }
    
    // Clean up local conversation state
    tavusStore.conversation.isActive = false
    tavusStore.conversation.conversationId = null
    tavusStore.conversation.conversationUrl = null
    tavusStore.conversation.error = null
    
    // Clean up video embed
    if (process.client) {
      const container = document.getElementById('tavus-video-container')
      if (container) {
        container.innerHTML = ''
      }
    }
    
    // Update conversation status to reflect it's ended
    conversationStatus.value = 'ended'
  } catch (error: any) {
    console.error('Failed to end conversation:', error)
    tavusStore.conversation.error = error.message || 'Failed to end conversation'
  }
}

const retryConnection = async (): Promise<void> => {
  if (!conversationId.value) return
  
  // Clear the error and try to reconnect
  tavusStore.conversation.error = null
  tavusStore.conversation.isLoading = true
  
  try {
    // Get fresh conversation data
    const conversationData = await tavusStore.getConversationById(conversationId.value)
    
    // Re-initialize the video with the fresh URL
    if (conversationData.conversation_url) {
      await tavusStore.initializeTavusVideo(conversationData.conversation_url)
    } else {
      throw new Error('No conversation URL available')
    }
  } catch (error: any) {
    tavusStore.conversation.error = error.message || 'Failed to retry connection'
  } finally {
    tavusStore.conversation.isLoading = false
  }
}

const startDurationTimer = (): void => {
  const timer = setInterval(() => {
    if (!tavusStore.conversation.isActive || !sessionStartTime.value) {
      clearInterval(timer)
      return
    }
    
    const elapsed = Date.now() - sessionStartTime.value
    const minutes = Math.floor(elapsed / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)
    sessionDuration.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, 1000)
}

// Load settings and check conversation status on mount
onMounted(() => {
  tavusStore.loadSettings()
  checkConversationStatus()
})

// Watch for conversation ID changes
watch(conversationId, () => {
  checkConversationStatus()
})

// Clean up on component unmount
onUnmounted(() => {
  if (tavusStore.conversation.isActive) {
    tavusStore.endConversation()
  }
})
</script>