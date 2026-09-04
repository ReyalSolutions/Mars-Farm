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
        space: {
          950: '#030712',
          900: '#060B18',
          850: '#0A1128',
          800: '#0E1738',
          700: '#16234D',
          600: '#213369',
        },
        mars: {
          900: '#7F1D1D',
          800: '#991B1B',
          700: '#C2410C',
          600: '#EA580C',
          500: '#F97316',
          400: '#FB923C',
          300: '#FDBA74',
          accent: '#FF4D2E',
          glow: '#FF6B4A',
        },
        bio: {
          900: '#064E3B',
          800: '#065F46',
          700: '#047857',
          600: '#059669',
          500: '#10B981',
          400: '#34D399',
          300: '#6EE7B7',
          glow: '#00FF9D',
        },
        cyan: {
          glow: '#00F0FF',
          dark: '#007A87',
        },
        hud: {
          bg: 'rgba(6, 11, 24, 0.85)',
          panel: 'rgba(14, 23, 56, 0.75)',
          border: 'rgba(0, 240, 255, 0.25)',
          'border-active': 'rgba(0, 240, 255, 0.75)',
          'border-mars': 'rgba(255, 77, 46, 0.35)',
          text: '#E2E8F0',
          muted: '#94A3B8',
        }
      },
      fontFamily: {
        mono: ['"Space Mono"', '"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hud-grid': 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 1px, transparent 1px)',
        'star-field': 'radial-gradient(ellipse at bottom, #0A1128 0%, #030712 100%)',
        'mars-glow': 'radial-gradient(circle at 50% 50%, rgba(255, 77, 46, 0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 30s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'scanline': 'scanline 6s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
