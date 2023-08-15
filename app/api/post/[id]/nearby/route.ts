import { StatusGetParams } from "@/app/api/post/[id]/route";
import { client } from "@/libs/server/client";
import { findPosts } from "@/libs/server/findPosts";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { NextRequest, NextResponse } from "next/server";

export type NearbyStatusesResponse = DefaultResponse<{
	nearbyInfo: {
		originalLocation: {
			latitudeFrom: number;
			latitudeTo: number;
			longitudeFrom: number;
			longitudeTo: number;
		};
		nearbyIds: string[];
	} | null;
}>;

export async function GET(
	request: NextRequest,
	{ params: { id } }: StatusGetParams
) {
	if (!id) {
		return NextResponse.json<NearbyStatusesResponse>(
			{ ok: false, error: "No id" },
			{ status: 400 }
		);
	}

	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<NearbyStatusesResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	const { masto, clientServer } = data;

	if (!masto || !clientServer) {
		return NextResponse.json<NearbyStatusesResponse>(
			{ ok: false, error: "Can't log in to Mastodon" },
			{ status: 401 }
		);
	}

	try {
		const originalStatus = await client.status.findUnique({ where: { id } });

		if (!originalStatus || !originalStatus.mastodonId) {
			return NextResponse.json<NearbyStatusesResponse>(
				{ ok: false, error: "Can't find status on database" },
				{ status: 404 }
			);
		}

		const originalMastodonStatus = await findPosts({
			masto,
			clientServer,
			status: originalStatus,
		});

		if (!originalMastodonStatus) {
			return NextResponse.json<NearbyStatusesResponse>(
				{ ok: false, error: "Can't find status on Mastodon" },
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
				nearbyInfo: null,
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

				const fetchedStatus = await findPosts({
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
			nearbyInfo: {
				originalLocation,
				nearbyIds: localViewableIds,
			},
		});
	} catch {
		return NextResponse.json<NearbyStatusesResponse>(
			{ ok: false, error: "Can't get status from database" },
			{ status: 500 }
		);
	}
}
