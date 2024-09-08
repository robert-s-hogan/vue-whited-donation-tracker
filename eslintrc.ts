import { ESLint } from "eslint";

const config: ESLint.ConfigData = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:vue/vue3-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "vue/no-unused-vars": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
};

export default config;
