import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        watchnest: {
          background: '#f8fbff',
          foreground: '#17212b',
          muted: '#607083',
          primary: '#315ef6',
          surface: '#ffffff',
          border: '#d9e2ec',
          softBlue: '#ddeaf6',
          softGreen: '#d8f3dc',
          softPink: '#f8d7da',
        },
      },
      borderRadius: {
        card: '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
