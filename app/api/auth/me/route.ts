import { DefaultResponse } from "@/libs/server/response";
import { decrypt } from "@/libs/server/session";
import { NextRequest, NextResponse } from "next/server";

export interface MeResponse extends DefaultResponse {
	token?: string;
	error?: unknown;
}

export async function GET(request: NextRequest) {
	const data = await decrypt({
		type: "session",
		cookies: request.cookies,
	});

	if (!data) {
		return NextResponse.json<MeResponse>({ ok: false }, { status: 401 });
	}

	const { token } = data;

	if (!token) {
		return NextResponse.json<MeResponse>({ ok: false }, { status: 401 });
	}

	return NextResponse.json<MeResponse>({ ok: true, token });
}
