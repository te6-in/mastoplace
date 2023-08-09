import { Status } from "@prisma/client";
import { mastodon } from "masto";

interface FindPostsParams {
	masto: mastodon.Client;
	clientServer: string;
	status: Pick<Status, "id" | "mastodonId" | "server" | "handle">;
}

export async function findPosts({
	masto,
	clientServer,
	status,
}: FindPostsParams) {
	if (!status.mastodonId) return null;

	if (clientServer === status.server) {
		try {
			const fetchedStatus = await masto.v1.statuses.fetch(status.mastodonId);
			return fetchedStatus;
		} catch {
			return null;
		}
	}

	try {
		const search = await masto.v2.search({
			q: `https://${status.server}/@${status.handle}/${status.mastodonId}`,
			resolve: true,
			type: "statuses",
		});

		if (!search.statuses[0]) return null;

		return search.statuses[0];
	} catch {
		return null;
	}
}
