const locales = ["en", "ko"];

const formatters = {
	dateTime: {
		en: new Intl.DateTimeFormat("en-US"),
		ko: new Intl.DateTimeFormat("ko-KR"),
	},
	number: {
		en: new Intl.NumberFormat("en-US"),
		ko: new Intl.NumberFormat("ko-KR"),
	},
};

module.exports = {
	locales,
	defaultLocale: locales[0],
	localeDetection: false,
	pages: {
		"*": ["localization"],
	},
	defaultNS: "localization",
	interpolation: {
		format: (value, format, language) => {
			if (format === "number") {
				return formatters.number[language].format(value);
			}

			if (format === "dateTime") {
				return formatters.dateTime[language].format(value);
			}

			return value;
		},
	},
};
