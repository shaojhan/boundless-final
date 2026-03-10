/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    screens: {
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1400px',
    },
    extend: {
      colors: {
        primary: '#1581cc',
        'light-primary': '#18a1ff',
        'deep-primary': '#124365',
        secondary: '#666666',
        body: '#b9b9b9',
        red: '#ec3f3f',
        dark: '#1d1d1d',
        yellow: '#faad14',
      },
    },
  },
  plugins: [],
}
