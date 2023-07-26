"use client";

import { StatusesResponse } from "@/app/api/status/route";
import { LogInOrPublic } from "@/components/Auth/LogInOrPublic";
import { Layout } from "@/components/Layout";
import { FloatingButton } from "@/components/Layout/FloatingButton";
import { StatusBlock } from "@/components/StatusBlock";
import { EndIndicator } from "@/components/StatusBlock/EndIndicator";
import { useToken } from "@/libs/client/useToken";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useSWRInfinite from "swr/infinite";

export default function Home() {
	const getKey = (pageIndex: number, previousPageData: StatusesResponse) => {
		if (pageIndex === 0) return "/api/status";
		if (!previousPageData.nextMaxId) return null;

		return `/api/status?max_id=${previousPageData.nextMaxId}`;
	};

	const { hasValidToken, isLoading: isTokenLoading } = useToken();

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
			{(isTokenLoading || isLoading) && (
				<ol className="divide-y divide-slate-200 dark:divide-zinc-800">
					{[1, 2, 3].map((_, index) => (
						<li key={index} className="p-4">
							<StatusBlock id={null} />
						</li>
					))}
				</ol>
			)}
			{!hasValidToken && !isTokenLoading && (
				<div className="text-center px-4 flex gap-8 items-center flex-col text-slate-800 dark:text-zinc-200 text-lg mt-24 font-medium break-keep">
					<p>
						로그인하면 마스토돈에서 팔로우한 사람들이
						<br />
						Mastoplace를 통해 올린 글을 볼 수 있어요.
					</p>
					<div className="sm:w-96 w-3/4">
						<LogInOrPublic redirectAfterAuth="/" />
					</div>
				</div>
			)}
			{hasValidToken && data && length === 0 && (
				<div className="text-center px-4 flex gap-2 flex-col text-slate-800 dark:text-zinc-200 text-lg mt-12 font-medium break-keep">
					<p>팔로우하는 사람 중 Mastoplace를 통해 글을 작성한 사람이 없어요.</p>
					<p>
						<Link
							href="/public"
							className="underline text-violet-500 underline-offset-4"
						>
							공개 위치
						</Link>
						를 둘러보거나{" "}
						<Link
							href="/status/new"
							className="underline text-violet-500 underline-offset-4"
						>
							첫 번째가 되어보세요!
						</Link>
					</p>
				</div>
			)}
			{hasValidToken && data && length !== undefined && length > 0 && (
				<InfiniteScroll
					dataLength={length}
					next={() => setSize(size + 1)}
					hasMore={hasMore}
					loader={
						<div className="p-4 border-t border-slate-200 dark:border-zinc-800">
							<StatusBlock id={null} />
						</div>
					}
				>
					<ol className="divide-y divide-slate-200 dark:divide-zinc-800">
						{data &&
							data.map((page) => {
								if (!page.localViewableStatuses) return null;

								return page.localViewableStatuses.map((status) => (
									<li key={status.id} className="p-4 empty:hidden">
										<StatusBlock id={status.id} link />
									</li>
								));
							})}
					</ol>
				</InfiniteScroll>
			)}
			{hasValidToken && data && !hasMore && <EndIndicator hasFloatingButton />}
			{hasValidToken && (
				<FloatingButton
					Icon={Pencil}
					text="새로운 글 작성"
					href="/status/new"
				/>
			)}
		</Layout>
	);
}
