"use client";

import { StatusesResponse } from "@/app/api/post/route";
import { MyInfoResponse } from "@/app/api/profile/me/route";
import { LogInOrPublic } from "@/components/Auth/LogInOrPublic";
import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { FloatingButton } from "@/components/Layout/FloatingButton";
import { Logo } from "@/components/Logo";
import { PostBlock, PostBlockLoading } from "@/components/PostBlock";
import { EndIndicator } from "@/components/PostBlock/EndIndicator";
import { PostLoadingList } from "@/components/PostBlock/PostLoadingList";
import { Globe2, Pencil } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

export default function Home() {
	const getKey = (pageIndex: number, previousPageData: StatusesResponse) => {
		if (pageIndex === 0 || !previousPageData || !previousPageData.ok)
			return "/api/post";
		if (!previousPageData.nextMaxId) return null;

		return `/api/post?max_id=${previousPageData.nextMaxId}`;
	};

	const { t } = useTranslation();

	const { data, size, setSize, isLoading } = useSWRInfinite<StatusesResponse>(
		getKey,
		null
	);

	const { data: meData, isLoading: isMeLoading } =
		useSWR<MyInfoResponse>("/api/profile/me");

	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		if (!data) return;

		const lastData = data[data.length - 1];

		if (lastData && lastData.ok && lastData.nextMaxId === null) {
			setHasMore(false);
		}
	}, [data]);

	const length = data?.reduce((acc, page) => {
		if (!page || !page.ok) return 0;
		return acc + page.statuses.length;
	}, 0);

	useEffect(() => {
		if (!isLoading) {
			setSize(size + 1);
		}
	}, [isLoading]);

	return (
		<Layout
			title="Mastoplace"
			showBackground={isMeLoading || isLoading || !meData ? true : meData.ok}
			showTabBar
			hasFloatingButton
		>
			{(isMeLoading || isLoading) && <PostLoadingList />}
			{!isMeLoading && meData && !meData.ok && (
				<div className="text-center px-4 flex gap-8 items-center flex-col text-slate-800 dark:text-zinc-200 text-lg mt-24 font-medium break-keep">
					<Logo />
					<p>{t("home.log-in-to-see")}</p>
					<div className="sm:w-96 w-3/4">
						<LogInOrPublic redirectAfterAuth="/home" />
					</div>
				</div>
			)}
			{!isMeLoading && meData && meData.ok && data && length === 0 && (
				<div className="text-center px-4 flex gap-8 flex-col text-slate-800 dark:text-zinc-200 text-lg mt-12 font-medium break-keep">
					<p>{t("home.no-post")}</p>
					<div className="flex flex-col gap-2">
						<Button
							text={t("action.new-post.first")}
							href="/post/new"
							Icon={Pencil}
							isLoading={false}
							isPrimary
							event="home-empty-new-post"
						/>
						<Button
							text={t("action.browse-public-posts")}
							href="/public"
							Icon={Globe2}
							isLoading={false}
							event="home-empty-browse-public-posts"
						/>
					</div>
				</div>
			)}
			{!isMeLoading &&
				meData &&
				meData.ok &&
				data &&
				length !== undefined &&
				length > 0 && (
					<InfiniteScroll
						dataLength={length}
						next={() => setSize(size + 1)}
						hasMore={hasMore}
						loader={
							<div className="p-4 border-t border-slate-200 dark:border-zinc-800">
								<PostBlockLoading />
							</div>
						}
					>
						<ol className="divide-y divide-slate-200 dark:divide-zinc-800">
							{data &&
								data.map((page) => {
									if (!page.ok) return null;

									return page.statuses.map((status) => (
										<li key={status.databaseId} className="p-4 empty:hidden">
											<PostBlock
												link
												post={status}
												clientServer={meData.server}
												clientHandle={meData.handle}
											/>
										</li>
									));
								})}
						</ol>
					</InfiniteScroll>
				)}
			{!isMeLoading &&
				meData &&
				meData.ok &&
				data &&
				length !== undefined &&
				length > 0 &&
				!hasMore && <EndIndicator hasFloatingButton />}
			{!isMeLoading &&
				meData &&
				meData.ok &&
				(isLoading || (data && length !== undefined && length > 0)) && (
					<FloatingButton
						Icon={Pencil}
						text={t("action.new-post.default")}
						href="/post/new"
					/>
				)}
		</Layout>
	);
}
