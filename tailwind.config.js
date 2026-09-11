/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Skins/temas (ver src/lib/theme.ts): em vez de reescrever as ~300 classes "amber-*" já
      // espalhadas pelo app, redefinimos o que "amber" significa via variável CSS -- toda classe
      // existente (bg-amber-500, text-amber-600...) continua igual no código, só o valor resolvido
      // muda conforme o tema ativo em :root[data-theme]. Zero arquivo de tela precisou mudar.
      colors: {
        amber: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        // Sidebar também troca de tema (ver src/components/layout/Sidebar.tsx) -- isolado da
        // paleta "gray" global de propósito, pra não re-tingir textos/bordas do app inteiro.
        sidebar: {
          DEFAULT: 'var(--color-sidebar-bg)',
          border: 'var(--color-sidebar-border)',
          hover: 'var(--color-sidebar-hover)',
          active: 'var(--color-sidebar-active)',
        },
      },
    },
  },
  plugins: [],
}