/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      height: {
        'half-screen': "50vh",
      },
      maxWidth: {
        "4/5": "80%",
      },
      
      minWidth: {
        "4": "1rem",
        "32": "8rem",
        "48": "12rem",
      },

      // that is animation class
      animation: {
        fade: 'fadeOut 5s ease-in-out',
      },

      // that is actual animation
      keyframes: theme => ({
        fadeOut: {
          '0%': { color: theme('colors.transparent') },
          '100%': { color: theme('colors.gray.100') },
        },
      }),
    },
  },
  plugins: [],
}
