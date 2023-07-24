import { client } from "@/libs/server/client";
import { findStatus } from "@/libs/server/findStatus";
import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { Status } from "@prisma/client";
import { createClient } from "masto";
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
	const isPublic = searchParams.get("public") === "true";

	const data = await mastodonClient(request.cookies);

	if (!isPublic && !data) {
		return NextResponse.json<StatusesResponse>({ ok: false }, { status: 401 });
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

					const mastodonStatus = await findStatus({
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
					const author = await masto.v1.accounts.fetch(
						mastodonStatus.account.id
					);
					if (!author) return false;

					const me = await masto.v1.accounts.verifyCredentials();
					if (!me) return false;

					const [{ following }] = await masto.v1.accounts.fetchRelationships([
						author.id,
					]);

					if (following) return true;

					return false;
				} else {
					// 로그인 상태가 아니면 리모트 글은 볼 수 없음
					if (status.server !== "mastodon.social") return false;

					// 로그인 상태가 아닌 경우 mastodon.social 사용
					const mastodonSocial = createClient({
						url: "https://mastodon.social",
					});

					if (!mastodonSocial) return false;

					const mastodonStatus = await mastodonSocial.v1.statuses.fetch(
						status.mastodonId
					);

					// 글을 볼 수 있는 상태임
					if (mastodonStatus) return true;

					return false;
				}
			})
		);

		const localViewableStatuses = statuses.filter(
			(_, index) => isLocalViewable[index]
		);

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
