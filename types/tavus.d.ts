declare global {
  interface Window {
    tavusConnection?: {
      connect: (replicaId: string, personaId: string) => Promise<void>
      disconnect: () => void
    }
    tavusCleanupFunctions?: (() => void)[]
  }
}

export interface TavusConversation {
  conversation_id: string
  conversation_url: string
  conversation_name?: string
  status?: 'active' | 'connected' | 'ended' | 'disconnected' | 'pending'
  created_at?: string
}

export interface TavusApiError {
  message: string
  code?: string
  status?: number
}

export interface TavusSettings {
  replica_id: string
  persona_id: string
  api_key: string
}

export {}