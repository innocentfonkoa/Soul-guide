/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e3ebe3',
          200: '#c6d8c6',
          400: '#7da87d',
          600: '#4a7c4a',
          900: '#1e3a1e',
        },
        clay: {
          50: '#fdf4f0',
          100: '#fae5d8',
          300: '#f0b89a',
          500: '#d97b52',
          700: '#a0502e',
        },
        cream: '#fdfaf7',
        charcoal: '#2c2c2c',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
};
