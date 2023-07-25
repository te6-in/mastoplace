import { StatusGetParams } from "@/app/api/status/[id]/route";
import { client } from "@/libs/server/client";
import { findStatus } from "@/libs/server/findStatus";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { NextRequest, NextResponse } from "next/server";

export interface NearbyStatusesResponse extends DefaultResponse {
	hasLocation?: boolean;
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

		const originalMastodonStatus = await findStatus({
			masto,
			clientServer,
			status: originalStatus,
		});

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
			return NextResponse.json<NearbyStatusesResponse>({
				ok: true,
				hasLocation: false,
			});
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
			select: { id: true, mastodonId: true, server: true, handle: true },
			orderBy: { createdAt: "desc" },
		});

		const isLocalViewable = await Promise.all(
			nearbyStatuses.map(async (nearbyStatus) => {
				if (!nearbyStatus.mastodonId) return false;

				const fetchedStatus = await findStatus({
					masto,
					clientServer,
					status: nearbyStatus,
				});

				if (fetchedStatus) return true;

				return false;
			})
		);

		const localViewableIds = nearbyStatuses
			.filter((_, index) => {
				return isLocalViewable[index];
			})
			.map((nearbyStatus) => nearbyStatus.id);

		// TODO: Add pagination

		return NextResponse.json<NearbyStatusesResponse>({
			ok: true,
			hasLocation: true,
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
