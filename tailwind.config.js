/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08080B',
        sidebar: '#0B0B0F',
        panel: '#131318',
        panel2: '#1A1A21',
        border: '#232329',
        accent: '#FF4D8D',
        accent2: '#7C3AED',
        muted: '#93939F',
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Inter"', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'aira-gradient': 'linear-gradient(135deg, #FF4D8D 0%, #7C3AED 100%)',
      },
    },
  },
  plugins: [],
};
