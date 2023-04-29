//const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',
      './node_modules/flowbite/**/*.js'
    ],
    theme: {
      // colors: {
      //   primary: {
      //     "50": "#eff6ff",
      //     "100": "#dbeafe",
      //     "200": "#bfdbfe",
      //     "300": "#93c5fd",
      //     "400": "#60a5fa",
      //     "500": "#3b82f6",
      //     "600": "#2563eb",
      //     "700": "#1d4ed8",
      //     "800": "#1e40af",
      //     "900": "#1e3a8a"
      //   }
      // },
    //   extend: {
    //     backgroundImage: {
    //       hero: "url('//maps.terredamare.com/bg0.webp')",
    //     },
    //   },
    },
    plugins: [
      // require('flowbite/plugin'),
      // require('@tailwindcss/line-clamp'),
    ],
    darkMode: 'media',
  }