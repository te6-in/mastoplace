import { client } from "@/libs/server/client";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { Status } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export interface MyStatusesResponse extends DefaultResponse {
	myStatuses?: Pick<Status, "id" | "mastodonId">[];
	nextMaxId?: string;
}

export interface DeleteAllResponse extends DefaultResponse {}

export async function GET(request: NextRequest) {
	const data = await mastodonClient(request.cookies);
	const { searchParams } = new URL(request.url);
	const maxId = searchParams.get("max_id");

	if (!data) {
		return NextResponse.json<MyStatusesResponse>(
			{ ok: false },
			{ status: 401 }
		);
	}

	const { masto, clientServer } = data;

	if (!masto || !clientServer) {
		return NextResponse.json<MyStatusesResponse>(
			{ ok: false },
			{ status: 401 }
		);
	}

	try {
		const myStatuses = await client.status.findMany({
			where: { server: data.clientServer, handle: data.handle },
			cursor: maxId ? { id: maxId } : undefined,
			skip: maxId ? 1 : undefined,
			take: 20,
			select: { id: true, mastodonId: true },
			orderBy: { createdAt: "desc" },
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

		const viewableStatuses = myStatuses.filter((_, i) => viewable[i]);

		const nextMaxId =
			myStatuses.length === 0
				? undefined
				: myStatuses[myStatuses.length - 1].id;

		return NextResponse.json<MyStatusesResponse>({
			ok: true,
			myStatuses: viewableStatuses,
			nextMaxId,
		});
	} catch (error) {
		return NextResponse.json<MyStatusesResponse>(
			{ ok: false },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const type = searchParams.get("type");

	if (!type) {
		return NextResponse.json<MyStatusesResponse>(
			{ ok: false },
			{ status: 400 }
		);
	}

	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<DeleteAllResponse>({ ok: false }, { status: 401 });
	}

	const { masto, clientServer, handle } = data;

	if (type === "statuses") {
		if (!masto || !clientServer || !handle) {
			return NextResponse.json<DeleteAllResponse>(
				{ ok: false },
				{ status: 401 }
			);
		}

		try {
			const statuses = await client.status.findMany({
				where: { server: clientServer, handle, mastodonId: { not: null } },
				select: { mastodonId: true },
			});

			const ids = statuses.map((status) => status.mastodonId);

			await Promise.all(
				ids.map(async (id) => {
					if (!id) return;

					await masto.v1.statuses.remove(id);
				})
			);

			return NextResponse.json<DeleteAllResponse>({ ok: true });
		} catch (error) {
			return NextResponse.json<DeleteAllResponse>(
				{ ok: false },
				{ status: 500 }
			);
		}
	}

	if (type === "database") {
		if (!clientServer || !handle) {
			return NextResponse.json<DeleteAllResponse>(
				{ ok: false },
				{ status: 401 }
			);
		}

		try {
			await client.status.deleteMany({
				where: { server: clientServer, handle },
			});

			return NextResponse.json<DeleteAllResponse>({ ok: true });
		} catch (error) {
			return NextResponse.json<DeleteAllResponse>(
				{ ok: false },
				{ status: 500 }
			);
		}
	}
}
