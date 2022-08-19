/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", , "./public/index.html"],
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
      }
    },
  },
  plugins: [],
}
