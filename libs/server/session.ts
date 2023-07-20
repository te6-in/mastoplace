import { unsealData } from "iron-session";
import { createClient } from "masto";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";

export async function decrypt(cookies: RequestCookies) {
	const cookieName = process.env.SESSION_COOKIE_NAME as string;
	const found = cookies.get(cookieName);

	if (!found) {
		return null;
	}

	try {
		const data = (await unsealData(found.value, {
			password: process.env.SESSION_COOKIE_PASSWORD as string,
		})) as string;

		const json = JSON.parse(data);

		return json;
	} catch (error) {
		return null;
	}
}

export async function mastodon(cookies: RequestCookies) {
	const { token, server } = await decrypt(cookies);

	if (!token || !server) {
		return null;
	}

	const mastodon = createClient({
		accessToken: token,
		url: `https://${server}`,
	});

	return mastodon;
}
