"use client";

import { StatusesResponse } from "@/app/api/post/route";
import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { FloatingButton } from "@/components/Layout/FloatingButton";
import { PostBlock } from "@/components/PostBlock";
import { EndIndicator } from "@/components/PostBlock/EndIndicator";
import { PostLoadingList } from "@/components/PostBlock/PostLoadingList";
import { useToken } from "@/libs/client/useToken";
import { Pencil } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useSWRInfinite from "swr/infinite";

export default function Public() {
	const { t } = useTranslation();
	const getKey = (pageIndex: number, previousPageData: StatusesResponse) => {
		if (pageIndex === 0 || !previousPageData.ok) return "/api/post?public=true";
		if (!previousPageData.nextMaxId) return null;

		return `/api/post?public=true&max_id=${previousPageData.nextMaxId}`;
	};

	const { isLoading: isTokenLoading } = useToken();

	const { data, size, setSize, isLoading } = useSWRInfinite<StatusesResponse>(
		getKey,
		null
	);

	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		if (!data) return;

		const lastData = data[data.length - 1];

		if (lastData.ok && lastData.nextMaxId === null) {
			setHasMore(false);
		}
	}, [data]);

	const length = data?.reduce((acc, page) => {
		if (!page.ok || !page.localViewableStatuses) return 0;
		return acc + page.localViewableStatuses.length;
	}, 0);

	useEffect(() => {
		if (!isLoading) {
			setSize(size + 1);
		}
	}, [isLoading]);

	return (
		<Layout
			title={t("tabbar.public")}
			showBackground
			showTabBar
			hasFloatingButton
		>
			{(isTokenLoading || isLoading) && <PostLoadingList />}
			{!isLoading && data && length === 0 && (
				<div className="text-center px-4 flex gap-8 flex-col text-slate-800 dark:text-zinc-200 text-lg mt-12 font-medium break-keep">
					<p>{t("public.no-post")}</p>
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
							<PostBlock id={null} />
						</div>
					}
				>
					<ol className="divide-y divide-slate-200 dark:divide-zinc-800">
						{data &&
							data.map((page) => {
								if (!page.ok || !page.localViewableStatuses) return null;

								return page.localViewableStatuses.map((status) => (
									<li key={status.id} className="p-4 empty:hidden">
										<PostBlock id={status.id} link />
									</li>
								));
							})}
					</ol>
				</InfiniteScroll>
			)}
			{data && length !== 0 && !hasMore && <EndIndicator hasFloatingButton />}
			{data && length !== 0 && (
				<FloatingButton
					Icon={Pencil}
					text={t("action.new-post.default")}
					href="/post/new"
				/>
			)}
		</Layout>
	);
}
