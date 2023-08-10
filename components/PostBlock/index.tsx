import { StatusResponse } from "@/app/api/post/[id]/route";
import { PigeonMap } from "@/components/PigeonMap";
import { Content } from "@/components/PostBlock/Content";
import { DateTime } from "@/components/PostBlock/DateTime";
import { PostButtons } from "@/components/PostBlock/PostButtons";
import { UnavailablePostBlock } from "@/components/PostBlock/UnavailablePostBlock";
import { Visibility } from "@/components/PostBlock/Visibility";
import { j } from "@/libs/client/utils";
import { getCenter, getDistance } from "geolib";
import useTranslation from "next-translate/useTranslation";
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

interface PostBlockProps {
	id: string | null;
	link?: boolean;
	from?: Position;
	showError?: boolean;
	preventInteraction?: boolean;
}

export function PostBlock({
	id,
	link,
	from,
	showError,
	preventInteraction,
}: PostBlockProps) {
	const { data } = useSWR<StatusResponse>(id ? `/api/post/${id}` : null);
	const { t } = useTranslation();

	if (data?.ok === false) {
		if (!showError) return null;

		return <UnavailablePostBlock />;
	}

	const mastodonStatus = data?.mastodonStatus;
	const exact = data?.exact;
	const location = data?.location;
	const clientServer = data?.clientServer;

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
		` | ${t("post.location.distance", { distance })}`;

	return (
		<div
			className={j(
				"flex gap-2",
				preventInteraction ? "pointer-events-none" : ""
			)}
		>
			{mastodonStatus ? (
				<Link
					href={`https://${clientServer}/@${mastodonStatus.account.acct}`}
					rel="noopener noreferrer"
					target="_blank"
					className="not-italic w-12 h-12 rounded-full overflow-hidden"
				>
					<address>
						<img
							src={mastodonStatus?.account.avatar}
							alt={t("accessibility.alt.profile-picture.of", {
								name: mastodonStatus?.account.displayName,
							})}
						/>
					</address>
				</Link>
			) : (
				<div className="w-12 h-12">
					<Skeleton className="w-full h-full" circle />
				</div>
			)}
			<div className="flex flex-col flex-1 gap-1">
				{mastodonStatus && clientServer ? (
					<Link
						href={`https://${clientServer}/@${mastodonStatus.account.acct}`}
						rel="noopener noreferrer"
						target="_blank"
					>
						<address className="flex items-baseline not-italic flex-wrap">
							<span className="text-slate-900 dark:text-zinc-100 font-medium text-lg mr-1">
								{mastodonStatus.account.displayName ?? <Skeleton width="20%" />}
							</span>
							<span className="text-slate-500 dark:text-zinc-500">
								@{mastodonStatus.account.acct}
							</span>
						</address>
					</Link>
				) : (
					<Skeleton width="25%" className="text-lg" />
				)}
				<Content
					mastodonStatus={mastodonStatus}
					clientServer={clientServer}
					link={link}
					id={id}
				/>
				{mastodonStatus && position && (
					<PigeonMap
						position={position}
						className="h-48 rounded-md mt-3"
						fixed
						exact={exact ?? false}
					/>
				)}
				{mastodonStatus && (
					<div className="flex gap-1 text-sm flex-wrap text-slate-500 dark:text-zinc-500 justify-between items-center mt-2">
						<span className="mr-2">
							<DateTime dateTime={mastodonStatus.createdAt} />
							{exact === true && ` | ${t("post.location.exact")}`}
							{exact === false && ` | ${t("post.location.approximate")}`}
							{readableDistance}
						</span>
						<Visibility visibility={mastodonStatus.visibility} />
					</div>
				)}
				{!preventInteraction && mastodonStatus && mastodonStatus.url && (
					<PostButtons
						original={mastodonStatus.url}
						id={id}
						fromMe={mastodonStatus.account.acct === data.clientHandle}
					/>
				)}
			</div>
		</div>
	);
}
