/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sffalcon: {
          bg: '#0A1628',
          card: '#111F3A',
          border: '#1E3A5F',
          accent: '#1B4FD8',
          'accent-hover': '#1E40AF',
          'input-bg': '#0D1B35',
          'text-secondary': '#94A3B8',
          'text-muted': '#475569',
        },
      },
    },
  },
  plugins: [],
}
