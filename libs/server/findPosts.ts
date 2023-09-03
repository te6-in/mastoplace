import { Status } from "@prisma/client";
import { mastodon } from "masto";

interface FindPostsParams {
	masto: mastodon.Client;
	clientServer: string;
	clientHandle: string;
	status: Pick<Status, "id" | "mastodonId" | "server" | "handle">;
	option: "onlyFollowingOrMine" | "onlyNotFollowing" | "whatever";
}

export async function findPosts({
	masto,
	clientServer,
	clientHandle,
	status,
	option,
}: FindPostsParams) {
	if (!status.mastodonId) return null;

	if (clientServer === status.server) {
		try {
			const fetchedStatus = await masto.v1.statuses.fetch(status.mastodonId);

			const author = await masto.v1.accounts.fetch(fetchedStatus.account.id);

			const [{ following }] = await masto.v1.accounts.fetchRelationships([
				author.id,
			]);

			switch (option) {
				case "onlyFollowingOrMine":
					if (following || author.acct === clientHandle) {
						return fetchedStatus;
					}
					break;
				case "onlyNotFollowing":
					if (!following) {
						return fetchedStatus;
					}
					break;
				case "whatever":
					return fetchedStatus;
			}

			return null;
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

		const fetchedStatus = search.statuses[0];

		if (!fetchedStatus) return null;

		const author = await masto.v1.accounts.fetch(fetchedStatus.account.id);

		const [{ following }] = await masto.v1.accounts.fetchRelationships([
			author.id,
		]);

		switch (option) {
			case "onlyFollowingOrMine":
				if (following || author.acct === clientHandle) {
					return fetchedStatus;
				}
				break;
			case "onlyNotFollowing":
				if (!following) {
					return fetchedStatus;
				}
				break;
			case "whatever":
				return fetchedStatus;
		}

		return null;
	} catch {
		return null;
	}
}
