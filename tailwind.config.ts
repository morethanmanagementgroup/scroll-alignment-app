import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Scroll Alignment design system
        scroll: {
          black:   '#080810',
          deep:    '#0D0D1A',
          charcoal:'#12121F',
          card:    '#161624',
          border:  '#232338',
          gold:    '#C9A96E',
          'gold-light': '#E2C98A',
          'gold-dim':   '#8A6D42',
          bone:    '#F0EBE1',
          'bone-dim':   '#B8B0A4',
          purple:  '#6B4E8A',
          'purple-dim': '#3D2D52',
          blue:    '#1C2E5A',
          'blue-light': '#2A4080',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.6s ease-in-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        'glow':       'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseGold: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        glow:      { '0%,100%': { boxShadow: '0 0 5px rgba(201,169,110,0.2)' }, '50%': { boxShadow: '0 0 20px rgba(201,169,110,0.5)' } },
      },
      backgroundImage: {
        'gold-gradient':   'linear-gradient(135deg, #C9A96E 0%, #E2C98A 50%, #C9A96E 100%)',
        'dark-gradient':   'linear-gradient(180deg, #080810 0%, #0D0D1A 100%)',
        'card-gradient':   'linear-gradient(135deg, #12121F 0%, #161624 100%)',
        'purple-gradient': 'linear-gradient(135deg, #3D2D52 0%, #6B4E8A 100%)',
      },
    },
  },
  plugins: [],
}

export default config
