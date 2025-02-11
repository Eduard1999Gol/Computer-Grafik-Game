/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        jgu1: "#C1002A",
        jgu2: "#636363",
        jgu3: "#9B9B9B", // Signal Gray
        accent: "var(--dm-accent)",

        // ! New
        "jgu-accent": "var(--dm-accent)",

        // Full Color Palette
        // SHADES
        "jgu-white": "#FFFFFF", // White
        "jgu-red": {
          DEFAULT: "#C1002A",
          dark: "#a21624",
          85: "#ca3f51",
          70: "#d46774",
          55: "#de8b94",
          40: "#e7adb3",
          20: "#f3d7d9",
          10: "#fff5f7",
        },
        "jgu-orange": {
          DEFAULT: "#FF5500",
          dark: "#c74d15",
          85: "#ff7341",
          70: "#ff8e68",
          55: "#ffa88c",
          40: "#ffc1ac",
          20: "#ffe0d7",
        },
        "jgu-blue": {
          DEFAULT: "#046380", // Tallarn Flesh
          dark: "#046380",
          85: "#377d94",
          70: "#6095a8",
          55: "#86aebc",
          40: "#a9c4ce",
          20: "#d5e2e7",
        },
        "jgu-dark-blue": {
          DEFAULT: "#024358", // Tallarn Flesh
          dark: "#024358",
          85: "#316474",
          70: "#5b818e",
          55: "#829ea8",
          40: "#a6b9c1",
          20: "#d3dde0",
        },
        "jgu-green": {
          DEFAULT: "#00A023", // Green
          dark: "#108a31",
          85: "#32af4c",
          70: "#5abe70",
          55: "#80cc92",
          40: "#a4dab1",
          20: "#d3edd9",
        },
        "jgu-gray": {
          DEFAULT: "#636363", // Aluminium Gray
          dark: "#636363",
          85: "#7d7d7d",
          70: "#9B9B9B", // Signal Gray
          55: "#aeaeae",
          40: "#c5c5c5",
          20: "#e6e6e6", // Winter White
        },
        "jgu-yellow": {
          DEFAULT: "#F1C645", // Gold
          dark: "#ccaa3a",
          85: "#f3ce67",
          70: "#f5d785",
          55: "#f7e0a1",
          40: "#fae9bc",
          20: "#fcf3de",
        },
        "jgu-purple": {
          DEFAULT: "#754363", // Purple
          dark: "#603651",
          85: "#8b637d",
          70: "#a18095",
          55: "#b69ead",
          40: "#cab9c4",
          20: "#e5dde2",
          10: "#f5f0f2",
        },
        "jgu-black": {
          DEFAULT: "#2d3a3f",
          dark: "#2d3a3f",
          85: "#4a5a61",
          70: "#667278",
          55: "#7f8c8e",
          40: "#979e9f",
          20: "#b5b8b9",
        },
      },
    },
    fontFamily: {
      default: ["Noto Sans"],
      sans: ["Noto Sans"],
    },
  },
  plugins: [],
};
