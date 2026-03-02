import type { Config } from 'tailwindcss';

/**
 * Single source of truth for theme colors. Change these to rebrand.
 * Use semantic names in components: bg-primary, text-danger, border-warning, etc.
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
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
    },
  },
  plugins: [],
};
export default config;
