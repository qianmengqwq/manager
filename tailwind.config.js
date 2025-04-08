/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
    './node_modules/rc-modal-sheet/**/*.js',
  ],
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
