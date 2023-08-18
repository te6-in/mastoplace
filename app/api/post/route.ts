import { NewStatusRequest } from "@/app/post/new/page";
import { client } from "@/libs/server/client";
import { findPosts } from "@/libs/server/findPosts";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { Status } from "@prisma/client";
import { createClient } from "masto";
import { NextRequest, NextResponse } from "next/server";

export type StatusesResponse = DefaultResponse<{
	localViewableStatuses: Pick<Status, "id" | "mastodonId">[];
	nextMaxId: string | null;
}>;

export type NewStatusResponse = DefaultResponse<
	{
		id: string;
	},
	{
		supportedServers?: string[];
		clientServer?: string;
	}
>;

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const maxId = searchParams.get("max_id");
	const isPublic = searchParams.get("public") === "true";

	const data = await mastodonClient(request.cookies);

	if (!isPublic && !data) {
		return NextResponse.json<StatusesResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	try {
		const statuses = await client.status.findMany({
			cursor: maxId ? { id: maxId } : undefined,
			skip: maxId ? 1 : undefined,
			take: 20,
			select: { id: true, mastodonId: true, server: true, handle: true },
			orderBy: { createdAt: "desc" },
		});

		const isLocalViewable = await Promise.all(
			statuses.map(async (status) => {
				if (!status.mastodonId) return false;

				// 로그인 상태인 경우
				if (data) {
					const { masto, clientServer } = data;

					if (!masto || !clientServer) return false;

					// 내가 쓴 글은 항상 보임
					if (status.server === clientServer && status.handle === data.handle)
						return true;

					const mastodonStatus = await findPosts({
						masto,
						clientServer,
						status,
					});

					if (!mastodonStatus) return false;

					// 글을 볼 수 있는 상태임

					// 공개 위치 요청 중이면 볼 수 있는 글은 다 보임
					if (isPublic) return true;

					// 공개 위치 요청 중이 아닌 경우

					// 팔로우 중인 사람의 글만 보임
					try {
						const author = await masto.v1.accounts.fetch(
							mastodonStatus.account.id
						);

						try {
							await masto.v1.accounts.verifyCredentials();

							try {
								const [{ following }] =
									await masto.v1.accounts.fetchRelationships([author.id]);

								if (following) return true;
							} catch {
								return false;
							}

							return false;
						} catch {
							return false;
						}
					} catch {
						return false;
					}
				} else {
					// 로그인 상태가 아니면 리모트 글은 볼 수 없음
					if (status.server !== "mastodon.social") return false;

					// 로그인 상태가 아닌 경우 mastodon.social 사용
					const mastodonSocial = createClient({
						url: "https://mastodon.social",
					});

					if (!mastodonSocial) return false;

					try {
						await mastodonSocial.v1.statuses.fetch(status.mastodonId);
						return true;
					} catch {
						return false;
					}
				}
			})
		);

		const localViewableStatuses = statuses.filter(
			(_, index) => isLocalViewable[index]
		);

		const leaveOutServerHandle = localViewableStatuses.map((status) => ({
			id: status.id,
			mastodonId: status.mastodonId,
		}));

		const nextMaxId =
			statuses.length === 0 ? null : statuses[statuses.length - 1].id;

		return NextResponse.json<StatusesResponse>({
			ok: true,
			localViewableStatuses: leaveOutServerHandle,
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
	const { text, location, visibility, exact } = json;
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

	const supportedServers = [
		"planet.moe",
		"qdon.space",
		"mustard.blog",
		"pointless.chat",
		"uri.life",
		"duk.space",
	];

	if (!supportedServers.includes(clientServer)) {
		return NextResponse.json<NewStatusResponse>(
			{
				ok: false,
				error: "BETA_LIMITED_SERVER_ERROR",
				supportedServers,
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

		const texts = [
			text,
			process.env.NODE_ENV === "production"
				? `${process.env.NEXT_PUBLIC_BASE_URL}/post/${status.id}`
				: "[Mastoplace 주소]",
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
