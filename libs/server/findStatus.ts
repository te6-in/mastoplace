import { Status } from "@prisma/client";
import { mastodon } from "masto";

interface FindStatusParams {
	masto: mastodon.Client;
	clientServer: string;
	status: Pick<Status, "id" | "mastodonId" | "server" | "handle">;
}

export async function findStatus({
	masto,
	clientServer,
	status,
}: FindStatusParams) {
	if (!status.mastodonId) return null;

	if (clientServer === status.server) {
		const fetchedStatus = await masto.v1.statuses.fetch(status.mastodonId);

		if (!fetchedStatus) return null;

		return fetchedStatus;
	}

	const search = await masto.v2.search({
		q: `https://${status.server}/@${status.handle}/${status.mastodonId}`,
		resolve: true,
		type: "statuses",
	});

	if (!search.statuses[0]) return null;

	return search.statuses[0];
}