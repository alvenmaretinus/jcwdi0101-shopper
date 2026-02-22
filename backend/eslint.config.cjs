module.exports = [
  {
    ignores: ["node_modules/**", "dist/**", "prisma/generated/**", "prisma/**/generated/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json"
      }
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin")
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ],
      "max-lines-per-function": [
        "error",
        {
          "max": 1500,
          "skipBlankLines": true,
          "skipComments": true
        }
      ]
    }
  }
]
