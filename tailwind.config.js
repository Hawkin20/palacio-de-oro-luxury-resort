/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        palacio: {
          black: '#0B0B0B',
          gold: '#D4AF37',
          'dark-green': '#0F2A1D',
          white: '#FFFFFF',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'hover-lift': 'hoverLift 0.3s ease-out',
        'carousel-slide': 'carouselSlide 0.8s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
        },
        hoverLift: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-8px)' },
        },
        carouselSlide: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.4)',
        'gold-glow-lg': '0 0 50px rgba(212, 175, 55, 0.5)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'glass': 'blur(4px)',
      },
    },
  },
  plugins: [],
};
