import { StatusResponse } from "@/app/api/status/[id]/route";
import { GoogleMaps } from "@/components/GoogleMaps";
import { Privacy } from "@/components/StatusBlock/Privacy";
import { StatusButtons } from "@/components/StatusBlock/StatusButtons";
import parse from "html-react-parser";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useSWR from "swr";

interface StatusBlockProps {
	id: string | null;
	link?: boolean;
}

export function StatusBlock({ id, link }: StatusBlockProps) {
	const { data } = useSWR<StatusResponse>(id ? `/api/status/${id}` : null);

	const mastodonStatus = data?.mastodonStatus;
	const location = data?.location;
	const server = data?.server;

	return (
		<div className="flex gap-2">
			{mastodonStatus ? (
				<Link href={`https://${server}/@${mastodonStatus.account.acct}`}>
					<address className="not-italic w-12 h-12 rounded-full overflow-hidden">
						<img
							src={mastodonStatus?.account.avatar}
							alt={`${mastodonStatus?.account.displayName} 사용자의 프로필 사진`}
						/>
					</address>
				</Link>
			) : (
				<div className="w-12 h-12">
					<Skeleton className="w-full h-full" circle />
				</div>
			)}
			<div className="flex flex-col flex-1 gap-1">
				{mastodonStatus && server && (
					<Link href={`https://${server}/@${mastodonStatus.account.acct}`}>
						<address className="flex items-baseline not-italic flex-wrap">
							<span className="text-slate-900 font-medium text-lg mr-1">
								{mastodonStatus.account.displayName ?? <Skeleton width="20%" />}
							</span>
							<span className="text-slate-500">
								@{mastodonStatus.account.acct}
							</span>
						</address>
					</Link>
				)}
				{link ? (
					<Link href={`/status/${id}`}>
						<article className="text-slate-700">
							{mastodonStatus ? (
								parse(mastodonStatus.content)
							) : (
								<Skeleton count={3} />
							)}
						</article>
					</Link>
				) : (
					<article className="text-slate-700">
						{mastodonStatus ? (
							parse(mastodonStatus.content)
						) : (
							<Skeleton count={3} />
						)}
					</article>
				)}
				{mastodonStatus && location && (
					<GoogleMaps
						position={{
							latitude: (location.latitudeFrom + location.latitudeTo) / 2,
							longitude: (location.longitudeFrom + location.longitudeTo) / 2,
						}}
						className="h-48 rounded-md mt-3"
						fixed
					/>
				)}
				{mastodonStatus && (
					<div className="flex gap-1 text-sm flex-wrap text-slate-500 justify-between items-center mt-2">
						<span className="mr-2">{mastodonStatus.createdAt}</span>
						<Privacy privacy={mastodonStatus.visibility} />
					</div>
				)}
				{mastodonStatus && <StatusButtons />}
			</div>
		</div>
	);
}
