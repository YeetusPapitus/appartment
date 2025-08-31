/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: "#206FCC",     // Royal Blue – primary accent
        sky: "#A9D6E5",        // Sky Blue – backgrounds, light accents
        sand: "#F5E9DC",       // Sandy Beige – base background
        stone: "#D8D8D8",      // Stone Gray – borders, containers
        olive: {
          DEFAULT: "#8DA47E",      // Olive Green – secondary accent
          dark: "#7a926f",
        },
        charcoal: "#333333",   // Charcoal – primary text
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}

