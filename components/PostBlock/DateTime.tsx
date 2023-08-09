"use client";

import useTranslation from "next-translate/useTranslation";

interface DateTimeProps {
	dateTime: string;
}

export function DateTime({ dateTime }: DateTimeProps) {
	const { lang } = useTranslation();

	const formatter = new Intl.DateTimeFormat(lang, {
		dateStyle: "medium",
		timeStyle: "short",
	});

	return formatter.format(new Date(dateTime));
}
