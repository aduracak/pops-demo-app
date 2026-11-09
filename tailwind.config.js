export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pops: {
          bg: '#0F0D0C',
          card: '#181513',
          cardHover: '#211D1A',
          border: '#2C2623',
          flame: '#E84A27',
          flameLight: '#FF6442',
          amber: '#F59E0B',
          cream: '#FAF8F5',
          muted: '#A39B93',
          emerald: '#10B981',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
