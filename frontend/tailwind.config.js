/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        accent: 'var(--accent)',
        forest: 'var(--forest)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        border: 'var(--border)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.3), transparent)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.6s ease forwards',
        'pulse-violet': 'pulseViolet 2s ease-in-out infinite',
        'count-up': 'countUp 1s ease forwards',
        float: 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseViolet: { '0%,100%': { boxShadow: '0 0 0 0 rgba(124,58,237,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(124,58,237,0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        glowPulse: { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(79,142,247,0.4)',
        'glow-violet': '0 0 20px rgba(124,58,237,0.4)',
        'glow-lg': '0 0 40px rgba(124,58,237,0.3)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      backdropBlur: { xs: '4px' },
    },
  },
  plugins: [],
};
