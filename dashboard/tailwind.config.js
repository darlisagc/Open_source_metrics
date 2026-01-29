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
        cardano: {
          blue: '#0033AD',
          'blue-light': '#0045E6',
          'blue-dark': '#002080',
          'blue-50': '#E6EBFF',
          'blue-100': '#B3C2FF',
          'blue-200': '#809AFF',
          'blue-300': '#4D71FF',
          'blue-400': '#1A49FF',
          'blue-500': '#0033AD',
          'blue-600': '#002A8F',
          'blue-700': '#002070',
          'blue-800': '#001752',
          'blue-900': '#000D33',
        },
        // Dark theme colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      backgroundImage: {
        'cardano-gradient': 'linear-gradient(135deg, #0033AD 0%, #001752 100%)',
        'cardano-gradient-light': 'linear-gradient(135deg, #0045E6 0%, #0033AD 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 51, 173, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 51, 173, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
