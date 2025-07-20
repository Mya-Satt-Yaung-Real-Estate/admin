/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // MUI Primary colors
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#1976d2', // main
          600: '#1e88e5',
          700: '#1565c0', // dark
          800: '#1565c0',
          900: '#0d47a1',
        },
        // MUI Secondary colors
        secondary: {
          50: '#fce4ec',
          100: '#f8bbd9',
          200: '#f48fb1',
          300: '#f06292',
          400: '#ec407a',
          500: '#dc004e', // main
          600: '#e91e63',
          700: '#9a0036', // dark
          800: '#c2185b',
          900: '#880e4f',
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
      },
    },
  },
  plugins: [],
} 