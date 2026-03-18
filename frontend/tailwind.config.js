/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#4880FF",
        success: "#00B69B",
        warning: "#FF9066",
        danger: "#FF4747",
      },
    },
  },
  plugins: [],
};

