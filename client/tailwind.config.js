/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10201f',
        brand: { DEFAULT: '#0e5a57', dark: '#0a423f', soft: '#d9ece9' },
        saffron: { DEFAULT: '#f5a524', soft: '#fff1d6' },
        rose: { DEFAULT: '#e8718d', soft: '#fde4ea' },
        mist: '#f3f8f7',
        line: '#d5e2e0',
        muted: '#52665f',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
