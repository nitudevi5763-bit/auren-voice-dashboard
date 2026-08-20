/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0C',
        sidebar: '#0D0D10',
        panel: '#131316',
        panel2: '#18181C',
        border: '#232327',
        accent: '#FF4D8D',
        accent2: '#7C3AED',
        muted: '#8B8B94',
      },
      fontFamily: {
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
