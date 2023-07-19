import { DefaultResponse } from "@/libs/server/response";
import { sealData } from "iron-session";
import { NextRequest, NextResponse } from "next/server";
import { withQuery } from "ufo";

interface AuthResponse extends DefaultResponse {
	error?: unknown;
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const server = searchParams.get("server");
	const code = searchParams.get("code");

	console.log(code);

	const params = {
		client_id: process.env.NEXT_PUBLIC_CLIENT_KEY,
		client_secret: process.env.CLIENT_SECRET,
		redirect_uri: `${process.env.NEXT_PUBLIC_REDIRECT_URI}${
			process.env.NODE_ENV === "development" ? "" : `?server=${server}`
		}`,
		grant_type: "authorization_code",
		code,
		scope: process.env.NEXT_PUBLIC_SCOPE,
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
			.then((response) => {
				if (response.ok === false) {
					throw new Error(response.statusText);
				}

				return response.json();
			})
			.then((data) => data);

		const session = JSON.stringify({
			token: token.access_token,
		});

		const encryptedSession = await sealData(session, {
			password: process.env.SESSION_COOKIE_PASSWORD as string,
		});

		const destination = new URL("/", new URL(request.url).origin);

		const response = NextResponse.redirect(destination);

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
