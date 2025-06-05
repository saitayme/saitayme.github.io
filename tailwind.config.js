/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#0a0a0a',
        'cyber-dark': '#1a1a1a',
        'primary': '#f07e41',
        'neon-blue': '#00fffc',
        'neon-pink': '#ff00c1',
      },
      fontFamily: {
        'cyber': ['Orbitron', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'cp-glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-1px, 1px)' },
          '40%': { transform: 'translate(-1px, -1px)' },
          '60%': { transform: 'translate(1px, 1px)' },
          '80%': { transform: 'translate(1px, -1px)' },
          '100%': { transform: 'translate(0)' }
        },
        'cp-glitch-1': {
          '0%': { opacity: '1', transform: 'translate(0)' },
          '20%': { opacity: '0.8', transform: 'translate(-4px, 0)' },
          '40%': { opacity: '0.9', transform: 'translate(4px, 0)' },
          '60%': { opacity: '0.2', transform: 'translate(-4px, 0)' },
          '80%': { opacity: '0.9', transform: 'translate(4px, 0)' },
          '100%': { opacity: '1', transform: 'translate(0)' }
        },
        'cp-glitch-2': {
          '0%': { opacity: '1', transform: 'translate(0)' },
          '20%': { opacity: '0.7', transform: 'translate(4px, 0)' },
          '40%': { opacity: '0.9', transform: 'translate(-4px, 0)' },
          '60%': { opacity: '0.4', transform: 'translate(4px, 0)' },
          '80%': { opacity: '0.9', transform: 'translate(-4px, 0)' },
          '100%': { opacity: '1', transform: 'translate(0)' }
        },
        'glitch-slide': {
          '0%': { clipPath: 'inset(79% 0 0 0)' },
          '10%': { clipPath: 'inset(29% 0 25% 0)' },
          '20%': { clipPath: 'inset(61% 0 38% 0)' },
          '30%': { clipPath: 'inset(25% 0 58% 0)' },
          '40%': { clipPath: 'inset(54% 0 7% 0)' },
          '50%': { clipPath: 'inset(10% 0 43% 0)' },
          '60%': { clipPath: 'inset(43% 0 74% 0)' },
          '70%': { clipPath: 'inset(37% 0 29% 0)' },
          '80%': { clipPath: 'inset(92% 0 6% 0)' },
          '90%': { clipPath: 'inset(3% 0 79% 0)' },
          '100%': { clipPath: 'inset(45% 0 47% 0)' }
        }
      },
      animation: {
        'cp-glitch': 'cp-glitch 0.3s ease infinite',
        'cp-glitch-1': 'cp-glitch-1 0.4s ease infinite',
        'cp-glitch-2': 'cp-glitch-2 0.3s ease infinite',
        'glitch-slide': 'glitch-slide 4s infinite linear alternate-reverse'
      }
    },
  },
  plugins: [],
}