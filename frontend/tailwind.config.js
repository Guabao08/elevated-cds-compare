/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          950: "#0D2218",
          900: "#1B3A2F",
          800: "#234D3D",
          700: "#2D634F",
          600: "#3A7D64",
          500: "#4A9E80",
          400: "#6BBD9F",
          300: "#94D4BC",
          200: "#BDE8D9",
          100: "#E0F5EE",
          50:  "#F0FAF6",
        },
        cream: {
          DEFAULT: "#F5EFE0",
          dark:    "#EDE4CE",
          light:   "#FAF6EE",
        },
        orange: {
          DEFAULT: "#E85D2F",
          dark:    "#C44A20",
          light:   "#F07A52",
          pale:    "#FAEAE4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
