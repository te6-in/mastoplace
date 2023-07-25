import { unsealData } from "iron-session";
import { createClient, mastodon } from "masto";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";

interface DecryptParams {
	type: "client" | "session";
	cookies: RequestCookies;
}

export async function decrypt({ type, cookies }: DecryptParams) {
	const cookieName =
		type === "session"
			? (process.env.SESSION_COOKIE_NAME as string)
			: (process.env.CLIENT_COOKIE_NAME as string);

	const found = cookies.get(cookieName);

	if (!found) {
		return null;
	}

	try {
		const data = (await unsealData(found.value, {
			password:
				type === "session"
					? (process.env.SESSION_COOKIE_PASSWORD as string)
					: (process.env.CLIENT_COOKIE_PASSWORD as string),
		})) as string;

		const json = JSON.parse(data);

		return json;
	} catch (error) {
		return null;
	}
}

export async function mastodonClient(cookies: RequestCookies) {
	const data = await decrypt({ type: "session", cookies });

	if (!data) {
		return null;
	}

	const { token, server } = data;

	if (!token || !server) {
		return null;
	}

	const masto = createClient({
		accessToken: token,
		url: `https://${server}`,
	});

	try {
		const account = await masto.v1.accounts.verifyCredentials();

		return { masto, clientServer: server, handle: account.acct } as {
			masto: mastodon.Client;
			clientServer: string;
			handle: string;
		};
	} catch {
		return null;
	}
}
