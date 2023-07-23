import { StatusResponse } from "@/app/api/status/[id]/route";
import { GoogleMaps } from "@/components/GoogleMaps";
import { Content } from "@/components/StatusBlock/Content";
import { Privacy } from "@/components/StatusBlock/Privacy";
import { StatusButtons } from "@/components/StatusBlock/StatusButtons";
import { getCenter, getDistance } from "geolib";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useSWR from "swr";

interface Position {
	latitudeFrom: number;
	latitudeTo: number;
	longitudeFrom: number;
	longitudeTo: number;
}

interface StatusBlockProps {
	id: string | null;
	link?: boolean;
	from?: Position;
}

export function StatusBlock({ id, link, from }: StatusBlockProps) {
	const { data } = useSWR<StatusResponse>(id ? `/api/status/${id}` : null);

	const mastodonStatus = data?.mastodonStatus;
	const exact = data?.exact;
	const location = data?.location;
	const server = data?.server;

	const position =
		location &&
		getCenter([
			{ latitude: location.latitudeFrom, longitude: location.longitudeFrom },
			{ latitude: location.latitudeTo, longitude: location.longitudeTo },
			{ latitude: location.latitudeFrom, longitude: location.longitudeTo },
			{ latitude: location.latitudeTo, longitude: location.longitudeFrom },
		]);

	const fromPosition =
		from &&
		getCenter([
			{ latitude: from.latitudeFrom, longitude: from.longitudeFrom },
			{ latitude: from.latitudeTo, longitude: from.longitudeTo },
			{ latitude: from.latitudeFrom, longitude: from.longitudeTo },
			{ latitude: from.latitudeTo, longitude: from.longitudeFrom },
		]);

	const distance =
		position && fromPosition && getDistance(position, fromPosition);

	const readableDistance =
		distance !== undefined &&
		distance !== null &&
		distance !== false &&
		` | 이 글에서 ${new Intl.NumberFormat("ko-KR").format(distance)}m`;

	console.log(mastodonStatus);

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
						<Content mastodonStatus={mastodonStatus} />
					</Link>
				) : (
					<Content mastodonStatus={mastodonStatus} />
				)}
				{mastodonStatus && position && (
					<GoogleMaps
						position={position}
						className="h-48 rounded-md mt-3"
						fixed
					/>
				)}
				{mastodonStatus && (
					<div className="flex gap-1 text-sm flex-wrap text-slate-500 justify-between items-center mt-2">
						<span className="mr-2">
							{mastodonStatus.createdAt}
							{exact === true && " | 정확한 위치"}
							{exact === false && " | 대략적인 위치"}
							{readableDistance}
						</span>
						<Privacy privacy={mastodonStatus.visibility} />
					</div>
				)}
				{mastodonStatus && mastodonStatus.url && (
					<StatusButtons original={mastodonStatus.url} />
				)}
			</div>
		</div>
	);
}
