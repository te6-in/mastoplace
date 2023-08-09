"use client";

interface DateTimeProps {
	dateTime: string;
}

export function DateTime({ dateTime }: DateTimeProps) {
	const formatter = new Intl.DateTimeFormat("ko-KR", {
		dateStyle: "medium",
		timeStyle: "short",
	});

	return formatter.format(new Date(dateTime));
}
