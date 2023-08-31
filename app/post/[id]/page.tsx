"use client";

import { StatusResponse } from "@/app/api/post/[id]/route";
import { MyInfoResponse } from "@/app/api/profile/me/route";
import { LogInOrPublic } from "@/components/Auth/LogInOrPublic";
import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { PostBlock, PostBlockLoading } from "@/components/PostBlock";
import { PostLoadingList } from "@/components/PostBlock/PostLoadingList";
import { UnavailablePostBlock } from "@/components/PostBlock/UnavailablePostBlock";
import { Globe2, Newspaper } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { parseURL } from "ufo";

interface StatusParams {
	params: {
		id?: string;
	};
}

export default function Post({ params }: StatusParams) {
	const { data, isLoading } = useSWR<StatusResponse>(
		params.id ? `/api/post/${params.id}` : null
	);

	const { data: meData, isLoading: isMeLoading } =
		useSWR<MyInfoResponse>("/api/profile/me");

	const router = useRouter();

	const { t } = useTranslation();

	useEffect(() => {
		if (!params.id) {
			router.push("/home");
		}
	}, [params.id, router]);

	if (!params.id) return null;

	return (
		<Layout
			showBackButton={isMeLoading || isLoading ? true : meData?.ok}
			showTabBar
			showBackground={isMeLoading || isLoading ? true : meData?.ok}
		>
			{!isMeLoading && meData && !meData.ok && (
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
			{meData && meData.ok && (
				<div className="flex flex-col gap-4">
					<div className="px-4 py-4">
						{isLoading && <PostBlockLoading />}
						{!isLoading && data && !data.ok && (
							<div className="flex flex-col gap-6 px-4 mt-12 mx-auto text-center w-3/4 sm:w-96">
								<UnavailablePostBlock />
								<div className="flex flex-col gap-2">
									<Button
										text={t("action.go-home")}
										href="/home"
										isPrimary
										isLoading={false}
										Icon={Newspaper}
										event="post-unavailable-go-home"
									/>
									<Button
										text={t("action.browse-public-posts")}
										href="/public"
										Icon={Globe2}
										isLoading={false}
										event="post-unavailable-browse-public-posts"
									/>
								</div>
							</div>
						)}
						{!isLoading && data && data.ok && (
							<PostBlock
								post={data}
								clientServer={meData.server}
								clientHandle={meData.handle}
							/>
						)}
					</div>
					<div>
						{(isLoading || (data && data.ok)) && (
							<>
								<hr className="border-slate-200 dark:border-zinc-800" />
								<div className="text-slate-800 dark:text-zinc-200 text-lg font-medium text-center pt-6 pb-2">
									{t("post.posts-nearby.title")}
								</div>
							</>
						)}
						{isLoading && <PostLoadingList dividerPadding />}
						{!isLoading && data && data.ok && !data.location && (
							<div className="my-3 text-slate-500 dark:text-zinc-500 text-sm font-medium text-center">
								{t("post.posts-nearby.no-location")}
							</div>
						)}
						{!isLoading &&
							data &&
							data.ok &&
							data.location &&
							data.nearbyPosts &&
							data.nearbyPosts.length === 0 && (
								<div className="my-3 text-slate-500 dark:text-zinc-500 text-sm font-medium text-center">
									{t("post.posts-nearby.no-post")}
								</div>
							)}
						{!isLoading &&
							meData &&
							meData.ok &&
							data &&
							data.ok &&
							data.location &&
							data.nearbyPosts &&
							data.nearbyPosts.length !== 0 && (
								<ol className="divide-y divide-slate-200 dark:divide-zinc-800 px-4">
									{data.nearbyPosts.map((nearbyPost) => (
										<li
											className="py-4 empty:hidden"
											key={nearbyPost.databaseId}
										>
											<PostBlock
												link
												post={nearbyPost}
												clientServer={meData.server}
												clientHandle={meData.handle}
											/>
										</li>
									))}
								</ol>
							)}
					</div>
				</div>
			)}
		</Layout>
	);
}
