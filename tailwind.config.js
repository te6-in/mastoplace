/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		fontFamily: {
			sans: ["Pretendard\\ Variable", ...defaultTheme.fontFamily.sans],
		},
		extend: {
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
			boxShadow: {
				"upward-sm": "0 -1px 2px 0 rgb(0 0 0 / 0.05);",
			},
			keyframes: {
				shake: {
					"10%, 90%": {
						transform: "translate3d(-1px, 0, 0)",
					},
					"20%, 80%": {
						transform: "translate3d(2px, 0, 0)",
					},
					"30%, 50%, 70%": {
						transform: "translate3d(-3px, 0, 0)",
					},
					"40%, 60%": {
						transform: "translate3d(3px, 0, 0)",
					},
				},
			},
			animation: {
				shake: "shake 0.5s both",
			},
		},
	},
	darkMode: "class",
	plugins: [require("@tailwindcss/forms")],
};
