"use client";

import { StatusesResponse } from "@/app/api/post/route";
import { MyInfoResponse } from "@/app/api/profile/me/route";
import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { FloatingButton } from "@/components/Layout/FloatingButton";
import { PostBlock, PostBlockLoading } from "@/components/PostBlock";
import { EndIndicator } from "@/components/PostBlock/EndIndicator";
import { PostLoadingList } from "@/components/PostBlock/PostLoadingList";
import { Pencil } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

export default function Public() {
	const { t } = useTranslation();
	const getKey = (pageIndex: number, previousPageData: StatusesResponse) => {
		if (pageIndex === 0 || !previousPageData || !previousPageData.ok)
			return "/api/post?discover=true";
		if (!previousPageData.nextMaxId) return null;

		return `/api/post?discover=true&max_id=${previousPageData.nextMaxId}`;
	};

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
			title={t("tabbar.discover")}
			showBackground={isMeLoading || isLoading || !meData ? true : meData.ok}
			showTabBar
			hasFloatingButton
		>
			{(isMeLoading || isLoading) && <PostLoadingList />}
			{!isLoading && data && length === 0 && (
				<div className="text-center px-4 flex gap-8 flex-col text-slate-800 dark:text-zinc-200 text-lg mt-12 font-medium break-keep">
					<p>{t("discover.no-post")}</p>
					<Button
						text={t("action.new-post.first")}
						href="/post/new"
						Icon={Pencil}
						isLoading={false}
						isPrimary
						event="public-empty-new-post"
					/>
				</div>
			)}
			{!isLoading && data && length !== undefined && length > 0 && (
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
											clientServer={
												meData && meData.ok ? meData.server : "mastodon.social"
											}
											clientHandle={meData && meData.ok ? meData.handle : ""}
										/>
									</li>
								));
							})}
					</ol>
				</InfiniteScroll>
			)}
			{data && length !== 0 && !hasMore && <EndIndicator hasFloatingButton />}
			{(isLoading || (data && length !== 0)) && (
				<FloatingButton
					Icon={Pencil}
					text={t("action.new-post.default")}
					href="/post/new"
				/>
			)}
		</Layout>
	);
}
