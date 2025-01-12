/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundSize: {
        'zoom-out': '150%', // Custom zoom-out effect
      },
      backgroundImage: {
        'stocks-bg': "url('/src/photos/stocks background.png')",
      },
    },
  },
  plugins: [],
}