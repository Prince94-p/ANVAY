/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        anvay: {
          50: '#e7f7fc',
          100: '#eaf8fc',
          200: '#bfe7f6',
          300: '#7dd3ed',
          400: '#20a7ce',
          500: '#0f6d8e',
          600: '#0f5f7d',
          700: '#0b5874',
          800: '#09475e',
          900: '#063445',
          950: '#03202c',
        },
        surface: {
          bg: '#f8fbff',
          card: '#ffffff',
          border: '#e7edf4',
          subtle: '#eef2f6',
          dark: '#101828',
          darkCard: '#1d2939'
        },
        slateText: {
          primary: '#101828',
          secondary: '#667085',
          muted: '#98a2b3',
          darkSecondary: '#475467'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'anvay-card': '0 25px 70px rgba(16,24,40,.12)',
        'anvay-soft': '0 18px 55px rgba(16,24,40,.07)',
        'anvay-hover': '0 15px 35px rgba(16,24,40,.09)'
      }
    },
  },
  plugins: [],
}
