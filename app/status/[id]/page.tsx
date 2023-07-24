"use client";

import { NearbyStatusesResponse } from "@/app/api/status/[id]/nearby/route";
import { LogInOrPublic } from "@/components/Auth/LogInOrPublic";
import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { StatusBlock } from "@/components/StatusBlock";
import { useToken } from "@/libs/client/useToken";
import useSWR from "swr";

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
						<p className="text-xl font-medium text-slate-800 text-center">
							이 글을 보기 위해서는 로그인해야 합니다.
						</p>
						<p className="text-center font-semibold text-slate-500 text-sm">
							Mastoplace 서버에는 글 내용이 저장되지 않기 때문에
							<br />
							로그인해야 마스토돈 서버를 통해 글을 확인할 수 있습니다.
						</p>
					</div>
					<LogInOrPublic
						redirectAfterAuth={location.href}
						buttonText="로그인한 뒤 이 글로 돌아오기"
					/>
				</div>
			)}
			{(!params.id || (data && data.ok) === false) && null}
			{params.id && (
				<div className="flex flex-col gap-4">
					<div className="px-4">
						<StatusBlock id={params.id} />
					</div>
					<div className="px-4">
						{(isLoading || (data && data.ok !== false)) && (
							<>
								<hr className="border-slate-100" />
								<div className="text-slate-700 text-lg font-medium text-center pt-4 pb-2">
									이 글이 올라온 곳 주변의 글
								</div>
							</>
						)}
						{isLoading && (
							<ol className="divide-y">
								{[1, 2, 3].map((_, index) => (
									<li className="py-4" key={index}>
										<StatusBlock id={null} />
									</li>
								))}
							</ol>
						)}
						{data && data.ok && data.nearbyIds && data.nearbyIds.length !== 0 && (
							<ol className="divide-y">
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
						{data && data.ok && data.nearbyIds && !data.nearbyIds.length && (
							<div className="my-3 text-slate-500 text-sm font-medium text-center">
								이곳 주변에는 올라온 글이 없어요.
							</div>
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
						<div className="flex flex-col gap-2">
							<h1 className="text-slate-800 text-3xl">아쉽네요!</h1>
							<p className="text-slate-600">
								없는 글이거나
								<br />
								지금 로그인한 계정으로는 볼 수 없는 글이에요.
							</p>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<Button text="홈으로 가기" href="/" isPrimary isLoading={false} />
							<Button
								text="공개 위치 구경하기"
								href="/public"
								isLoading={false}
							/>
						</div>
					</div>
				)}
		</Layout>
	);
}
