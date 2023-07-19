import { DefaultResponse } from "@/libs/server/response";
import { unsealData } from "iron-session";
import { NextRequest, NextResponse } from "next/server";

export interface MeResponse extends DefaultResponse {
	token: string | null;
	error?: unknown;
}

export async function GET(request: NextRequest) {
	const cookieName = process.env.SESSION_COOKIE_NAME as string;
	const found = request.cookies.get(cookieName);

	if (!found) {
		return NextResponse.json<MeResponse>(
			{
				ok: false,
				token: null,
			},
			{
				status: 401,
			}
		);
	}

	try {
		const data = (await unsealData(found.value, {
			password: process.env.SESSION_COOKIE_PASSWORD as string,
		})) as string;

		const { token } = JSON.parse(data);

		return NextResponse.json<MeResponse>({
			ok: true,
			token,
		});
	} catch (error) {
		return NextResponse.json<MeResponse>(
			{
				ok: false,
				token: null,
				error,
			},
			{
				status: 401,
			}
		);
	}
}
