import { EmptyResponse } from "@/libs/server/response";
import { decrypt } from "@/libs/server/session";
import { NextRequest, NextResponse } from "next/server";

export type MeResponse = EmptyResponse;

export async function GET(request: NextRequest) {
	const data = await decrypt({
		type: "session",
		cookies: request.cookies,
	});

	if (!data) {
		return NextResponse.json<MeResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	const { token } = data;

	if (!token) {
		return NextResponse.json<MeResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	return NextResponse.json<MeResponse>({ ok: true });
}
