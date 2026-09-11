/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'hgt-green': '#1DB854',
        'hgt-dark': '#0a0e27',
        'hgt-light': '#f8f9fa',
      },
    },
  },
  plugins: [],
}
