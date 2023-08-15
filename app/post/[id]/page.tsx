"use client";

import { NearbyStatusesResponse } from "@/app/api/post/[id]/nearby/route";
import { LogInOrPublic } from "@/components/Auth/LogInOrPublic";
import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { PostBlock } from "@/components/PostBlock";
import { PostLoadingList } from "@/components/PostBlock/PostLoadingList";
import { UnavailablePostBlock } from "@/components/PostBlock/UnavailablePostBlock";
import { useToken } from "@/libs/client/useToken";
import { Globe2, Newspaper } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import useSWR from "swr";
import { parseURL } from "ufo";

interface StatusParams {
	params: {
		id?: string;
	};
}

export default function Post({ params }: StatusParams) {
	const { data, isLoading } = useSWR<NearbyStatusesResponse>(
		params.id ? `/api/post/${params.id}/nearby` : null
	);

	const { hasValidToken, isLoading: isTokenLoading } = useToken();

	const { t } = useTranslation();

	return (
		<Layout
			showBackButton={isTokenLoading || isLoading ? true : hasValidToken}
			showTabBar
			showBackground={isTokenLoading || isLoading ? true : hasValidToken}
		>
			{!isTokenLoading && !hasValidToken && (
				<div className="flex flex-col gap-8 sm:w-96 w-3/4 items-center mx-auto mt-24 break-keep">
					<div className="flex flex-col gap-2">
						<p className="text-xl font-medium text-slate-800 dark:text-zinc-200 text-center">
							{t("post.log-in-to-see.title")}
						</p>
						<p className="text-center font-medium text-slate-500 dark:text-zinc-500 text-sm">
							{t("post.log-in-to-see.description")}
						</p>
					</div>
					<LogInOrPublic
						redirectAfterAuth={parseURL(location.href).pathname}
						buttonText={t("post.log-in-and-see")}
					/>
				</div>
			)}
			{(!params.id || (data && data.ok) === false) && null}
			{params.id && (
				<div className="flex flex-col gap-4">
					<div className="px-4 py-4 empty:hidden">
						<PostBlock id={params.id} />
					</div>
					<div className="empty:hidden">
						{(isLoading || (data && data.ok !== false)) && (
							<>
								<hr className="border-slate-200 dark:border-zinc-800" />
								<div className="text-slate-800 dark:text-zinc-200 text-lg font-medium text-center pt-6 pb-2">
									{t("post.posts-nearby.title")}
								</div>
							</>
						)}
						{isLoading && <PostLoadingList dividerPadding />}
						{data && data.ok && !data.nearbyInfo && (
							<div className="my-3 text-slate-500 dark:text-zinc-500 text-sm font-medium text-center">
								{t("post.posts-nearby.no-location")}
							</div>
						)}
						{data &&
							data.ok &&
							data.nearbyInfo &&
							data.nearbyInfo.nearbyIds.length === 0 && (
								<div className="my-3 text-slate-500 dark:text-zinc-500 text-sm font-medium text-center">
									{t("post.posts-nearby.no-post")}
								</div>
							)}
						{data &&
							data.ok &&
							data.nearbyInfo &&
							data.nearbyInfo.nearbyIds.length !== 0 && (
								<ol className="divide-y divide-slate-200 dark:divide-zinc-800 px-4">
									{data.nearbyInfo.nearbyIds.map((nearbyId) => (
										<li className="py-4 empty:hidden" key={nearbyId}>
											<PostBlock
												id={nearbyId}
												from={data.nearbyInfo?.originalLocation}
												link
											/>
										</li>
									))}
								</ol>
							)}
					</div>
				</div>
			)}
			{!isTokenLoading && hasValidToken && params.id && data && !data.ok && (
				<div className="flex flex-col gap-6 px-4 mt-12 mx-auto text-center w-3/4 sm:w-96">
					<UnavailablePostBlock />
					<div className="flex flex-col gap-2">
						<Button
							text={t("action.go-home")}
							href="/home"
							isPrimary
							isLoading={false}
							Icon={Newspaper}
						/>
						<Button
							text={t("action.browse-public-posts")}
							href="/public"
							Icon={Globe2}
							isLoading={false}
						/>
					</div>
				</div>
			)}
		</Layout>
	);
}
