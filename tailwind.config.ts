import type { Config } from "tailwindcss";


const config: Config = {
  /** @type {import('tailwindcss').Config} */
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0B1220',
          700: '#1C2434',
          500: '#44506B',
        },
        mist: {
          50: '#F7FAFF',
          100: '#EEF5FF',
        },
        brand: {
          200: '#ffe7ea',
          400: '#ff9ca8',
          500: '#ff6f7d',
          600: '#EA5165',
        },
        background: {
          50: '#F5F7F9',
        },
      },
      boxShadow: {
        card: '0 10px 30px rgba(16, 24, 40, 0.08)',
        float: '0 30px 60px rgba(16, 24, 40, 0.10)',
        subtle: '0 2px 8px rgba(16,24,40,0.06)',
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.25rem',
      },
      maxWidth: {
        wrap: '72rem', // ~1152px
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
