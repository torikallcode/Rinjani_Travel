/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        primary: ["Assistant", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
        secondary: ["Poppins", "sans-serif"],
        tomorrow: ["Tomorrow", "sans-serif"],
      },
      colors: {
        hitam: ["#222831"],
        putih: ["#EEEEEE"],
        biru: ["#00ADB5"],
        abu: ["#393E46"],
      },
    },
  },
  plugins: [require("tailwind-gradient-mask-image"), require("daisyui")],
};
