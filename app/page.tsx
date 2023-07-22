"use client";

import { StatusesResponse } from "@/app/api/status/route";
import { Layout } from "@/components/Layout";
import { FloatingButton } from "@/components/Layout/FloatingButton";
import { StatusBlock } from "@/components/StatusBlock";
import { useToken } from "@/libs/client/useToken";
import { Pencil } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

export default function Home() {
	const { data } = useSWR<StatusesResponse>("/api/status");
	const { token } = useToken();

	return (
		<Layout title="홈" showBackground showTabBar isPublic hasFloatingButton>
			{!token ? (
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
			) : data && data.statuses ? (
				data.statuses.length !== 0 ? (
					<>
						<ol className="divide-y flex-col">
							{data.statuses.map((status) => (
								<li key={status.id} className="p-4">
									<StatusBlock id={status.id} link />
								</li>
							))}
						</ol>
						<div className="my-6 text-slate-500 text-sm font-medium text-center">
							목록의 끝이에요.
						</div>
					</>
				) : (
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
				)
			) : (
				<ol className="divide-y flex-col">
					{[1, 2, 3].map((_, index) => (
						<li key={index} className="p-4">
							<StatusBlock id={null} />
						</li>
					))}
				</ol>
			)}
			<FloatingButton Icon={Pencil} text="새로운 글 작성" href="/status/new" />
		</Layout>
	);
}
