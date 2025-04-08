/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          background: "#f9fafb",   // soft gray
          primary: "#4f46e5",      // indigo
          secondary: "#fbbf24",    // amber
          text: "#1f2937",         // slate
        },
        dark: {
          background: "#111827",   // rich charcoal
          primary: "#6366f1",      // soft indigo
          secondary: "#f59e0b",    // golden amber
          text: "#f3f4f6",         // near-white
        },
      },
    },
  },
  plugins: [],
}
