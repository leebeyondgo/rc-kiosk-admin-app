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
        warmGray: colors.warmGray,
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
          '0%, 100%': { backgroundColor: '#fef9c3' },
          '50%': { backgroundColor: '#fde047' },
        },
      },
      animation: {
        highlight: 'highlight 1s ease-in-out 3',
      },
    },
  },
  plugins: [],
};
