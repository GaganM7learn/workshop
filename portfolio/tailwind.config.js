/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        carbon: {
          DEFAULT: '#0d1117',
          dark: '#080b0f',
          surface: '#161b22',
          card: '#1b222d',
          border: '#233040',
        },
        emerald: {
          DEFAULT: '#10b981',
          neon: '#00ff9d',
          dark: '#064e3b',
          glow: 'rgba(16, 185, 129, 0.45)',
        },
        lime: {
          DEFAULT: '#a3e635',
          neon: '#ccff00',
          accent: '#84cc16',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};
