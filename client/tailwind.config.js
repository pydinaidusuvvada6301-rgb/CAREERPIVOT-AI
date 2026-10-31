/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050814',
          surface: '#0a1024',
          card: 'rgba(12, 20, 44, 0.7)',
          border: 'rgba(56, 189, 248, 0.2)',
          'border-focus': 'rgba(139, 92, 246, 0.5)',
          text: '#f1f5f9',
          muted: '#94a3b8',
        },
        electric: {
          400: '#38bdf8',
          500: '#00f0ff',
          600: '#0284c7',
        },
        neon: {
          purple: '#a855f7',
          violet: '#8b5cf6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffe',
          300: '#7cc4fd',
          400: '#38bdf8',
          500: '#0c87eb',
          600: '#006ac9',
          700: '#0155a3',
          800: '#054885',
          900: '#0a3c6e',
          950: '#07264a',
        },
        navy: {
          800: '#0d172e',
          900: '#070d1e',
          950: '#040711',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(56, 189, 248, 0.25)',
        'glow-md': '0 0 25px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 240, 255, 0.35)',
        'cyber-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
