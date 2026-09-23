/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sat: {
          bg: '#000000',       // Pure Black Base
          panel: '#1E1E1E',    // Dark Charcoal Surface
          border: '#373737',   // Mid Grey Border
          muted: '#545454',    // Muted Grey Text
          accent: '#6C6C6C',   // Crisp Silver Highlight
          white: '#FFFFFF'
        }
      }
    },
  },
  plugins: [],
}
