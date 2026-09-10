/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        zenith: {
          dark: '#1B4332',
          primary: '#2D6A4F',
          light: '#52B788',
          accent: '#D8F3DC',
          bgLight: '#FAF9F6',
          amber: '#F4A261',
          coral: '#E76F51',
          darkBg: '#0D1813',
          darkCard: '#15241D',
          darkBorder: '#23382D',
          darkMuted: '#849B8F'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          'system-ui',
          'sans-serif'
        ]
      }
    }
  },
  plugins: []
};
