import { StatusGetParams } from "@/app/api/status/[id]/route";
import { client } from "@/libs/server/client";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { NextRequest, NextResponse } from "next/server";

export interface NearbyStatusesResponse extends DefaultResponse {
	originalLocation?: {
		latitudeFrom: number;
		latitudeTo: number;
		longitudeFrom: number;
		longitudeTo: number;
	};
	nearbyIds?: string[];
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

	const { masto, clientServer } = data;

	if (!masto || !clientServer) {
		return NextResponse.json<NearbyStatusesResponse>(
			{ ok: false },
			{ status: 401 }
		);
	}

	try {
		const originalStatus = await client.status.findUnique({ where: { id } });

		if (!originalStatus || !originalStatus.mastodonId) {
			return NextResponse.json<NearbyStatusesResponse>(
				{ ok: false },
				{ status: 404 }
			);
		}

		let originalMastodonStatus;

		if (clientServer === originalStatus.server) {
			originalMastodonStatus = await masto.v1.statuses.fetch(
				originalStatus.mastodonId
			);
		} else {
			const search = await masto.v2.search({
				q: `https://${originalStatus.server}/@${originalStatus.handle}/${originalStatus.mastodonId}`,
				resolve: true,
				type: "statuses",
			});

			originalMastodonStatus = search.statuses[0];
		}

		if (!originalMastodonStatus) {
			return NextResponse.json<NearbyStatusesResponse>(
				{ ok: false },
				{ status: 404 }
			);
		}

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

		const nearbyStatuses = await client.status.findMany({
			where: {
				NOT: {
					id: originalStatus.id,
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
			select: { id: true, mastodonId: true, server: true },
			orderBy: { createdAt: "desc" },
		});

		const localViewableIds = nearbyStatuses
			.filter(async (nearbyStatus) => {
				if (!nearbyStatus.mastodonId) return false;

				if (clientServer === nearbyStatus.server) {
					const mastodonStatus = await masto.v1.statuses.fetch(
						nearbyStatus.mastodonId
					);

					if (mastodonStatus) return true;
					return false;
				}

				const search = await masto.v2.search({
					q: `https://${nearbyStatus.server}/@${originalStatus.handle}/${nearbyStatus.mastodonId}`,
					resolve: true,
					type: "statuses",
				});

				if (!search.statuses[0]) return true;
				return false;
			})
			.map(({ id }) => id);

		// TODO: Add pagination

		return NextResponse.json<NearbyStatusesResponse>({
			ok: true,
			originalLocation,
			nearbyIds: localViewableIds,
		});
	} catch (error) {
		return NextResponse.json<NearbyStatusesResponse>(
			{ ok: false, error },
			{ status: 500 }
		);
	}
}
