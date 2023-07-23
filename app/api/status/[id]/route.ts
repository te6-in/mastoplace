import { client } from "@/libs/server/client";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { mastodon } from "masto";
import { NextRequest, NextResponse } from "next/server";

export interface StatusResponse extends DefaultResponse {
	mastodonStatus?: mastodon.v1.Status;
	server?: string;
	exact?: boolean | null;
	location?: {
		latitudeFrom: number;
		latitudeTo: number;
		longitudeFrom: number;
		longitudeTo: number;
	} | null;
	error?: unknown;
}

export interface StatusGetParams {
	params: {
		id: string;
	};
}

export async function GET(
	request: NextRequest,
	{ params: { id } }: StatusGetParams
) {
	if (!id) {
		return NextResponse.json<StatusResponse>({ ok: false }, { status: 400 });
	}

	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<StatusResponse>({ ok: false }, { status: 401 });
	}

	const { masto, server } = data;

	if (!masto || !server) {
		return NextResponse.json<StatusResponse>({ ok: false }, { status: 401 });
	}

	try {
		const status = await client.status.findUnique({
			where: { id },
			select: {
				exact: true,
				mastodonId: true,
				latitudeFrom: true,
				latitudeTo: true,
				longitudeFrom: true,
				longitudeTo: true,
			},
		});

		if (!status || !status.mastodonId) {
			return NextResponse.json<StatusResponse>({ ok: false }, { status: 404 });
		}

		const mastodonStatus = await masto.v1.statuses.fetch(status.mastodonId);

		const { exact, latitudeFrom, latitudeTo, longitudeFrom, longitudeTo } =
			status;

		const location =
			(latitudeFrom &&
				latitudeTo &&
				longitudeFrom &&
				longitudeTo && {
					latitudeFrom,
					latitudeTo,
					longitudeFrom,
					longitudeTo,
				}) ||
			null;

		return NextResponse.json<StatusResponse>({
			ok: true,
			server,
			mastodonStatus,
			exact,
			location,
		});
	} catch (error) {
		return NextResponse.json<StatusResponse>(
			{ ok: false, error },
			{ status: 500 }
		);
	}
}
