/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Use class strategy for dark mode
  theme: {
    extend: {
      colors: {
        primary: '#4264fb',   // Mapbox blue color
        'primary-dark': '#1942d8',
        'map-bg-light': '#ffffff',
        'map-bg-dark': '#121212',
        'ui-light': '#ffffff',
        'ui-dark': '#1a1a1a',
        'text-light': '#333333',
        'text-dark': '#f0f0f0',
      },
    },
  },
  plugins: [],
} 