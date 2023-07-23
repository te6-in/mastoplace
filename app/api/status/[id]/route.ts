import { client } from "@/libs/server/client";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { mastodon } from "masto";
import { NextRequest, NextResponse } from "next/server";

export interface StatusResponse extends DefaultResponse {
	mastodonStatus?: mastodon.v1.Status;
	clientServer?: string;
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

	const { masto, clientServer } = data;

	if (!masto) {
		return NextResponse.json<StatusResponse>({ ok: false }, { status: 401 });
	}

	try {
		const status = await client.status.findUnique({ where: { id } });

		if (!status || !status.mastodonId) {
			return NextResponse.json<StatusResponse>({ ok: false }, { status: 404 });
		}

		let mastodonStatus;

		if (clientServer === status.server) {
			mastodonStatus = await masto.v1.statuses.fetch(status.mastodonId);
		} else {
			const search = await masto.v2.search({
				q: `https://${status.server}/@${status.handle}/${status.mastodonId}`,
				resolve: true,
				type: "statuses",
			});

			mastodonStatus = search.statuses[0];
		}

		if (!mastodonStatus) {
			return NextResponse.json<StatusResponse>({ ok: false }, { status: 404 });
		}

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
			clientServer,
			mastodonStatus,
			exact,
			location,
		});
	} catch (error) {
		console.log(error);
		return NextResponse.json<StatusResponse>(
			{ ok: false, error },
			{ status: 500 }
		);
	}
}
