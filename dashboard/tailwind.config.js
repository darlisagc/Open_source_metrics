/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Cardano Foundation brand colors
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9e0fe',
          300: '#7cc8fd',
          400: '#36adf9',
          500: '#0c91eb',
          600: '#0072c9',
          700: '#015ba3',
          800: '#064d86',
          900: '#0b416f',
        },
      },
    },
  },
  plugins: [],
}
