"use client";

import { NearbyStatusesResponse } from "@/app/api/status/[id]/nearby/route";
import { LogInOrPublic } from "@/components/Auth/LogInOrPublic";
import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { StatusBlock } from "@/components/StatusBlock";
import { StatusLoadingList } from "@/components/StatusBlock/StatusLoadingList";
import { useToken } from "@/libs/client/useToken";
import { Globe2, Newspaper } from "lucide-react";
import useSWR from "swr";
import { parseURL } from "ufo";

interface StatusParams {
	params: {
		id?: string;
	};
}

export default function Status({ params }: StatusParams) {
	const { data, isLoading } = useSWR<NearbyStatusesResponse>(
		params.id ? `/api/status/${params.id}/nearby` : null
	);

	const { hasValidToken, isLoading: isTokenLoading } = useToken();

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
							이 글을 보기 위해서는 로그인해야 합니다.
						</p>
						<p className="text-center font-medium text-slate-500 dark:text-zinc-500 text-sm">
							Mastoplace 서버에는 글 내용이 저장되지 않기 때문에
							<br />
							로그인해야 마스토돈 서버를 통해 글을 확인할 수 있습니다.
						</p>
					</div>
					<LogInOrPublic
						redirectAfterAuth={parseURL(location.href).pathname}
						buttonText="로그인한 뒤 이 글로 돌아오기"
					/>
				</div>
			)}
			{(!params.id || (data && data.ok) === false) && null}
			{params.id && (
				<div className="flex flex-col gap-4">
					<div className="px-4 py-4 empty:hidden">
						<StatusBlock id={params.id} />
					</div>
					<div className="empty:hidden">
						{(isLoading || (data && data.ok !== false)) && (
							<>
								<hr className="border-slate-200 dark:border-zinc-800" />
								<div className="text-slate-800 dark:text-zinc-200 text-lg font-medium text-center pt-6 pb-2">
									이곳 근처에서 올라온 글
								</div>
							</>
						)}
						{isLoading && <StatusLoadingList dividerPadding />}
						{data && data.ok && !data.hasLocation && (
							<div className="my-3 text-slate-500 dark:text-zinc-500 text-sm font-medium text-center">
								이 글은 위치가 등록되지 않았기 때문에 주변 글을 볼 수 없어요.
							</div>
						)}
						{data && data.ok && data.nearbyIds && !data.nearbyIds.length && (
							<div className="my-3 text-slate-500 dark:text-zinc-500 text-sm font-medium text-center">
								이곳 주변에는 올라온 글이 없어요.
							</div>
						)}
						{data && data.ok && data.nearbyIds && data.nearbyIds.length !== 0 && (
							<ol className="divide-y divide-slate-200 dark:divide-zinc-800 px-4">
								{data.nearbyIds.map((nearbyId) => (
									<li className="py-4 empty:hidden" key={nearbyId}>
										<StatusBlock
											id={nearbyId}
											from={data.originalLocation}
											link
										/>
									</li>
								))}
							</ol>
						)}
					</div>
				</div>
			)}
			{!isTokenLoading &&
				hasValidToken &&
				params.id &&
				data &&
				data.ok === false && (
					<div className="flex flex-col gap-6 px-4 mt-12 mx-auto text-center w-3/4 sm:w-96">
						<div className="flex flex-col gap-2 break-keep">
							<h1 className="text-slate-800 text-2xl dark:text-zinc-200">
								아쉽네요!
							</h1>
							<p className="text-sm text-slate-600 dark:text-zinc-400">
								없는 글이거나
								<br />
								지금 로그인한 계정으로는 볼 수 없는 글이에요.
							</p>
						</div>
						<div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
							<Button
								text="홈으로 가기"
								href="/"
								isPrimary
								isLoading={false}
								Icon={Newspaper}
							/>
							<Button
								text="공개 위치 구경"
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
