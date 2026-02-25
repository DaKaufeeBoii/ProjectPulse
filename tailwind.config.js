/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
      },
      colors: {
        surface: {
          DEFAULT: '#0f0f14',
          1: '#161620',
          2: '#1e1e2e',
          3: '#252535',
        },
        accent: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dim: '#312e81',
        },
        jade: '#10b981',
        amber: '#f59e0b',
        rose: '#f43f5e',
        sky: '#38bdf8',
      },
    },
  },
  plugins: [],
}
