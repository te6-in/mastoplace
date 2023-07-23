"use client";

import { StatusesResponse } from "@/app/api/status/route";
import { Layout } from "@/components/Layout";
import { FloatingButton } from "@/components/Layout/FloatingButton";
import { StatusBlock } from "@/components/StatusBlock";
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
		if (!page.statuses) return 0;
		return acc + page.statuses.length;
	}, 0);

	useEffect(() => {
		if (!isLoading) {
			setSize(size + 1);
		}
	}, [isLoading]);

	return (
		<Layout title="홈" showBackground showTabBar hasFloatingButton>
			{(isTokenLoading || isLoading) && (
				<ol className="divide-y">
					{[1, 2, 3].map((_, index) => (
						<li key={index} className="p-4">
							<StatusBlock id={null} />
						</li>
					))}
				</ol>
			)}
			{!hasValidToken && !isTokenLoading && (
				<div className="text-center px-4 flex gap-2 flex-col text-slate-600 text-lg mt-12 font-medium break-keep">
					<p>로그인하면 마스토돈 홈 타임라인에서</p>
					<p>Mastoplace를 통해 게시된 글을 볼 수 있어요.</p>
					<p>
						<Link
							href="/auth"
							className="underline text-violet-500 underline-offset-4"
						>
							로그인
						</Link>
						하거나{" "}
						<Link
							href="/public"
							className="underline text-violet-500 underline-offset-4"
						>
							공개 위치
						</Link>
						를 둘러보세요!
					</p>
				</div>
			)}
			{hasValidToken && data && length === 0 && (
				<div className="text-center px-4 flex gap-2 flex-col text-slate-600 text-lg mt-12 font-medium break-keep">
					<p>
						마스토돈 홈 타임라인에 Mastoplace를 통해 게시된 글이 아직 없어요.
					</p>
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
							첫 번째 글을 작성
						</Link>
						해 보세요!
					</p>
				</div>
			)}
			{hasValidToken && data && length !== undefined && length > 0 && (
				<InfiniteScroll
					dataLength={length}
					next={() => setSize(size + 1)}
					hasMore={hasMore}
					loader={
						<div className="p-4 border-t">
							<StatusBlock id={null} />
						</div>
					}
				>
					<ol className="divide-y">
						{data &&
							data.map((page) => {
								if (!page.statuses) return null;

								return page.statuses.map((status) => (
									<li key={status.id} className="p-4">
										<StatusBlock id={status.id} link />
									</li>
								));
							})}
					</ol>
				</InfiniteScroll>
			)}
			{!hasMore && (
				<div className="my-6 text-slate-500 text-sm font-medium text-center">
					목록의 끝이에요.
				</div>
			)}
			<FloatingButton Icon={Pencil} text="새로운 글 작성" href="/status/new" />
		</Layout>
	);
}
