/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd6ff',
          300: '#8db8ff',
          400: '#5b94ff',
          500: '#376ff5',
          600: '#264fd8',
          700: '#1f3fb0',
          800: '#1f378b',
          900: '#1f326d'
        }
      },
      boxShadow: {
        soft: '0 12px 40px -18px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: []
};
