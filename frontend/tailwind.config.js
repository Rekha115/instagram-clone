/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ig: {
          bg: '#000000',
          surface: '#121212',
          surface2: '#1a1a1a',
          border: '#262626',
          text: '#f5f5f5',
          dim: '#a8a8a8',
          blue: '#0095f6',
          blueDim: '#1877f2',
          red: '#ed4956',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        logo: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      keyframes: {
        heartPop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '25%': { transform: 'scale(1.3)', opacity: '1' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        heartPop: 'heartPop 0.9s ease-out forwards',
        fadeIn: 'fadeIn 0.15s ease-out',
        slideUp: 'slideUp 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
