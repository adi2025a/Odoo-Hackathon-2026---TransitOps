/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        sidebar: {
          light: '#f8fafc',
          dark: '#0b0f19',
        },
        panel: {
          light: '#ffffff',
          dark: '#111827',
        },
        accent: {
          blue: '#3b82f6',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
          violet: '#8b5cf6',
        },
        // CSS variable–backed semantic tokens (shadcn/ui pattern)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent2: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px  (was 12px)
        'sm':   ['0.9375rem', { lineHeight: '1.5rem'  }],   // 15px  (was 14px)
        'base': ['1.0625rem', { lineHeight: '1.75rem' }],   // 17px  (was 16px)
        'lg':   ['1.1875rem', { lineHeight: '1.875rem'}],   // 19px  (was 18px)
        'xl':   ['1.3125rem', { lineHeight: '2rem'    }],   // 21px  (was 20px)
        '2xl':  ['1.5rem',    { lineHeight: '2.25rem' }],   // 24px  (unchanged)
        '3xl':  ['1.875rem',  { lineHeight: '2.25rem' }],   // 30px  (unchanged)
        '4xl':  ['2.25rem',   { lineHeight: '2.5rem'  }],
        '5xl':  ['3rem',      { lineHeight: '1'        }],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight:   '-0.02em',
        normal:  '0em',
        wide:    '0.02em',
        wider:   '0.05em',
        widest:  '0.1em',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'premium': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        'premium-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'glass-dark': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
