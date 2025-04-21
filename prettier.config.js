/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
module.exports = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.ts",
  tailwindAttributes: ["contentClass"],
  tailwindFunctions: ["clsx", "cva"],
  endOfLine: "lf",
  printWidth: 120,
  useTabs: false,
  tabWidth: 2,
  singleQuote: false,
  htmlWhitespaceSensitivity: "css",
  jsxSingleQuote: false,
  singleAttributePerLine: true,
  bracketSpacing: true,
  arrowParens: "always",
  semi: true,
  trailingComma: "all",
};
