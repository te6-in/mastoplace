"use client";

import { StatusesResponse } from "@/app/api/post/route";
import { LogInOrPublic } from "@/components/Auth/LogInOrPublic";
import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { FloatingButton } from "@/components/Layout/FloatingButton";
import { Logo } from "@/components/Logo";
import { PostBlock } from "@/components/PostBlock";
import { EndIndicator } from "@/components/PostBlock/EndIndicator";
import { PostLoadingList } from "@/components/PostBlock/PostLoadingList";
import { useToken } from "@/libs/client/useToken";
import { Globe2, Pencil } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useSWRInfinite from "swr/infinite";

export default function Home() {
	const getKey = (pageIndex: number, previousPageData: StatusesResponse) => {
		if (pageIndex === 0) return "/api/post";
		if (!previousPageData.nextMaxId) return null;

		return `/api/post?max_id=${previousPageData.nextMaxId}`;
	};

	const { hasValidToken, isLoading: isTokenLoading } = useToken();
	const { t } = useTranslation();

	const { data, size, setSize, isLoading } = useSWRInfinite<StatusesResponse>(
		getKey,
		null
	);

	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		if (data && data[data.length - 1].nextMaxId === undefined) {
			setHasMore(false);
		}
	}, [data]);

	const length = data?.reduce((acc, page) => {
		if (!page.localViewableStatuses) return 0;
		return acc + page.localViewableStatuses.length;
	}, 0);

	useEffect(() => {
		if (!isLoading) {
			setSize(size + 1);
		}
	}, [isLoading]);

	return (
		<Layout
			title="Mastoplace"
			showBackground={isTokenLoading || isLoading ? true : hasValidToken}
			showTabBar
			hasFloatingButton
		>
			{(isTokenLoading || isLoading) && <PostLoadingList />}
			{!hasValidToken && !isTokenLoading && (
				<div className="text-center px-4 flex gap-8 items-center flex-col text-slate-800 dark:text-zinc-200 text-lg mt-24 font-medium break-keep">
					<Logo />
					<p>
						{t("home.log-in-to-see.1")}
						<br />
						{t("home.log-in-to-see.2")}
					</p>
					<div className="sm:w-96 w-3/4">
						<LogInOrPublic redirectAfterAuth="/home" />
					</div>
				</div>
			)}
			{hasValidToken && data && length === 0 && (
				<div className="text-center px-4 flex gap-8 flex-col text-slate-800 dark:text-zinc-200 text-lg mt-12 font-medium break-keep">
					<p>
						{t("home.no-post.1")}
						<br />
						{t("home.no-post.2")}
					</p>
					<div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
						<Button
							text={t("action.new-post.first")}
							href="/post/new"
							Icon={Pencil}
							isLoading={false}
							isPrimary
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
			{hasValidToken && data && length !== undefined && length > 0 && (
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
								if (!page.localViewableStatuses) return null;

								return page.localViewableStatuses.map((status) => (
									<li key={status.id} className="p-4 empty:hidden">
										<PostBlock id={status.id} link />
									</li>
								));
							})}
					</ol>
				</InfiniteScroll>
			)}
			{hasValidToken &&
				data &&
				length !== undefined &&
				length > 0 &&
				!hasMore && <EndIndicator hasFloatingButton />}
			{hasValidToken && data && length !== undefined && length > 0 && (
				<FloatingButton
					Icon={Pencil}
					text={t("action.new-post.default")}
					href="/post/new"
				/>
			)}
		</Layout>
	);
}
