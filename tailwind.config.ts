import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
    './assets/css/main.css'
  ],
  theme: {
    extend: {
      // Custom utilities for accessibility
      aria: {
        'invalid': 'invalid'
      }
    }
  },
  plugins: [
    // Add plugin for aria variants if needed
    function({ addVariant }) {
      addVariant('aria-invalid', '&[aria-invalid="true"]')
    }
  ]
}