/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          lavender: '#D6CFFF',
          glow: '#E8E3FF',
          dark: '#111111',
          night: '#17151F',
          mutedNight: '#2A2635',
          silk: '#F8F7FF',
          pearl: '#FFFFFF',
          champagne: '#F4E8C1',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        editorial: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Manrope"', 'system-ui', 'sans-serif'],
        price: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass-subtle': '0 8px 32px 0 rgba(214, 207, 255, 0.12)',
        'glass-glow': '0 0 25px 2px rgba(214, 207, 255, 0.35)',
        'card-hover': '0 20px 40px -15px rgba(23, 21, 31, 0.12)',
        'luxury': '0 25px 50px -12px rgba(23, 21, 31, 0.08)',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-heavy': '32px',
      },
    },
  },
  plugins: [],
};
