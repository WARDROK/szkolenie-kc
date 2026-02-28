/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a26',
          600: '#222233',
        },
        neon: {
          cyan: '#00f0ff',
          pink: '#ff2d87',
          gold: '#ffd700',
          green: '#39ff14',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-pink': '0 0 20px rgba(255, 45, 135, 0.3)',
        'neon-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
