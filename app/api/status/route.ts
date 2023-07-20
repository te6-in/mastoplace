import { client } from "@/libs/server/client";
import { DefaultResponse } from "@/libs/server/response";
import { mastodon } from "@/libs/server/session";
import { NextRequest, NextResponse } from "next/server";

export interface NewStatusResponse extends DefaultResponse {
	ok: boolean;
	text?: {
		text: string;
		location?: {
			latitudeFrom: number;
			latitudeTo: number;
			longitudeFrom: number;
			longitudeTo: number;
		};
	};
}

export async function POST(request: NextRequest) {
	const { text, location } = await request.json();
	const masto = await mastodon(request.cookies);

	if (!masto) {
		return NextResponse.json<NewStatusResponse>({ ok: false }, { status: 401 });
	}

	try {
		const { id } = await masto.v1.statuses.create({
			status: text,
		});

		const { latitudeFrom, latitudeTo, longitudeFrom, longitudeTo } = location;

		await client.status.create({
			data: {
				id: Number(id),
				latitudeFrom,
				latitudeTo,
				longitudeFrom,
				longitudeTo,
			},
		});

		return NextResponse.json<NewStatusResponse>({
			ok: true,
		});
	} catch (error) {
		return NextResponse.json<NewStatusResponse>(
			{
				ok: false,
			},
			{
				status: 500,
			}
		);
	}
}
