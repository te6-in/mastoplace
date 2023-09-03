import { PigeonMap } from "@/components/PigeonMap";
import { Content } from "@/components/PostBlock/Content";
import { DateTime } from "@/components/PostBlock/DateTime";
import { PostButtons } from "@/components/PostBlock/PostButtons";
import { Visibility } from "@/components/PostBlock/Visibility";
import { j } from "@/libs/client/utils";
import { getCenter, getDistance } from "geolib";
import { mastodon } from "masto";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Position {
	latitudeFrom: number;
	latitudeTo: number;
	longitudeFrom: number;
	longitudeTo: number;
}

export type PostBlockLocation = {
	exact: boolean;
	latitudeFrom: number;
	latitudeTo: number;
	longitudeFrom: number;
	longitudeTo: number;
};

export interface PostBlockPost {
	databaseId: string;
	mastodonStatus: {
		uri: string;
		avatar: string;
		displayName: string;
		acct: string;
		content: string;
		createdAt: string;
		visibility: mastodon.v1.StatusVisibility;
	};
	location: PostBlockLocation | null;
}

interface PostBlockProps {
	post: PostBlockPost;
	clientServer: string;
	clientHandle: string;
	link?: boolean;
	from?: Position;
	preventInteraction?: boolean;
}

export function PostBlock({
	post,
	clientServer,
	clientHandle,
	link,
	from,
	preventInteraction,
}: PostBlockProps) {
	const { t } = useTranslation();

	const position =
		post.location &&
		getCenter([
			{
				latitude: post.location.latitudeFrom,
				longitude: post.location.longitudeFrom,
			},
			{
				latitude: post.location.latitudeTo,
				longitude: post.location.longitudeTo,
			},
			{
				latitude: post.location.latitudeFrom,
				longitude: post.location.longitudeTo,
			},
			{
				latitude: post.location.latitudeTo,
				longitude: post.location.longitudeFrom,
			},
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
			<Link
				href={`https://${clientServer}/@${post.mastodonStatus.acct}`}
				rel="noopener noreferrer"
				target="_blank"
				className="not-italic w-12 h-12 rounded-full overflow-hidden"
			>
				<address>
					<img
						src={post.mastodonStatus.avatar}
						alt={t("accessibility.alt.profile-picture.of", {
							name: post.mastodonStatus.displayName,
						})}
					/>
				</address>
			</Link>
			<div className="flex flex-col flex-1 gap-1">
				<Link
					href={`https://${clientServer}/@${post.mastodonStatus.acct}`}
					rel="noopener noreferrer"
					target="_blank"
				>
					<address className="flex items-baseline not-italic flex-wrap">
						<span className="text-slate-900 dark:text-zinc-100 font-medium text-lg mr-1">
							{post.mastodonStatus.displayName}
						</span>
						<span className="text-slate-500 dark:text-zinc-500">
							@{post.mastodonStatus.acct}
						</span>
					</address>
				</Link>
				<Content
					mastodonStatusContent={post.mastodonStatus.content}
					clientServer={clientServer}
					link={link}
					id={post.databaseId}
				/>
				{position && (
					<PigeonMap
						position={position}
						className="h-48 rounded-md mt-3"
						fixed
						exact={post.location?.exact ?? false}
					/>
				)}
				{post.mastodonStatus && (
					<div className="flex gap-1 text-sm flex-wrap text-slate-500 dark:text-zinc-500 justify-between items-center mt-2">
						<span className="mr-2">
							<DateTime dateTime={post.mastodonStatus.createdAt} />
							{post.location?.exact === true &&
								` | ${t("post.location.exact")}`}
							{post.location?.exact === false &&
								` | ${t("post.location.approximate")}`}
							{readableDistance}
						</span>
						<Visibility visibility={post.mastodonStatus.visibility} />
					</div>
				)}
				{!preventInteraction &&
					post.mastodonStatus &&
					post.mastodonStatus.uri && (
						<PostButtons
							original={post.mastodonStatus.uri}
							id={post.databaseId}
							fromMe={post.mastodonStatus.acct === clientHandle}
							clientHandle={clientHandle}
							clientServer={clientServer}
							postBlock={post}
						/>
					)}
			</div>
		</div>
	);
}

export function PostBlockLoading() {
	return (
		<div className="flex gap-2">
			<div className="not-italic w-12 h-12 rounded-full overflow-hidden">
				<Skeleton circle className="w-full h-full" />
			</div>
			<div className="flex flex-col flex-1 gap-1">
				<span className="text-slate-900 dark:text-zinc-100 font-medium text-lg mr-1">
					<Skeleton width="20%" />
				</span>
				<Skeleton count={3} className="w-full" />
			</div>
		</div>
	);
}
