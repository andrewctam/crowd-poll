/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", , "./public/index.html"],
  theme: {
    extend: {
      height: {
        'half-screen': "50vh",
      }
    },
  },
  plugins: [],
}
