/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        yellow: {
          dilg: "#FFD000",
          light: "#FFF8D6",
        },
        navy: {
          DEFAULT: "#0A1F5C",
          light: "#EEF2FF",
        },
        red: {
          dilg: "#CC1B1B",
          light: "#FFF0F0",
        },
      },
      fontFamily: {
        condensed: ['"Barlow Condensed"', "sans-serif"],
        sans: ["Barlow", "sans-serif"],
      },
    },
  },
  plugins: [],
};