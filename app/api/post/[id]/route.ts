import { client } from "@/libs/server/client";
import { findPosts } from "@/libs/server/findPosts";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { mastodon } from "masto";
import { NextRequest, NextResponse } from "next/server";

export type StatusResponse = DefaultResponse<{
	mastodonStatus: mastodon.v1.Status;
	clientServer: string;
	clientHandle: string;
	exact: boolean | null;
	location: {
		latitudeFrom: number;
		latitudeTo: number;
		longitudeFrom: number;
		longitudeTo: number;
	} | null;
}>;

export type StatusDeleteResponse = DefaultResponse;

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
		return NextResponse.json<StatusResponse>(
			{ ok: false, error: "No id" },
			{ status: 400 }
		);
	}

	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<StatusResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	const { masto, clientServer, handle: clientHandle } = data;

	if (!masto) {
		return NextResponse.json<StatusResponse>(
			{ ok: false, error: "Can't log in to Mastodon" },
			{ status: 401 }
		);
	}

	try {
		const status = await client.status.findUnique({ where: { id } });

		if (!status || !status.mastodonId) {
			return NextResponse.json<StatusResponse>(
				{ ok: false, error: "Can't find status" },
				{ status: 404 }
			);
		}

		const mastodonStatus = await findPosts({ masto, clientServer, status });

		if (!mastodonStatus) {
			return NextResponse.json<StatusResponse>(
				{ ok: false, error: "Can't find status on Mastodon" },
				{ status: 404 }
			);
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
			clientHandle,
			mastodonStatus,
			exact,
			location,
		});
	} catch {
		return NextResponse.json<StatusResponse>(
			{ ok: false, error: "Can't get status from database" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params: { id } }: StatusGetParams
) {
	if (!id) {
		return NextResponse.json<StatusResponse>(
			{ ok: false, error: "No id" },
			{ status: 400 }
		);
	}

	const { searchParams } = new URL(request.url);
	const type = searchParams.get("type");

	if (!type) {
		return NextResponse.json<StatusDeleteResponse>(
			{ ok: false, error: "No type" },
			{ status: 400 }
		);
	}

	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<StatusDeleteResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	const { masto, clientServer, handle } = data;

	if (type === "all") {
		if (!masto || !clientServer || !handle) {
			return NextResponse.json<StatusDeleteResponse>(
				{ ok: false, error: "Can't log in to Mastodon" },
				{ status: 401 }
			);
		}

		try {
			const status = await client.status.findUnique({
				where: { server: clientServer, handle, id },
				select: { mastodonId: true },
			});

			if (!status || !status.mastodonId) {
				return NextResponse.json<StatusDeleteResponse>(
					{ ok: false, error: "Can't find status" },
					{ status: 404 }
				);
			}

			try {
				await masto.v1.statuses.remove(status.mastodonId);
			} catch {
				return NextResponse.json<StatusDeleteResponse>(
					{ ok: false, error: "Can't delete status on Mastodon" },
					{ status: 500 }
				);
			}

			await client.status.delete({
				where: { server: clientServer, handle, id },
			});

			return NextResponse.json<StatusDeleteResponse>({ ok: true });
		} catch {
			return NextResponse.json<StatusDeleteResponse>(
				{ ok: false, error: "Can't get status from database" },
				{ status: 500 }
			);
		}
	}

	if (type === "database") {
		if (!clientServer || !handle) {
			return NextResponse.json<StatusDeleteResponse>(
				{ ok: false, error: "Can't verify login" },
				{ status: 401 }
			);
		}

		try {
			await client.status.delete({
				where: { server: clientServer, handle, id },
			});

			return NextResponse.json<StatusDeleteResponse>({ ok: true });
		} catch {
			return NextResponse.json<StatusDeleteResponse>(
				{ ok: false, error: "Can't delete status from database" },
				{ status: 500 }
			);
		}
	}
}
