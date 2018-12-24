"use strict";

const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
	extends: [
		"eslint:recommended",
		// "airbnb", // Uncomment to use Airbnb lint style.
		"prettier",
		"prettier/react"
	],
	plugins: ["react", "prettier"],
	// [https://eslint.org/docs/user-guide/configuring#specifying-parser-options]
	parserOptions: {
		ecmaVersion: 6,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true
		}
	},
	env: {
		es6: true,
		node: true,
		browser: true
	},
	// [https://eslint.org/docs/user-guide/configuring#specifying-globals]
	// [https://stackoverflow.com/a/34820916]
	globals: {
		module: true
	},
	rules: {
		"prettier/prettier": [
			// Custom prettier rules.
			"error",
			{
				bracketSpacing: true,
				jsxBracketSameLine: false,
				printWidth: 80,
				semi: true,
				singleQuote: false,
				tabWidth: 4,
				trailingComma: "none",
				useTabs: true,
				parser: "babylon"
			}
		],
		// [https://eslint.org/docs/user-guide/configuring#configuring-rules]
		eqeqeq: [WARN, "always"] // Add custom ESLint rules here.
	},
	settings: {
		react: {
			version: "16.6.3"
		}
	},
	parser: "babel-eslint"
};
