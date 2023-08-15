import { DefaultResponse } from "@/libs/server/response";
import { sealData } from "iron-session";
import { NextRequest, NextResponse } from "next/server";
import { withQuery } from "ufo";

export type AuthResponse = DefaultResponse<{
	url: string;
}>;

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const redirectAfterAuth = searchParams.get("redirect");
	const server = searchParams.get("server");

	const params = {
		client_name: "Mastoplace",
		redirect_uris: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback?redirect=${redirectAfterAuth}&server=${server}`,
		scopes: process.env.NEXT_PUBLIC_SCOPE,
	};

	try {
		const data = await fetch(
			withQuery(`https://${server}/api/v1/apps`, params),
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			}
		)
			.then((response) => {
				if (response.ok === false) {
					throw new Error(response.statusText);
				}

				return response.json();
			})
			.then((data) => data);

		const { client_id, client_secret } = data;

		const client = JSON.stringify({ client_id, client_secret });

		const encryptedClient = await sealData(client, {
			password: process.env.CLIENT_COOKIE_PASSWORD as string,
		});

		const response = NextResponse.json<AuthResponse>({
			ok: true,
			url: withQuery(`https://${server}/oauth/authorize`, {
				client_id,
				scope: process.env.NEXT_PUBLIC_SCOPE,
				response_type: "code",
				redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback?redirect=${redirectAfterAuth}&server=${server}`,
			}),
		});

		response.cookies.set(
			process.env.CLIENT_COOKIE_NAME as string,
			encryptedClient,
			{
				maxAge: 60 * 60 * 24 * 7,
			}
		);

		return response;
	} catch {
		return NextResponse.json<AuthResponse>(
			{ ok: false, error: "Can't get client from Mastodon" },
			{ status: 500 }
		);
	}
}
