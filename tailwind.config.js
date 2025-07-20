/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          50: '#f0f9f8',
          100: '#dcf2f0',
          200: '#bce6e2',
          300: '#8dd3cc',
          400: '#5bb8ae',
          500: '#3B8880', // main brand color
          600: '#2F6B64', // dark
          700: '#275a54',
          800: '#234a45',
          900: '#1f3e3a',
        },
        // MUI Primary colors (now using brand color)
        primary: {
          50: '#f0f9f8',
          100: '#dcf2f0',
          200: '#bce6e2',
          300: '#8dd3cc',
          400: '#5bb8ae',
          500: '#3B8880', // main
          600: '#2F6B64', // dark
          700: '#275a54',
          800: '#234a45',
          900: '#1f3e3a',
        },
        // MUI Secondary colors (warm amber)
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F59E0B', // main
          600: '#D97706', // dark
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // MUI Neutral colors
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // main
          600: '#475569', // dark
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // MUI Background colors
        background: {
          default: '#f8fafc',
          paper: '#ffffff',
        },
        // MUI Text colors
        text: {
          primary: '#1e293b',
          secondary: '#64748b',
        },
      },
      spacing: {
        // MUI uses 8px as base unit, Tailwind uses 4px
        // This creates consistency between MUI and Tailwind spacing
        'mui-1': '8px',
        'mui-2': '16px',
        'mui-3': '24px',
        'mui-4': '32px',
        'mui-5': '40px',
        'mui-6': '48px',
        'mui-7': '56px',
        'mui-8': '64px',
        'mui-9': '72px',
        'mui-10': '80px',
      },
      borderRadius: {
        'mui': '8px',
      },
      fontFamily: {
        'mui': ['"Inter"', '"Roboto"', '"Helvetica"', '"Arial"', 'sans-serif'],
      },
      boxShadow: {
        'mui': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'mui-lg': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'brand': '0 1px 3px 0 rgb(59 136 128 / 0.1), 0 1px 2px -1px rgb(59 136 128 / 0.1)',
        'brand-lg': '0 4px 6px -1px rgb(59 136 128 / 0.1), 0 2px 4px -2px rgb(59 136 128 / 0.1)',
      },
      backgroundColor: {
        'brand-light': 'rgba(59, 136, 128, 0.04)',
        'brand-lighter': 'rgba(59, 136, 128, 0.08)',
      },
      borderColor: {
        'brand-light': 'rgba(59, 136, 128, 0.2)',
      },
    },
  },
  plugins: [],
} 