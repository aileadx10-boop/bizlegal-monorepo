import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'hero': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'h1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],
        'overline': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.06em', fontWeight: '600' }],
      },
      colors: {
        // Phase AA Subdomain Design Pass — Forge rebrand to Daybreak.
        // The token names stay (Tailwind classes still resolve), but
        // values pull from CSS vars set by @bizlegal/themes' Daybreak
        // FOUC script in layout.tsx. Falls back to literal hex for
        // build-time evaluation in `text-forge-text-secondary` class
        // generation. Daybreak is light-mode so the palette inverts.
        forge: {
          dark: 'var(--ink, #FBF9F4)',           // page bg (paper)
          card: 'var(--ink-2, #F2EEE5)',         // surface
          border: 'var(--line, rgba(26,21,48,.12))',
          accent: 'var(--brand, #5B49E0)',       // violet
          'accent-hover': 'var(--brand-soft, #7E6DFF)',
          'accent-glow': 'rgba(91, 73, 224, 0.15)',
          muted: 'var(--paper-dim, #5C5670)',
          text: 'var(--paper, #1A1530)',         // dark type on paper
          'text-secondary': 'var(--paper-dim, #5C5670)',
          success: 'var(--accent-a, #0F8C6E)',
          warning: 'var(--accent-b, #B8852D)',
          error: 'var(--accent-c, #E14B16)',
          info: 'var(--brand-soft, #7E6DFF)',
        },
        gradient: {
          'hero-start': 'rgba(99, 102, 241, 0.08)',
          'hero-end': 'rgba(139, 92, 246, 0.08)',
          'card-highlight': 'rgba(99, 102, 241, 0.05)',
          'card-urgent': 'rgba(165, 180, 252, 0.06)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        'gradient-accent': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(18, 20, 28, 0.8) 0%, rgba(18, 20, 28, 0.4) 100%)',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(99, 102, 241, 0.15)',
        'glow-lg': '0 0 60px rgba(99, 102, 241, 0.25)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'elevated': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'elevated-hover': '0 8px 40px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scan': 'scan 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      gridTemplateRows: {
        'bento': 'repeat(auto-fit, minmax(180px, auto))',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
