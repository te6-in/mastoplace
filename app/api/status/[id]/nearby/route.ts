import { StatusGetParams } from "@/app/api/status/[id]/route";
import { client } from "@/libs/server/client";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { Status } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export interface NearbyStatusesResponse extends DefaultResponse {
	originalLocation?: {
		latitudeFrom: number;
		latitudeTo: number;
		longitudeFrom: number;
		longitudeTo: number;
	};
	nearbyStatuses?: Pick<Status, "id">[];
	error?: unknown;
}

export async function GET(
	request: NextRequest,
	{ params: { id } }: StatusGetParams
) {
	if (!id) {
		return NextResponse.json<NearbyStatusesResponse>(
			{ ok: false },
			{ status: 400 }
		);
	}

	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<NearbyStatusesResponse>(
			{ ok: false },
			{ status: 401 }
		);
	}

	const { masto, server } = data;

	if (!masto || !server) {
		return NextResponse.json<NearbyStatusesResponse>(
			{ ok: false },
			{ status: 401 }
		);
	}

	try {
		const originalStatus = await client.status.findUnique({
			where: { id },
			select: {
				id: true,
				exact: true,
				mastodonId: true,
				latitudeFrom: true,
				latitudeTo: true,
				longitudeFrom: true,
				longitudeTo: true,
			},
		});

		if (!originalStatus || !originalStatus.mastodonId) {
			return NextResponse.json<NearbyStatusesResponse>(
				{ ok: false },
				{ status: 404 }
			);
		}

		await masto.v1.statuses.fetch(originalStatus.mastodonId); // 볼 수 있는지 검증만 하면 됨

		const { latitudeFrom, latitudeTo, longitudeFrom, longitudeTo } =
			originalStatus;

		const originalLocation =
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

		if (!originalLocation) {
			return NextResponse.json<NearbyStatusesResponse>(
				{ ok: false, error: "요청된 글에 위치 정보가 없습니다." },
				{ status: 400 }
			);
		}

		const homeStatuses = await masto.v1.timelines.listHome({ limit: 40 });
		const publicStatuses = await masto.v1.timelines.listPublic({ limit: 40 });

		const homeStatusesIds = homeStatuses.map(({ id }) => id);
		const publicStatusesIds = publicStatuses.map(({ id }) => id);

		const statusIds = Array.from(
			new Set([...homeStatusesIds, ...publicStatusesIds])
		);

		const nearbyStatuses = await client.status.findMany({
			where: {
				mastodonId: {
					in: statusIds,
				},
				latitudeFrom: {
					lte: originalLocation.latitudeTo + 0.05,
					gte: originalLocation.latitudeFrom - 0.05,
				},
				latitudeTo: {
					lte: originalLocation.latitudeTo + 0.05,
					gte: originalLocation.latitudeFrom - 0.05,
				},
				longitudeFrom: {
					lte: originalLocation.longitudeTo + 0.05,
					gte: originalLocation.longitudeFrom - 0.05,
				},
				longitudeTo: {
					lte: originalLocation.longitudeTo + 0.05,
					gte: originalLocation.longitudeFrom - 0.05,
				},
			},
			select: { id: true },
			orderBy: { createdAt: "desc" },
		});

		// TODO: Add pagination

		return NextResponse.json<NearbyStatusesResponse>({
			ok: true,
			originalLocation,
			nearbyStatuses: nearbyStatuses.filter(
				({ id }) => id !== originalStatus.id
			),
		});
	} catch (error) {
		return NextResponse.json<NearbyStatusesResponse>(
			{ ok: false, error },
			{ status: 500 }
		);
	}
}
