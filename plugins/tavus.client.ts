import { defineNuxtPlugin } from '#app'

// Tavus SDK integration (client-side only)
export default defineNuxtPlugin(() => {
  // Initialize Tavus-related client-side functionality
  if (process.client) {
    // Add any global Tavus initialization here
    console.log('Tavus client plugin initialized')
    
    // Global error handler for Tavus-related errors
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('tavus') || event.reason?.message?.includes('Tavus')) {
        console.error('Tavus error:', event.reason)
        // You could show a user-friendly error message here
      }
    })
  }
})