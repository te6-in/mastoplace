import { AuthResponse } from "@/app/api/auth/route";
import { decrypt } from "@/libs/server/session";
import { sealData } from "iron-session";
import { NextRequest, NextResponse } from "next/server";
import { withQuery } from "ufo";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const server = searchParams.get("server");
	const code = searchParams.get("code");

	const data = await decrypt({
		type: "client",
		cookies: request.cookies,
	});

	if (!data) {
		return NextResponse.json(
			{
				ok: false,
			},
			{
				status: 401,
			}
		);
	}

	const { client_id, client_secret } = data;

	const params = {
		client_id,
		client_secret,
		redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback?server=${server}`,
		grant_type: "authorization_code",
		code,
		scope: (process.env.NEXT_PUBLIC_SCOPE as string).replaceAll(" ", "+"),
	};

	try {
		const token = await fetch(
			withQuery(`https://${server}/oauth/token`, params),
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			}
		)
			.then((response) => response.json())
			.then((data) => data);

		const session = JSON.stringify({
			token: token.access_token,
			server,
		});

		const encryptedSession = await sealData(session, {
			password: process.env.SESSION_COOKIE_PASSWORD as string,
		});

		const response = NextResponse.redirect(
			process.env.NEXT_PUBLIC_BASE_URL as string
		);

		response.cookies.delete(process.env.CLIENT_COOKIE_NAME as string);

		response.cookies.set(
			process.env.SESSION_COOKIE_NAME as string,
			encryptedSession,
			{
				maxAge: 60 * 60 * 24 * 7,
			}
		);

		return response;
	} catch (error) {
		return NextResponse.json<AuthResponse>(
			{
				ok: false,
				error,
			},
			{
				status: 500,
			}
		);
	}
}
