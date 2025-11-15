/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monochrome theme: black, white and grays
        black: {
          DEFAULT: "#000000",
          500: "#000000",
          700: "#111111",
        },
        white: {
          DEFAULT: "#ffffff",
        },
        gray: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#eeeeee",
          300: "#e0e0e0",
          400: "#bdbdbd",
          500: "#9e9e9e",
          700: "#616161",
          900: "#212121",
        },
      },
      fontFamily: {
        sans: ["'Segoe UI'", "Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 8px 20px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
