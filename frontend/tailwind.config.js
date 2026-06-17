/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          50: '#fbf9f6',
          100: '#f5eee6',
          200: '#e6d8c8',
          300: '#ceb9a1',
          400: '#b19577',
          500: '#977a5d', // Deep warm taupe
          600: '#81654d',
          700: '#6c533f',
          800: '#574233',
          900: '#48372b',
          950: '#271d17',
        },
        gold: {
          50: '#faf8f2',
          100: '#f4ebd5',
          200: '#e6d2a4',
          300: '#d4b470',
          400: '#c39546',
          500: '#b48131', // Bronze Gold
          600: '#986826',
          700: '#7e5120',
          800: '#67411c',
          900: '#55351a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Outfit', 'serif'],
      }
    },
  },
  plugins: [],
}
