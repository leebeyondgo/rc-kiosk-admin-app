import colors from "tailwindcss/colors";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        redCrossRed: colors.red,
        redCrossWarmGray: colors.warmGray,
        redCrossGray: '#8c8c8c',
        redCrossGold: '#d4af37',
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
          '0%, 100%': { backgroundColor: colors.red[100] },
          '50%': { backgroundColor: colors.red[300] },
        },
      },
      animation: {
        highlight: 'highlight 1s ease-in-out 3',
      },
    },
  },
  plugins: [],
};
