/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--theme-primary)",
        primaryHover: "var(--theme-primary-hover)",
        secondary: "var(--bg-app)",
        border: "var(--border-color)",
        textDefault: "var(--text-main)",
        textSecondary: "var(--text-muted)",
        
        cellBg: "var(--bg-cell)",
        cellCenterStart: "var(--center-grad-start)",
        cellCenterEnd: "var(--center-grad-end)",
        cellCenterBorder: "var(--center-border)",
        cellCenterTextStart: "var(--center-text-start)",
        cellCenterTextEnd: "var(--center-text-end)",
        cellCenterTextSolid: "var(--center-text-solid)",
        
        sidebarBg: "var(--bg-sidebar)",
      },
      boxShadow: {
        'ant': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'ant-hover': '0 4px 12px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
