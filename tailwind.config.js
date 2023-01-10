/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      minWidth: {
        "250px": "250px",
      },
      colors: {
        "light-gray": "#F5F5F5",
        "th-color": "#979797",
        "first-rank-color": "#F9C213",
        "second-rand-color": "#FBD764",
        "third-rank-color": "#FDEBB1",
        "table-text-color": "#333333",
        blue: "#007BFF",
      },
    },
  },
  plugins: [],
};
