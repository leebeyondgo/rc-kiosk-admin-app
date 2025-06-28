
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        redCrossRed: '#d62828',
        redCrossWarmGray: {
          50: '#f5f5f4',
          100: '#e7e5e4',
          200: '#d6d3d1',
          300: '#a8a29e',
          400: '#78716c',
          500: '#57534e',
          600: '#44403c',
          700: '#292524',
          800: '#1c1917',
          900: '#0c0a09'
        },
        warmGray: {
          50: '#f5f5f4',
          100: '#e7e5e4',
          200: '#d6d3d1',
          300: '#a8a29e',
          400: '#78716c',
          500: '#57534e',
          600: '#44403c',
          700: '#292524',
          800: '#1c1917',
          900: '#0c0a09'
        },
        redCrossGray: '#8c8c8c',
        redCrossGold: {
          DEFAULT: '#d4af37',
          light: '#fbe8b0',
        },
        redCrossSilver: '#c0c0c0',
      },
      fontSize: {
        sm: '0.95rem',
        base: '1.05rem',
        lg: '1.175rem',
        xl: '1.325rem',
        '2xl': '1.65rem',
        '3xl': '1.95rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      keyframes: {
        highlight: {
          '0%, 100%': { backgroundColor: '#fbe8b0' },
          '50%': { backgroundColor: '#d4af37' },
        },
      },
      animation: {
        highlight: 'highlight 1s ease-in-out 3',
      },
    },
  },
  plugins: [],
};
