/** @type {import('tailwindcss').Config} */
// Colors are OKLCH triplets ("L C H") defined in globals.css, so Tailwind can add alpha (bg-primary/10).
const token = (name) => `oklch(var(--${name}) / <alpha-value>)`;

module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn / Watermelon UI semantic names
        background: token('background'),
        foreground: token('foreground'),
        card: { DEFAULT: token('card'), foreground: token('foreground') },
        popover: { DEFAULT: token('card'), foreground: token('foreground') },
        primary: { DEFAULT: token('primary'), foreground: token('primary-foreground') },
        secondary: { DEFAULT: token('muted'), foreground: token('foreground') },
        muted: { DEFAULT: token('muted'), foreground: token('muted-foreground') },
        accent: { DEFAULT: token('muted'), foreground: token('foreground') },
        destructive: { DEFAULT: token('danger'), foreground: token('primary-foreground') },
        border: token('border'),
        input: token('border'),
        ring: token('primary'),
        // App-specific names
        surface: token('card'),
        sunken: token('sunken'),
        faint: token('faint'),
        ok: token('ok'),
        warn: token('warn'),
        danger: token('danger'),
        lmf: token('lmf'),
      },
      borderColor: { DEFAULT: token('border') },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // 12px floor: nothing on screen goes below this
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        xs: '0 1px 2px oklch(0.2 0.02 175 / 0.06)',
        pop: '0 12px 32px -8px oklch(0.2 0.02 175 / 0.22), 0 2px 6px oklch(0.2 0.02 175 / 0.08)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
