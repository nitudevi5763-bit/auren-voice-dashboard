/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0D10',
        panel: '#14171C',
        panel2: '#1B1F26',
        border: '#262B33',
        amber: '#F5A524',
        mint: '#3DDC97',
        muted: '#7A8290',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
