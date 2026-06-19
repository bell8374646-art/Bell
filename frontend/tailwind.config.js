/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#0A0A0B',
        'accent-gold': '#D4AF37',
        'accent-champagne': '#F5E6A3',
        'surface-glass': 'rgba(26, 26, 46, 0.6)',
        'text-primary': '#F8F9FA',
        'text-secondary': '#B0B3B8',
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        'border-shimmer': 'border-shimmer 4s linear infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
      keyframes: {
        'border-shimmer': {
          '0%, 100%': { borderColor: '#D4AF37' },
          '50%': { borderColor: '#F5E6A3' },
        },
        'pulse-gold': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
