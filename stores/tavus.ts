import { defineStore } from 'pinia'
import { nextTick } from 'vue'

export interface TavusSettings {
  replica_id: string
  persona_id: string
  api_key: string
}

export interface ConversationState {
  isActive: boolean
  isLoading: boolean
  error: string | null
  conversationId: string | null
  conversationUrl: string | null
}

export interface ConversationData {
  conversation_id: string
  conversation_url: string
  conversation_name?: string
  status?: string
  created_at?: string
}

export interface ApiResponse<T = any> {
  data?: T
  message?: string
}

export const useTavusStore = defineStore('tavus', {
  state: () => ({
    settings: {
      replica_id: '',
      persona_id: '',
      api_key: ''
    } as TavusSettings,
    conversation: {
      isActive: false,
      isLoading: false,
      error: null,
      conversationId: null,
      conversationUrl: null
    } as ConversationState
  }),

  actions: {
    async updateSettings(settings: TavusSettings): Promise<void> {
      this.settings = { ...settings }
      // Save to localStorage for persistence
      if (process.client) {
        localStorage.setItem('tavus-settings', JSON.stringify(settings))
      }
    },

    loadSettings(): void {
      if (process.client) {
        const saved = localStorage.getItem('tavus-settings')
        if (saved) {
          try {
            this.settings = JSON.parse(saved)
          } catch (error) {
            console.error('Failed to parse saved settings:', error)
          }
        }
      }
    },

    async testApiConnection(): Promise<{ success: boolean; message: string; details?: string }> {
      if (!this.settings.api_key) {
        throw new Error('API key is required')
      }

      try {
        // Test with conversations endpoint first, then replicas if that fails
        let response = await fetch('https://tavusapi.com/v2/conversations', {
          method: 'GET',
          headers: {
            'x-api-key': this.settings.api_key,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          // Try replicas endpoint as fallback
          response = await fetch('https://tavusapi.com/v2/replicas', {
            method: 'GET',
            headers: {
              'x-api-key': this.settings.api_key,
              'Content-Type': 'application/json'
            }
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`)
          }
        }

        const data = await response.json()
        console.log('API Connection Test Response:', data) // Debug log
        
        let count = 0
        if (Array.isArray(data)) {
          count = data.length
        } else if (data.data && Array.isArray(data.data)) {
          count = data.data.length
        } else if (data.conversations && Array.isArray(data.conversations)) {
          count = data.conversations.length
        }
        
        return {
          success: true,
          message: 'API connection successful!',
          details: `API is accessible. Found ${count} items.`
        }
      } catch (error: any) {
        throw new Error(`Connection failed: ${error.message}`)
      }
    },

    async listConversations(): Promise<ConversationData[]> {
      if (!this.settings.api_key) {
        throw new Error('API key is required')
      }

      try {
        // Add timestamp to prevent caching and try to get latest conversations
        const timestamp = Date.now()
        const response = await fetch(`https://tavusapi.com/v2/conversations?limit=50&_t=${timestamp}`, {
          method: 'GET',
          headers: {
            'x-api-key': this.settings.api_key,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`)
        }

        const data = await response.json()
        console.log('📋 GET conversations API response (first few):', {
          total: Array.isArray(data) ? data.length : (data.data?.length || 'unknown'),
          first3: Array.isArray(data) ? data.slice(0, 3) : (data.data?.slice(0, 3) || [])
        })
        
        // Handle different response formats
        let conversations: ConversationData[] = []
        if (Array.isArray(data)) {
          conversations = data
        } else if (data.data && Array.isArray(data.data)) {
          conversations = data.data
        } else if (data.results && Array.isArray(data.results)) {
          conversations = data.results
        } else if (data.conversations && Array.isArray(data.conversations)) {
          conversations = data.conversations
        } else if (typeof data === 'object' && data !== null) {
          // Handle case where API returns a single object or nested structure
          const keys = Object.keys(data)
          for (const key of keys) {
            if (Array.isArray(data[key])) {
              conversations = data[key]
              break
            }
          }
          
          // If still no array found, check if it's a single conversation object
          if (conversations.length === 0 && data.conversation_id) {
            conversations = [data]
          }
        } else {
          console.warn('Unexpected API response format:', data)
          return []
        }

        console.log(`📊 Found ${conversations.length} total conversations from API`)

        // Ensure all conversations have the required fields and normalize the data
        const normalizedConversations = conversations.map(conv => ({
          conversation_id: conv.conversation_id || conv.id || '',
          conversation_url: conv.conversation_url || conv.url || '',
          conversation_name: conv.conversation_name || conv.name || '',
          status: conv.status || 'unknown',
          created_at: conv.created_at || conv.createdAt || conv.created || conv.timestamp || new Date().toISOString()
        })).filter(conv => conv.conversation_id) // Only include conversations with valid IDs

        console.log(`📝 Normalized ${normalizedConversations.length} conversations`)
        
        // Check if target conversation is in the data
        const targetConv = normalizedConversations.find(c => c.conversation_id === 'caed1468cf0514be')
        if (targetConv) {
          console.log('🎯 Found target conversation caed1468cf0514be:', {
            id: targetConv.conversation_id,
            created_at: targetConv.created_at,
            name: targetConv.conversation_name
          })
        } else {
          console.log('❌ Target conversation caed1468cf0514be NOT found in API response')
        }

        // Sort by creation date (newest first) and limit to 10 most recent
        const sortedConversations = normalizedConversations
          .sort((a, b) => {
            // Parse dates more robustly
            const parseDate = (dateStr: string) => {
              if (!dateStr) return 0
              const parsed = new Date(dateStr)
              return isNaN(parsed.getTime()) ? 0 : parsed.getTime()
            }
            
            const dateA = parseDate(a.created_at || '')
            const dateB = parseDate(b.created_at || '')
            
            // Debug date comparison for first few items
            if (normalizedConversations.indexOf(a) < 5 || normalizedConversations.indexOf(b) < 5) {
              console.log(`📅 Comparing dates: ${a.conversation_id.slice(-6)} (${dateA}) vs ${b.conversation_id.slice(-6)} (${dateB})`)
            }
            
            return dateB - dateA // Descending order (newest first)
          })
          .slice(0, 10) // Take only the 10 most recent
        
        console.log(`🔢 Returning ${sortedConversations.length} most recent conversations:`)
        sortedConversations.forEach((conv, index) => {
          console.log(`  ${index + 1}. ${conv.conversation_id} - ${conv.created_at} - ${conv.conversation_name || 'Unnamed'}`)
        })
        
        // Verify target conversation position
        const targetIndex = sortedConversations.findIndex(c => c.conversation_id === 'caed1468cf0514be')
        if (targetIndex >= 0) {
          console.log(`🎯 Target conversation caed1468cf0514be is at position ${targetIndex + 1} (should be 1 if it's the newest)`)
        }
        
        return sortedConversations
      } catch (error: any) {
        console.error('❌ GET conversations API error:', error)
        throw new Error(`Failed to list conversations: ${error.message}`)
      }
    },

    async listActiveConversations(): Promise<ConversationData[]> {
      const allConversations = await this.listConversations()
      
      // Filter for active conversations
      return allConversations.filter(conversation => {
        const status = conversation.status?.toLowerCase()
        return status === 'active' || 
               status === 'connected' || 
               status === 'ready' || 
               status === 'live' ||
               status === 'running'
      })
    },
    async getConversationById(conversationId: string): Promise<ConversationData> {
      if (!this.settings.api_key) {
        throw new Error('API key is required')
      }

      try {
        const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
          method: 'GET',
          headers: {
            'x-api-key': this.settings.api_key,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`)
        }

        const data = await response.json()
        console.log('Single conversation API Response:', data) // Debug log
        
        // Handle different response formats and normalize
        let conversationData: any = null
        
        if (data.conversation_id || data.id) {
          conversationData = data
        } else if (data.data && (data.data.conversation_id || data.data.id)) {
          conversationData = data.data
        } else if (data.conversation && (data.conversation.conversation_id || data.conversation.id)) {
          conversationData = data.conversation
        } else {
          // Try to find conversation data in any nested object
          const keys = Object.keys(data)
          for (const key of keys) {
            if (typeof data[key] === 'object' && data[key] !== null) {
              if (data[key].conversation_id || data[key].id) {
                conversationData = data[key]
                break
              }
            }
          }
        }
        
        if (!conversationData) {
          throw new Error('Invalid conversation data received')
        }
        
        // Normalize the conversation data
        return {
          conversation_id: conversationData.conversation_id || conversationData.id || '',
          conversation_url: conversationData.conversation_url || conversationData.url || '',
          conversation_name: conversationData.conversation_name || conversationData.name || '',
          status: conversationData.status || 'unknown',
          created_at: conversationData.created_at || conversationData.createdAt || conversationData.timestamp || new Date().toISOString()
        }
      } catch (error: any) {
        throw new Error(`Failed to get conversation: ${error.message}`)
      }
    },

    async endConversationById(conversationId: string): Promise<{ success: boolean; message: string }> {
      if (!this.settings.api_key) {
        throw new Error('API key is required')
      }

      try {
        // Try to end the conversation using PUT method to update status
        let response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/end`, {
          method: 'POST',
          headers: {
            'x-api-key': this.settings.api_key,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          // If specific end endpoint doesn't exist, try PATCH to update status
          console.log('POST /end method not supported, trying PATCH method...')
          response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
            method: 'PATCH',
            headers: {
              'x-api-key': this.settings.api_key,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'ended' })
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            // If PATCH also fails, we'll have to use DELETE but warn about it
            console.warn('⚠️ Neither POST /end nor PATCH methods supported. This API may only support DELETE which will permanently remove the conversation.')
            throw new Error(`Failed to end conversation: ${response.status} - ${errorData.message || response.statusText}. Note: This API may only support permanent deletion.`)
          }
        }

        // If this is the currently active conversation, clean up local state
        if (this.conversation.conversationId === conversationId) {
          this.conversation.isActive = false
          this.conversation.conversationId = null
          this.conversation.conversationUrl = null
          this.conversation.error = null
          
          // Clean up video embed
          if (process.client) {
            const container = document.getElementById('tavus-video-container')
            if (container) {
              container.innerHTML = ''
            }
          }
        }

        return { success: true, message: 'Conversation ended successfully (status updated to ended)' }
      } catch (error: any) {
        throw new Error(`Failed to end conversation: ${error.message}`)
      }
    },

    async deleteConversationById(conversationId: string): Promise<{ success: boolean; message: string }> {
      if (!this.settings.api_key) {
        throw new Error('API key is required')
      }

      try {
        // Use DELETE method to permanently remove the conversation
        const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
          method: 'DELETE',
          headers: {
            'x-api-key': this.settings.api_key,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`Failed to delete conversation: ${response.status} - ${errorData.message || response.statusText}`)
        }

        // If this is the currently active conversation, clean up local state
        if (this.conversation.conversationId === conversationId) {
          this.conversation.isActive = false
          this.conversation.conversationId = null
          this.conversation.conversationUrl = null
          this.conversation.error = null
          
          // Clean up video embed
          if (process.client) {
            const container = document.getElementById('tavus-video-container')
            if (container) {
              container.innerHTML = ''
            }
          }
        }
        
        return { success: true, message: 'Conversation deleted successfully' }
      } catch (error: any) {
        throw new Error(`Failed to delete conversation: ${error.message}`)
      }
    },
    async createConversation(conversationName?: string): Promise<ConversationData> {
      if (!this.settings.api_key) {
        throw new Error('API key is required')
      }

      if (!this.settings.replica_id || !this.settings.persona_id) {
        throw new Error('Replica ID and Persona ID are required')
      }

      try {
        const timestamp = new Date().toISOString()
        const payload = {
          replica_id: this.settings.replica_id,
          persona_id: this.settings.persona_id,
          conversation_name: conversationName || `Conversation ${timestamp}`
        }
        
        console.log('🚀 Making POST request to create conversation:', payload)
        const response = await fetch('https://tavusapi.com/v2/conversations', {
          method: 'POST',
          headers: {
            'x-api-key': this.settings.api_key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ POST create conversation API error:', response.status, errorData)
          throw new Error(`Failed to create conversation: ${response.status} - ${errorData.message || response.statusText}`)
        }

        const data = await response.json()
        console.log('✅ POST create conversation API response:', data)
        
        // Handle different response formats
        let conversationData: ConversationData
        if (data.conversation_id) {
          conversationData = data
        } else if (data.data && data.data.conversation_id) {
          conversationData = data.data
        } else if (data.result && data.result.conversation_id) {
          conversationData = data.result
        } else {
          console.error('❌ Invalid conversation data structure:', data)
          throw new Error('Invalid conversation data received from create API')
        }
        
        // Ensure the conversation has a created_at timestamp
        if (!conversationData.created_at) {
          conversationData.created_at = timestamp
        }
        
        console.log('📝 Created conversation:', conversationData)
        return conversationData
      } catch (error: any) {
        console.error('❌ Failed to create conversation:', error)
        throw new Error(`Failed to create conversation: ${error.message}`)
      }
    },

    async waitForConversationInList(conversationId: string, maxAttempts: number = 5, delayMs: number = 2000): Promise<ConversationData | null> {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`Attempt ${attempt}/${maxAttempts}: Checking if conversation ${conversationId} appears in list...`)
          
          const conversations = await this.listConversations()
          const found = conversations.find(c => c.conversation_id === conversationId)
          
          if (found) {
            console.log(`✅ Conversation ${conversationId} found in list on attempt ${attempt}`)
            return found
          }
          
          if (attempt < maxAttempts) {
            console.log(`⏳ Conversation ${conversationId} not yet in list, waiting ${delayMs}ms before retry...`)
            await new Promise(resolve => setTimeout(resolve, delayMs))
          }
        } catch (error) {
          console.error(`Error on attempt ${attempt}:`, error)
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delayMs))
          }
        }
      }
      
      console.log(`❌ Conversation ${conversationId} still not found in list after ${maxAttempts} attempts`)
      return null
    },

    async createConversationWithRetry(conversationName?: string): Promise<ConversationData> {
      // Create the conversation
      const newConversation = await this.createConversation(conversationName)
      
      // Try to verify it appears in the list (but don't fail if it doesn't)
      try {
        const foundInList = await this.waitForConversationInList(newConversation.conversation_id)
        if (foundInList) {
          // Return the version from the list as it might have updated status/fields
          return foundInList
        }
      } catch (error) {
        console.warn('Failed to verify conversation in list, but creation was successful:', error)
      }
      
      // Return the original created conversation data
      return newConversation
    },
    async startConversation(): Promise<void> {
      this.conversation.isLoading = true
      this.conversation.error = null

      try {
        if (!this.settings.api_key) {
          throw new Error('API key is required. Please configure in admin panel.')
        }

        if (!this.settings.replica_id || !this.settings.persona_id) {
          throw new Error('Replica ID and Persona ID are required. Please configure in admin panel.')
        }

        // Create a new conversation
        const conversationData = await this.createConversation()
        
        this.conversation.conversationId = conversationData.conversation_id
        this.conversation.conversationUrl = conversationData.conversation_url
        this.conversation.isActive = true
        // Set loading to false so the video container can render
        this.conversation.isLoading = false

        // Initialize Tavus video embed after DOM update
        if (process.client) {
          await nextTick()
          await this.initializeTavusVideo(conversationData.conversation_url)
        }

      } catch (error: any) {
        this.conversation.error = error instanceof Error ? error.message : 'Failed to start conversation'
        this.conversation.isLoading = false
        console.error('Conversation start error:', error)
      }
    },

    async joinExistingConversation(conversationId: string): Promise<void> {
      this.conversation.isLoading = true
      this.conversation.error = null

      try {
        if (!this.settings.api_key) {
          throw new Error('API key is required. Please configure in admin panel.')
        }

        // Get conversation details
        const conversationData = await this.getConversationById(conversationId)
        
        this.conversation.conversationId = conversationId
        this.conversation.conversationUrl = conversationData.conversation_url
        this.conversation.isActive = true
        this.conversation.isLoading = false

        // Initialize Tavus video embed after DOM update
        if (process.client) {
          await nextTick()
          await this.initializeTavusVideo(conversationData.conversation_url)
        }

      } catch (error: any) {
        this.conversation.error = error instanceof Error ? error.message : 'Failed to join conversation'
        this.conversation.isLoading = false
        console.error('Join conversation error:', error)
      }
    },

    async endConversation(): Promise<void> {
      // Clean up local conversation state only (no API call to delete)
      this.conversation.isActive = false
      this.conversation.conversationId = null
      this.conversation.conversationUrl = null
      this.conversation.error = null
      
      // Clean up video embed
      if (process.client) {
        const container = document.getElementById('tavus-video-container')
        if (container) {
          container.innerHTML = ''
        }
      }
    },

    async initializeTavusVideo(conversationUrl: string): Promise<void> {
      if (!process.client) return

      const container = document.getElementById('tavus-video-container')
      if (!container) {
        throw new Error('Video container not found')
      }

      console.log('🎥 Initializing Tavus video with URL:', conversationUrl)

      // Validate the conversation URL before attempting to load
      if (!conversationUrl || !conversationUrl.startsWith('https://')) {
        throw new Error('Invalid conversation URL provided')
      }

      // Check if the URL is accessible before creating iframe
      try {
        const testResponse = await fetch(conversationUrl, { 
          method: 'HEAD',
          mode: 'no-cors' // Allow cross-origin requests
        }).catch(() => null)
        
        // If we can't even make a HEAD request, the URL might be invalid
        if (testResponse === null) {
          console.warn('⚠️ Could not verify conversation URL accessibility')
        }
      } catch (error) {
        console.warn('⚠️ URL validation failed:', error)
      }
      // Create iframe for Tavus conversation
      const iframe = document.createElement('iframe')
      iframe.src = conversationUrl
      iframe.style.width = '100%'
      iframe.style.height = '100%'
      iframe.style.border = 'none'
      iframe.allow = 'camera; microphone; autoplay; encrypted-media; fullscreen'
      iframe.allowFullscreen = true

      // Add error handling for iframe loading
      iframe.onerror = (error) => {
        console.error('❌ Iframe failed to load:', error)
        this.conversation.error = 'Failed to load video interface. This may be due to network restrictions, firewall settings, or the conversation may not be ready yet. Please check your network connection and try again.'
      }

      iframe.onload = () => {
        console.log('✅ Iframe loaded successfully')
        // Clear any previous errors when iframe loads successfully
        if (this.conversation.error?.includes('Failed to load video interface')) {
          this.conversation.error = null
        }
      }

      container.innerHTML = ''
      container.appendChild(iframe)

      // Listen for iframe messages if needed
      const messageHandler = (event: MessageEvent) => {
        // Allow messages from both Tavus and Daily.co domains
        const allowedOrigins = [
          'https://tavusapi.com',
          'https://tavus.daily.co',
          'https://daily.co',
          'https://app.daily.co'
        ]
        
        if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
          return
        }
        
        console.log('📨 Received message from video interface:', event.data)
        
        // Handle Tavus events
        if (event.data.type === 'conversation_ended') {
          console.log('🔚 Conversation ended via video interface')
          this.endConversation()
        } else if (event.data.type === 'error') {
          console.error('❌ Video interface error:', event.data)
          const errorMessage = event.data.message || 'Video interface error occurred'
          if (errorMessage.includes('Connection refused') || errorMessage.includes('daily.co')) {
            this.conversation.error = 'Connection to video service failed. This may be due to network restrictions or firewall settings. Please check your network connection and try again.'
          } else {
            this.conversation.error = errorMessage
          }
        } else if (event.data.type === 'ready') {
          console.log('✅ Video interface ready')
          // Clear any previous errors when video is ready
          this.conversation.error = null
        } else if (event.data.type === 'connection_failed') {
          console.error('❌ Video connection failed:', event.data)
          this.conversation.error = 'Failed to connect to video service. Please check your network connection and try again.'
        }
      }

      window.addEventListener('message', messageHandler)
      
      // Set a timeout to detect if the video fails to load and provide helpful error message
      setTimeout(() => {
        if (this.conversation.isActive && this.conversation.error === null) {
          // Check if the iframe has loaded content
          if (iframe.contentWindow) {
            try {
              // Try to access iframe content (will fail due to CORS but that's expected)
              iframe.contentWindow.postMessage({ type: 'ping' }, '*')
              console.log('🔒 Video interface loaded (CORS protected)')
            } catch (e) {
              console.log('🔒 Video interface loaded (CORS protected)')
            }
          } else {
            console.warn('⚠️ Video interface may be loading slowly or have connection issues')
            this.conversation.error = 'Video interface is taking longer than expected to load. This may be due to network issues or the conversation may not be ready. Please try refreshing the page.'
          }
        }
      }, 15000) // 15 second timeout (increased from 10)
      
      // Add a cleanup function to remove event listener when component unmounts
      const cleanup = () => {
        window.removeEventListener('message', messageHandler)
      }
      
      // Store cleanup function for later use
      if (!window.tavusCleanupFunctions) {
        window.tavusCleanupFunctions = []
      }
      window.tavusCleanupFunctions.push(cleanup)
    }
  }
})