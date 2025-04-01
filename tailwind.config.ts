export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        redCross: '#d62828',
      },
      fontSize: {
        // Tailwind 기본값보다 약 2px씩 증가
        sm: '0.95rem',    // 기본 0.875rem
        base: '1.05rem',  // 기본 1rem
        lg: '1.175rem',   // 기본 1.125rem
        xl: '1.325rem',   // 기본 1.25rem
        '2xl': '1.65rem', // 기본 1.5rem
        '3xl': '1.95rem', // 기본 1.875rem
        '4xl': '2.25rem', // 기본 2.25rem → 그대로
        '5xl': '3rem',    // 기본 3rem → 그대로
      }
    }
  },
  plugins: [],
};
