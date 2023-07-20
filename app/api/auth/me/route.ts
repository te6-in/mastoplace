import { DefaultResponse } from "@/libs/server/response";
import { decrypt } from "@/libs/server/session";
import { NextRequest, NextResponse } from "next/server";

export interface MeResponse extends DefaultResponse {
	token: string | null;
	error?: unknown;
}

export async function GET(request: NextRequest) {
	const { token } = await decrypt(request.cookies);

	if (!token) {
		return NextResponse.json<MeResponse>({
			ok: false,
			token: null,
		});
	}

	return NextResponse.json<MeResponse>({
		ok: true,
		token,
	});
}
