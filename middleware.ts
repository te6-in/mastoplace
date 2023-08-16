import { defaultLocale, locales } from "@/i18n";
import acceptLanguage from "accept-language";
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	function getLocale() {
		const cookieLocale = request.cookies.get(
			process.env.LANGUAGE_COOKIE_NAME as string
		);

		if (cookieLocale && locales.includes(cookieLocale.value)) {
			return cookieLocale.value;
		}

		acceptLanguage.languages(locales);

		const headerLocale = acceptLanguage.get(
			request.headers.get("Accept-Language")
		);

		return headerLocale || defaultLocale;
	}

	const currentLocale = request.nextUrl.searchParams.get("lang");

	if (!currentLocale || locales.every((locale) => locale !== currentLocale)) {
		const locale = getLocale();
		const response = NextResponse.redirect(
			new URL("?lang=" + locale, request.url)
		);

		response.cookies.set(process.env.LANGUAGE_COOKIE_NAME as string, locale);

		return response;
	}

	const response = NextResponse.next();

	response.cookies.set(
		process.env.LANGUAGE_COOKIE_NAME as string,
		currentLocale
	);

	return response;
}

export const config = {
	matcher: ["/((?!api|_next|favicon.ico).*)"],
};
