import { DefaultResponse } from "@/libs/server/response";
import { mastodonClient } from "@/libs/server/session";
import { mastodon } from "masto";
import { NextRequest, NextResponse } from "next/server";

export interface MyInfoResponse extends DefaultResponse {
	me?: {
		handle: string;
		server: string;
		serverName: string;
		displayName: string;
		avatar: string;
		defaultPrivacy: mastodon.v1.StatusVisibility;
	};
}

export async function GET(request: NextRequest) {
	const data = await mastodonClient(request.cookies);

	if (!data) {
		return NextResponse.json<MyInfoResponse>({ ok: false }, { status: 401 });
	}

	const { masto, clientServer, handle } = data;

	if (!masto) {
		return NextResponse.json<MyInfoResponse>({ ok: false }, { status: 401 });
	}

	try {
		const account = await masto.v1.accounts.verifyCredentials();

		try {
			const server = await masto.v1.instances.fetch();

			return NextResponse.json<MyInfoResponse>({
				ok: true,
				me: {
					handle,
					server: clientServer,
					serverName: server.title,
					displayName: account.displayName,
					avatar: account.avatar,
					defaultPrivacy: account.source?.privacy ?? "unlisted",
				},
			});
		} catch {
			return NextResponse.json<MyInfoResponse>({ ok: false }, { status: 401 });
		}
	} catch {
		return NextResponse.json<MyInfoResponse>({ ok: false }, { status: 401 });
	}
}
