/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // <- Make sure this covers all your React components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
