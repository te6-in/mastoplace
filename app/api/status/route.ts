import { client } from "@/libs/server/client";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { Status } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export interface StatusesResponse extends DefaultResponse {
	localViewableStatuses?: Pick<Status, "id" | "mastodonId">[];
	nextMaxId?: string;
}

export interface NewStatusResponse extends DefaultResponse {
	id?: string;
	error?: unknown;
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const maxId = searchParams.get("max_id");

	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<StatusesResponse>({ ok: false }, { status: 401 });
	}

	try {
		const { masto, clientServer } = data;

		const statuses = await client.status.findMany({
			cursor: maxId ? { id: maxId } : undefined,
			skip: maxId ? 1 : undefined,
			take: 20,
			select: { id: true, mastodonId: true, server: true, handle: true },
			orderBy: { createdAt: "desc" },
		});

		const localViewableStatuses = statuses.filter(async (status) => {
			if (!status.mastodonId) return false;

			if (clientServer === status.server) {
				const mastodonStatus = await masto.v1.statuses.fetch(status.mastodonId);

				if (mastodonStatus) return true;
				return false;
			}

			const search = await masto.v2.search({
				q: `https://${status.server}/@${status.handle}/${status.mastodonId}`,
				resolve: true,
				type: "statuses",
			});

			if (!search.statuses[0]) return true;
			return false;
		});

		const nextMaxId =
			statuses.length === 0 ? undefined : statuses[statuses.length - 1].id;

		return NextResponse.json<StatusesResponse>({
			ok: true,
			localViewableStatuses,
			nextMaxId,
		});
	} catch (error) {
		return NextResponse.json<StatusesResponse>({ ok: false }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	const { text, exact, location } = await request.json();
	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<NewStatusResponse>({ ok: false }, { status: 401 });
	}

	const { masto, clientServer, handle } = data;

	try {
		const { latitudeFrom, latitudeTo, longitudeFrom, longitudeTo } = location;

		const status = await client.status.create({
			data: {
				exact,
				server: clientServer,
				handle,
				latitudeFrom,
				latitudeTo,
				longitudeFrom,
				longitudeTo,
			},
		});

		const textWithURL = `${text}\n\n${process.env.NEXT_PUBLIC_BASE_URL}/status/${status.id}\n\n#Mastoplace`;

		try {
			const { id: mastodonId } = await masto.v1.statuses.create({
				status: textWithURL,
				visibility: "direct",
			});

			await client.status.update({
				where: { id: status.id },
				data: { mastodonId },
			});
		} catch (error) {
			await client.status.delete({ where: { id: status.id } });

			console.log(error);
			return NextResponse.json<NewStatusResponse>(
				{ ok: false },
				{ status: 500 }
			);
		}

		return NextResponse.json<NewStatusResponse>({ ok: true, id: status.id });
	} catch (error) {
		return NextResponse.json<NewStatusResponse>(
			{ ok: false, error },
			{ status: 500 }
		);
	}
}
