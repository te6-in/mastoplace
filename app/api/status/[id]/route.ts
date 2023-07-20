import { mastodon } from "@/libs/server/session";
import { NextRequest, NextResponse } from "next/server";

type StatusResponse = unknown;

interface GetParams {
	params: {
		id: string;
	};
}

export async function GET(request: NextRequest, { params: { id } }: GetParams) {
	const masto = await mastodon(request.cookies);

	if (!id) {
		return NextResponse.json<StatusResponse>({ ok: false }, { status: 400 });
	}

	if (!masto) {
		return NextResponse.json<StatusResponse>({ ok: false }, { status: 401 });
	}

	try {
		const status = await masto.v1.statuses.fetch(id);

		return NextResponse.json<StatusResponse>({
			ok: true,
			status,
		});
	} catch (error) {
		return NextResponse.json<StatusResponse>({ ok: false }, { status: 500 });
	}
}
