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
        // Quantum design system — matches CSS custom properties
        'quantum-bg':       '#0a0e18',
        'quantum-bg-low':   '#0e1624',
        'quantum-bg-mid':   '#131b2e',
        'quantum-bg-high':  '#1a2240',
        'quantum-gold':     '#d4a853',
        'quantum-gold-light':'#f0c97a',
        'quantum-blue':     '#3b82f6',
        'quantum-indigo':   '#a5b4fc',
        'quantum-accent':   '#00FF94',
        'quantum-cta':      '#FF5A1F',
        // Brand
        primary: '#a5b4fc',
        'primary-hover': '#818cf8',
        'primary-container': '#6366f1',
        'primary-glow': 'rgba(165, 180, 252, 0.15)',
        cta: '#FF5A1F',
        'cta-hover': '#FF7A3F',
        secondary: '#e9c349',
        accent: '#00FF94',
        'on-surface': '#e8eaf6',
        'on-surface-var': '#9fa3c0',
        outline: 'rgba(165,180,252,0.15)',
        'outline-var': 'rgba(165,180,252,0.07)',
        success: '#10B981',
        warning: '#f59e0b',
        danger: '#f87171',
        muted: '#636680',
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['DM Mono', 'JetBrains Mono', 'monospace'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
        body: ['Geist', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(99, 102, 241, 0.15)',
        'glow-lg': '0 0 60px rgba(99, 102, 241, 0.25)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
        elevated: '0 4px 24px rgba(0, 0, 0, 0.3)',
        'elevated-hover': '0 8px 40px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        'gradient-accent': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-hero': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(99,102,241,0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(212,168,83,0.08), transparent)',
      },
      fontSize: {
        h1: ['56px', { lineHeight: '1.2' }],
        h2: ['42px', { lineHeight: '1.3' }],
        h3: ['28px', { lineHeight: '1.4' }],
        h4: ['20px', { lineHeight: '1.5' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'spin-slow': 'spin-slow 30s linear infinite',
        'spin-slow-reverse': 'spin-slow-reverse 20s linear infinite',
        'ping-slow': 'ping-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'orbit-node': 'orbit-node 3s ease-in-out infinite',
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
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'spin-slow-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'ping-slow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.5' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'orbit-node': {
          '0%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.6)', opacity: '0.4' },
          '100%': { transform: 'scale(1)', opacity: '0.9' },
        },
        'orbit-spin-1': {
          from: { transform: 'rotateZ(0deg)' },
          to: { transform: 'rotateZ(360deg)' },
        },
        'orbit-spin-2': {
          from: { transform: 'rotateZ(360deg)' },
          to: { transform: 'rotateZ(0deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config