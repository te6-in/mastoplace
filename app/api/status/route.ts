import { client } from "@/libs/server/client";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { Status } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export interface StatusesResponse extends DefaultResponse {
	statuses?: Pick<Status, "id">[];
	error?: unknown;
}

export interface NewStatusResponse extends DefaultResponse {
	id?: string;
	error?: unknown;
}

export async function GET(request: NextRequest) {
	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<StatusesResponse>({ ok: false }, { status: 401 });
	}

	try {
		const { masto } = data;

		// masto.v1.stream.streamUser().then(
		// 	(stream) => stream.on("update", (status) => console.log(status)),
		// )

		const homeStatuses = await masto.v1.timelines.listHome({ limit: 40 });
		const homeStatusesIds = homeStatuses.map(({ id }) => id);

		const statuses = await client.status.findMany({
			where: { mastodonId: { in: homeStatusesIds } },
			select: { id: true },
			orderBy: { createdAt: "desc" },
		});

		// TODO: Add pagination

		return NextResponse.json<StatusesResponse>({ ok: true, statuses });
	} catch (error) {
		return NextResponse.json<StatusesResponse>(
			{ ok: false, error },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	const { text, exact, location } = await request.json();
	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<NewStatusResponse>({ ok: false }, { status: 401 });
	}

	const { masto } = data;

	try {
		const { latitudeFrom, latitudeTo, longitudeFrom, longitudeTo } = location;

		const status = await client.status.create({
			data: {
				exact,
				latitudeFrom,
				latitudeTo,
				longitudeFrom,
				longitudeTo,
			},
		});

		const textWithURL = `${text}\n\nMastoplace: ${process.env.NEXT_PUBLIC_BASE_URL}/status/${status.id}\n\n#Mastoplace`;

		try {
			const { id: mastodonId } = await masto.v1.statuses.create({
				status: textWithURL,
				visibility: "direct",
			});

			await client.status.update({
				where: { id: status.id },
				data: { mastodonId },
			});
		} catch {
			await client.status.delete({ where: { id: status.id } });

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
