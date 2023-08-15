import { client } from "@/libs/server/client";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { NextRequest, NextResponse } from "next/server";

export type CountResponse = DefaultResponse<{
	allCount: number;
	viewableCount: number;
}>;

export async function GET(request: NextRequest) {
	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<CountResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	try {
		const allCount = await client.status.count({
			where: { server: data.clientServer, handle: data.handle },
		});
		const { masto, clientServer } = data;

		if (!masto || !clientServer) {
			return NextResponse.json<CountResponse>(
				{ ok: false, error: "Can't log in to Mastodon" },
				{ status: 401 }
			);
		}

		try {
			const myStatuses = await client.status.findMany({
				where: { server: data.clientServer, handle: data.handle },
				select: { id: true, mastodonId: true },
			});

			const viewable = await Promise.all(
				myStatuses.map(async (status) => {
					if (!status.mastodonId) return false;

					try {
						await masto.v1.statuses.fetch(status.mastodonId);
						return true;
					} catch {
						return false;
					}
				})
			);

			const viewableCount = viewable.filter((_, i) => viewable[i]).length;

			return NextResponse.json<CountResponse>({
				ok: true,
				allCount,
				viewableCount,
			});
		} catch {
			return NextResponse.json<CountResponse>(
				{ ok: false, error: "Can't get statuses from database" },
				{ status: 500 }
			);
		}
	} catch {
		return NextResponse.json<CountResponse>(
			{ ok: false, error: "Can't get statuses from database" },
			{ status: 500 }
		);
	}
}
