// NOTE: This project uses Tailwind CSS v4 which configures the theme via CSS @theme
// directives in app/globals.css rather than this JavaScript config file.
// The CTRG brand colors are defined in globals.css:
//   --color-primary: #C41230
//   --color-primary-dark: #9c0e26
//   --color-primary-light: #e8293b
//   --color-sidebar: #1e1e2e
//
// This file is kept for reference / tooling compatibility only.

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C41230',
          dark: '#9c0e26',
          light: '#e8293b',
        },
        sidebar: '#1e1e2e',
      },
    },
  },
  plugins: [],
};

export default config;
