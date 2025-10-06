/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // Use the new, dedicated plugin
    autoprefixer: {},
  },
};

export default config;

