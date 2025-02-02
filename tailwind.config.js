/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",  // Include App.js in the root
    "./index.{js,jsx,ts,tsx}", // Include index.js in the root
    "./components/**/*.{js,jsx,ts,tsx}", // Include all components
    "./lib/**/*.{js,jsx,ts,tsx}", // Include files in the lib directory
    "./screens/HomeScreen.{js,jsx,ts,tsx}",

  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
