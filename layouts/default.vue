<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Skip link for keyboard navigation -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <AppNavigation />
    <main id="main-content" class="max-w-7xl mx-auto px-4 py-8" tabindex="-1">
      <slot />
    </main>
    
    <!-- Powered by Bolt Badge -->
    <div class="fixed bottom-4 right-4 z-50">
      <a 
        href="https://bolt.new" 
        target="_blank" 
        rel="noopener noreferrer"
        class="block transition-transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
        title="Powered by Bolt - AI-powered full-stack web development"
        aria-label="Powered by Bolt - AI-powered full-stack web development"
      >
        <img 
          src="/black_circle_360x360.png" 
          alt="Powered by Bolt" 
          class="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
          width="64"
          height="64"
        />
      </a>
    </div>
  </div>
</template>

<script setup>
// This layout will be used by default for all pages
</script>