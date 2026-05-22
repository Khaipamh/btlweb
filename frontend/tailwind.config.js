/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#db2777',       // Hồng chủ đạo
        'primary-dark': '#be185d',
        'primary-light': '#fdf2f8',
      }
    },
  },
  plugins: [],
}