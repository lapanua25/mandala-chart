/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1890ff",
        secondary: "#f0f2f5",
        border: "#d9d9d9",
        textDefault: "#262626",
        textSecondary: "#8c8c8c"
      },
      boxShadow: {
        'ant': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'ant-hover': '0 4px 12px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
