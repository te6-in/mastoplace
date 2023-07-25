import { client } from "@/libs/server/client";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { NextRequest, NextResponse } from "next/server";

export interface MyCountResponse extends DefaultResponse {
	count?: number;
}

export async function GET(request: NextRequest) {
	const data = await mastodonClient(request.cookies);
	const { searchParams } = new URL(request.url);
	const viewable = searchParams.get("viewable") === "true";

	if (!data) {
		return NextResponse.json<MyCountResponse>({ ok: false }, { status: 401 });
	}

	if (!viewable) {
		try {
			const count = await client.status.count({
				where: { server: data.clientServer, handle: data.handle },
			});

			return NextResponse.json<MyCountResponse>({ ok: true, count });
		} catch {
			return NextResponse.json<MyCountResponse>({ ok: false }, { status: 500 });
		}
	}

	const { masto, clientServer } = data;

	if (!masto || !clientServer) {
		return NextResponse.json<MyCountResponse>({ ok: false }, { status: 401 });
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
				} catch (error) {
					return false;
				}
			})
		);

		const count = viewable.filter((_, i) => viewable[i]).length;

		return NextResponse.json<MyCountResponse>({
			ok: true,
			count,
		});
	} catch (error) {
		return NextResponse.json<MyCountResponse>({ ok: false }, { status: 500 });
	}
}
