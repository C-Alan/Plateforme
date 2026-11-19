/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF5E00',
          coral: '#FF4500',
          amber: '#FFB800',
          gold: '#FDB813',
          purple: '#8B5CF6',
          pink: '#EC4899',
          wave: '#00B4D8',
          waveGlow: '#00F0FF',
          mtn: '#FFCC00',
          darkBg: '#0B0B12',
          surface: '#151522',
          surfaceLight: '#1E1E30',
          card: '#161626',
        }
      },
      boxShadow: {
        'glow-orange': '0 0 25px -4px rgba(255, 94, 0, 0.45)',
        'glow-amber': '0 0 25px -4px rgba(255, 184, 0, 0.45)',
        'glow-wave': '0 0 25px -4px rgba(0, 180, 216, 0.45)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.45)',
        'glow-purple': '0 0 25px -4px rgba(139, 92, 246, 0.45)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'african-sunrise': 'linear-gradient(135deg, #FF4500 0%, #FF8C00 50%, #FFD700 100%)',
        'radiant-card': 'linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)',
      }
    },
  },
  plugins: [],
}
