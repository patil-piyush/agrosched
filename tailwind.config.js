/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#2D6A4F',
        secondary: '#52B788',
        accent:    '#F4A261',
        soil:      '#8B5E3C',
        water:     '#2196F3',
        bg:        '#F8FAF5',
        surface:   '#FFFFFF',
        textDark:  '#1B2A1E',
        muted:     '#6B7B6E',
        unvisited: '#E8F5E9',
        active:    '#F4A261',
        frontier:  '#FFE082',
        visited:   '#52B788',
        optimal:   '#FFD700',
        pruned:    '#EF5350',
        solution:  '#2D6A4F',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

