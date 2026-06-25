/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"] ,
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
        'code-bg': 'var(--code-bg)',
      },
      fontFamily: {
        ui: 'var(--font-ui)',
        code: 'var(--font-code)',
      },
      boxShadow: {
        accent: '0 0 0 1px rgba(108,99,255,0.15), 0 0 24px rgba(108,99,255,0.15)',
      },
    },
  },
  plugins: [],
}

