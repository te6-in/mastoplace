"use client";

import { StatusesResponse } from "@/app/api/status/route";
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

export default function Public() {
	const getKey = (pageIndex: number, previousPageData: StatusesResponse) => {
		if (pageIndex === 0) return "/api/status?public=true";
		if (!previousPageData.nextMaxId) return null;

		return `/api/status?public=true&max_id=${previousPageData.nextMaxId}`;
	};

	const { isLoading: isTokenLoading } = useToken();

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
		<Layout title="공개 위치" showBackground showTabBar hasFloatingButton>
			{(isTokenLoading || isLoading) && (
				<ol className="divide-y divide-slate-200 dark:divide-zinc-800">
					{[1, 2, 3].map((_, index) => (
						<li key={index} className="p-4">
							<StatusBlock id={null} />
						</li>
					))}
				</ol>
			)}
			{!isLoading && data && length === 0 && (
				<div className="text-center px-4 flex gap-2 flex-col text-slate-800 dark:text-zinc-200 text-lg mt-12 font-medium break-keep">
					<p>
						Mastoplace를 통해 게시된 글 중에서
						<br />볼 수 있는 글이 없어요.
					</p>
					<p>
						<Link
							href="/status/new"
							className="underline text-violet-500 underline-offset-4"
						>
							첫 번째 글을 작성
						</Link>
						해 보세요!
					</p>
				</div>
			)}
			{!isLoading && data && length !== undefined && length > 0 && (
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
			{data && length !== 0 && !hasMore && <EndIndicator hasFloatingButton />}
			<FloatingButton Icon={Pencil} text="새로운 글 작성" href="/status/new" />
		</Layout>
	);
}
