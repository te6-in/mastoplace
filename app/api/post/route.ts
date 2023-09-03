import { NewStatusRequest } from "@/app/post/new/page";
import { PostBlockPost } from "@/components/PostBlock";
import { client } from "@/libs/server/client";
import { findPosts } from "@/libs/server/findPosts";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { createClient } from "masto";
import { NextRequest, NextResponse } from "next/server";

export type StatusesResponse = DefaultResponse<{
	statuses: PostBlockPost[];
	nextMaxId: string | null;
}>;

export type NewStatusResponse = DefaultResponse<
	{
		id: string;
	},
	{
		supportedLanguages?: string[];
		clientServer?: string;
	}
>;

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const maxId = searchParams.get("max_id");
	const isDiscover = searchParams.get("discover") === "true";

	const data = await mastodonClient(request.cookies);

	if (!isDiscover && !data) {
		return NextResponse.json<StatusesResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	try {
		const databaseStatuses = await client.status.findMany({
			cursor: maxId ? { id: maxId } : undefined,
			skip: maxId ? 1 : undefined,
			take: 20,
			select: { id: true, mastodonId: true, server: true, handle: true },
			orderBy: { createdAt: "desc" },
		});

		const viewableStatuses: (PostBlockPost | undefined)[] = await Promise.all(
			databaseStatuses.map(async (status) => {
				let clientToUse, clientServerToUse;

				// mastodonId 없는 글은 어차피 못 봄
				if (!status.mastodonId) return;

				// 로그인 상태인 경우
				if (data) {
					const { masto, clientServer } = data;

					if (!masto || !clientServer) return;

					clientServerToUse = clientServer;
					clientToUse = masto;
				} else {
					// 로그인 상태가 아니면 리모트 글은 볼 수 없음
					if (status.server !== "mastodon.social") return;

					// 로그인 상태가 아닌 경우 mastodon.social 사용
					clientServerToUse = "mastodon.social";
					clientToUse = createClient({
						url: "https://mastodon.social",
					});
				}

				try {
					const mastodonStatus = await findPosts({
						masto: clientToUse,
						clientServer: clientServerToUse,
						clientHandle: data?.handle ?? "",
						status,
						option: isDiscover ? "onlyNotFollowing" : "onlyFollowingOrMine",
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
						where: { id: status.id },
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
						databaseId: status.id,
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

		const viewableStatusesOptimized = viewableStatuses.filter(
			(status): status is PostBlockPost => status !== undefined
		);

		const nextMaxId =
			databaseStatuses.length === 0
				? null
				: databaseStatuses[databaseStatuses.length - 1].id;

		return NextResponse.json<StatusesResponse>({
			ok: true,
			statuses: viewableStatusesOptimized,
			nextMaxId,
		});
	} catch {
		return NextResponse.json<StatusesResponse>(
			{ ok: false, error: "Can't get statuses from database" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	const json = (await request.json()) as NewStatusRequest;
	const { text, location, visibility, exact, lang } = json;
	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<NewStatusResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	if (exact !== null && location === null) {
		return NextResponse.json<NewStatusResponse>(
			{ ok: false, error: "Location is null" },
			{ status: 400 }
		);
	}

	const { masto, clientServer, handle } = data;

	if (!masto) {
		return NextResponse.json<NewStatusResponse>(
			{ ok: false, error: "Can't log in to Mastodon" },
			{ status: 401 }
		);
	}

	const supportedLanguages = ["ko"];

	const server = await masto.v1.instances.fetch();

	const serverSupportsLanguages = supportedLanguages.some((lang) =>
		server.languages.includes(lang)
	);

	if (!serverSupportsLanguages) {
		return NextResponse.json<NewStatusResponse>(
			{
				ok: false,
				error: "BETA_LIMITED_SERVER_ERROR",
				supportedLanguages,
				clientServer,
			},
			{ status: 403 }
		);
	}

	try {
		const { latitudeFrom, latitudeTo, longitudeFrom, longitudeTo } =
			location ?? {
				latitudeFrom: null,
				latitudeTo: null,
				longitudeFrom: null,
				longitudeTo: null,
			};

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

		const getPrefix = (lang: string) => {
			switch (lang) {
				case "ko":
					return "주변 글 보기";
				case "en-US":
					return "View nearby posts";
			}
		};

		const texts = [
			text,
			`${getPrefix(lang)}: ${
				process.env.NODE_ENV === "production"
					? `${process.env.NEXT_PUBLIC_BASE_URL}/post/${status.id}`
					: "[Mastoplace 주소]"
			}`,
			"#Mastoplace",
		];

		try {
			const { id: mastodonId } = await masto.v1.statuses.create({
				status: texts.join("\n\n"),
				visibility,
			});

			await client.status.update({
				where: { id: status.id },
				data: { mastodonId },
			});
		} catch {
			await client.status.delete({ where: { id: status.id } });

			return NextResponse.json<NewStatusResponse>(
				{ ok: false, error: "Can't post to Mastodon" },
				{ status: 500 }
			);
		}

		return NextResponse.json<NewStatusResponse>({ ok: true, id: status.id });
	} catch {
		return NextResponse.json<NewStatusResponse>(
			{ ok: false, error: "Can't create status" },
			{ status: 500 }
		);
	}
}
