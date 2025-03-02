/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        radius: {
          primary: "#6366F1", // Indigo-500 - modify to match Radius brand
          secondary: "#F472B6", // Pink-400 - modify to match Radius brand
          dark: "#1E293B", // Slate-800
          light: "#F8FAFC", // Slate-50
          accent: "#10B981", // Emerald-500
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
