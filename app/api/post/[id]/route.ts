import { PostBlockPost } from "@/components/PostBlock";
import { client } from "@/libs/server/client";
import { findPosts } from "@/libs/server/findPosts";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { NextRequest, NextResponse } from "next/server";

export type StatusResponse = DefaultResponse<
	PostBlockPost & {
		nearbyPosts: PostBlockPost[] | null;
	}
>;

export type StatusDeleteResponse = DefaultResponse;

export interface StatusGetParams {
	params: {
		id: string;
	};
}

export async function GET(
	request: NextRequest,
	{ params: { id } }: StatusGetParams
) {
	if (!id) {
		return NextResponse.json<StatusResponse>(
			{ ok: false, error: "No id" },
			{ status: 400 }
		);
	}

	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<StatusResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	const { masto, clientServer, handle } = data;

	if (!masto) {
		return NextResponse.json<StatusResponse>(
			{ ok: false, error: "Can't log in to Mastodon" },
			{ status: 401 }
		);
	}

	try {
		const status = await client.status.findUnique({ where: { id } });

		if (!status || !status.mastodonId) {
			return NextResponse.json<StatusResponse>(
				{ ok: false, error: "Can't find status" },
				{ status: 404 }
			);
		}

		const mastodonStatus = await findPosts({
			masto,
			clientServer,
			clientHandle: handle,
			status,
			option: "whatever",
		});

		if (!mastodonStatus) {
			return NextResponse.json<StatusResponse>(
				{ ok: false, error: "Can't find status on Mastodon" },
				{ status: 404 }
			);
		}

		const { exact, latitudeFrom, latitudeTo, longitudeFrom, longitudeTo } =
			status;

		const location =
			(exact !== null &&
				latitudeFrom &&
				latitudeTo &&
				longitudeFrom &&
				longitudeTo && {
					exact,
					latitudeFrom,
					latitudeTo,
					longitudeFrom,
					longitudeTo,
				}) ||
			null;

		if (
			!location ||
			!latitudeFrom ||
			!latitudeTo ||
			!longitudeFrom ||
			!longitudeTo
		) {
			return NextResponse.json<StatusResponse>({
				ok: true,
				databaseId: status.id,
				mastodonStatus: {
					acct: mastodonStatus.account.acct,
					avatar: mastodonStatus.account.avatar,
					displayName: mastodonStatus.account.displayName,
					content: mastodonStatus.content,
					createdAt: mastodonStatus.createdAt,
					visibility: mastodonStatus.visibility,
					uri: mastodonStatus.uri,
				},
				location,
				nearbyPosts: null,
			});
		}

		const nearbyStatuses = await client.status.findMany({
			where: {
				NOT: {
					id: status.id,
				},
				latitudeFrom: {
					lte: latitudeTo + 0.05,
					gte: latitudeFrom - 0.05,
				},
				latitudeTo: {
					lte: latitudeTo + 0.05,
					gte: latitudeFrom - 0.05,
				},
				longitudeFrom: {
					lte: longitudeTo + 0.05,
					gte: longitudeFrom - 0.05,
				},
				longitudeTo: {
					lte: longitudeTo + 0.05,
					gte: longitudeFrom - 0.05,
				},
			},
			select: { id: true, mastodonId: true, server: true, handle: true },
			orderBy: { createdAt: "desc" },
		});

		const viewableNearbyStatuses = await Promise.all(
			nearbyStatuses.map(async (nearbyStatus) => {
				if (!nearbyStatus.mastodonId) return;
				if (nearbyStatus.id === status.id) return;

				try {
					const mastodonStatus = await findPosts({
						masto,
						clientServer,
						clientHandle: handle,
						status: nearbyStatus,
						option: "whatever",
					});

					if (!mastodonStatus) return;

					const {
						account: { avatar, acct, displayName },
						content,
						createdAt,
						visibility,
						uri,
					} = mastodonStatus;

					const databaseLocation = await client.status.findUnique({
						where: { id: nearbyStatus.id },
						select: {
							exact: true,
							latitudeFrom: true,
							latitudeTo: true,
							longitudeFrom: true,
							longitudeTo: true,
						},
					});

					if (!databaseLocation) return;

					let location: PostBlockPost["location"];

					const {
						exact,
						latitudeFrom,
						latitudeTo,
						longitudeFrom,
						longitudeTo,
					} = databaseLocation;

					if (
						exact === null ||
						latitudeFrom === null ||
						latitudeTo === null ||
						longitudeFrom === null ||
						longitudeTo === null
					) {
						location = null;
					} else {
						location = {
							exact,
							latitudeFrom,
							latitudeTo,
							longitudeFrom,
							longitudeTo,
						};
					}

					return {
						databaseId: nearbyStatus.id,
						mastodonStatus: {
							uri,
							avatar,
							displayName,
							acct,
							content,
							createdAt,
							visibility,
						},
						location,
					};
				} catch {
					return;
				}
			})
		);

		// TODO: Add pagination

		const viewableNearbyStatusesOptimized = viewableNearbyStatuses.filter(
			(status): status is PostBlockPost => status !== undefined
		);

		return NextResponse.json<StatusResponse>({
			ok: true,
			databaseId: status.id,
			mastodonStatus: {
				acct: mastodonStatus.account.acct,
				avatar: mastodonStatus.account.avatar,
				displayName: mastodonStatus.account.displayName,
				content: mastodonStatus.content,
				createdAt: mastodonStatus.createdAt,
				visibility: mastodonStatus.visibility,
				uri: mastodonStatus.uri,
			},
			location,
			nearbyPosts: viewableNearbyStatusesOptimized,
		});
	} catch {
		return NextResponse.json<StatusResponse>(
			{ ok: false, error: "Can't get status from database" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params: { id } }: StatusGetParams
) {
	if (!id) {
		return NextResponse.json<StatusResponse>(
			{ ok: false, error: "No id" },
			{ status: 400 }
		);
	}

	const { searchParams } = new URL(request.url);
	const type = searchParams.get("type");

	if (!type) {
		return NextResponse.json<StatusDeleteResponse>(
			{ ok: false, error: "No type" },
			{ status: 400 }
		);
	}

	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<StatusDeleteResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	const { masto, clientServer, handle } = data;

	if (type === "all") {
		if (!masto || !clientServer || !handle) {
			return NextResponse.json<StatusDeleteResponse>(
				{ ok: false, error: "Can't log in to Mastodon" },
				{ status: 401 }
			);
		}

		try {
			const status = await client.status.findUnique({
				where: { server: clientServer, handle, id },
				select: { mastodonId: true },
			});

			if (!status || !status.mastodonId) {
				return NextResponse.json<StatusDeleteResponse>(
					{ ok: false, error: "Can't find status" },
					{ status: 404 }
				);
			}

			try {
				await masto.v1.statuses.remove(status.mastodonId);
			} catch {
				return NextResponse.json<StatusDeleteResponse>(
					{ ok: false, error: "Can't delete status on Mastodon" },
					{ status: 500 }
				);
			}

			await client.status.delete({
				where: { server: clientServer, handle, id },
			});

			return NextResponse.json<StatusDeleteResponse>({ ok: true });
		} catch {
			return NextResponse.json<StatusDeleteResponse>(
				{ ok: false, error: "Can't get status from database" },
				{ status: 500 }
			);
		}
	}

	if (type === "database") {
		if (!clientServer || !handle) {
			return NextResponse.json<StatusDeleteResponse>(
				{ ok: false, error: "Can't verify login" },
				{ status: 401 }
			);
		}

		try {
			await client.status.delete({
				where: { server: clientServer, handle, id },
			});

			return NextResponse.json<StatusDeleteResponse>({ ok: true });
		} catch {
			return NextResponse.json<StatusDeleteResponse>(
				{ ok: false, error: "Can't delete status from database" },
				{ status: 500 }
			);
		}
	}
}
