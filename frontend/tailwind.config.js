/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'midnight': {
          50: '#ffffff',  // Pure white for maximum visibility
          100: '#f8f9fa', // Very light gray
          200: '#e9ecef', // Light gray
          300: '#dee2e6', // Medium light gray
          400: '#adb5bd', // Medium gray
          500: '#6c757d', // Medium dark gray
          600: '#495057', // Dark gray
          700: '#343a40', // Very dark gray
          800: '#212529', // Almost black
          900: '#1a1d20', // Darker black
          950: '#0f1114', // Darkest black
        },
      },
    },
  },
  plugins: [],
}
