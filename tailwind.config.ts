import type { Config } from 'tailwindcss';

/**
 * Single source of truth for theme colors. Change these to rebrand.
 * Use semantic names in components: bg-primary, text-danger, border-warning, etc.
 * App shell colors use CSS variables (see app/globals.css) for light/dark.
 */
const themeColors = {
  primary: '#2563eb',
  'primary-hover': '#1d4ed8',
  'primary-focus': '#3b82f6',
  danger: '#dc2626',
  'danger-muted': '#fef2f2',
  'danger-border': '#fecaca',
  success: '#16a34a',
  'success-muted': '#f0fdf4',
  warning: '#d97706',
  'warning-muted': '#fffbeb',
  'warning-border': '#fcd34d',
};

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        elevated: 'var(--color-elevated)',
        muted: 'var(--color-muted)',
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
          subtle: 'var(--color-border-subtle)',
        },
        fg: {
          DEFAULT: 'var(--color-fg)',
          muted: 'var(--color-fg-muted)',
          subtle: 'var(--color-fg-subtle)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          soft: 'var(--color-accent-soft)',
        },
        row: {
          DEFAULT: 'var(--color-row-default)',
          /** Alias so `bg-row-default` works if used in class strings */
          default: 'var(--color-row-default)',
          priority: 'var(--color-row-priority)',
          done: 'var(--color-row-done)',
          'done-text': 'var(--color-row-done-text)',
          'done-icon': 'var(--color-row-done-icon)',
        },
        overlay: 'var(--color-overlay)',
        primary: {
          DEFAULT: themeColors.primary,
          hover: themeColors['primary-hover'],
          focus: themeColors['primary-focus'],
        },
        danger: {
          DEFAULT: themeColors.danger,
          muted: themeColors['danger-muted'],
          border: themeColors['danger-border'],
        },
        success: {
          DEFAULT: themeColors.success,
          muted: themeColors['success-muted'],
        },
        warning: {
          DEFAULT: themeColors.warning,
          muted: themeColors['warning-muted'],
          border: themeColors['warning-border'],
        },
      },
      boxShadow: {
        shell: 'var(--shadow-shell)',
        card: 'var(--shadow-card)',
        popover: 'var(--shadow-popover)',
      },
      ringOffsetColor: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
      },
      fontFamily: {
        sans: ['var(--font-app)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
