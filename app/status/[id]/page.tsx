"use client";

import { NearbyStatusesResponse } from "@/app/api/status/[id]/nearby/route";
import { Layout } from "@/components/Layout";
import { StatusBlock } from "@/components/StatusBlock";
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

	return (
		<Layout showBackButton showTabBar showBackground>
			{
				params.id ? (
					<div className="flex flex-col gap-4">
						<div className="px-4">
							<StatusBlock id={params.id} />
						</div>
						<hr className="border-slate-100" />
						<div className="px-4">
							<div className="text-slate-700 text-lg font-medium text-center">
								이 글이 올라온 곳 주변의 글
							</div>
							{!isLoading && data && data.nearbyStatuses ? (
								data.nearbyStatuses.length !== 0 ? (
									<ol className="divide-y">
										{data.nearbyStatuses.map((nearbyStatus) => (
											<li className="py-4" key={nearbyStatus.id}>
												<StatusBlock
													id={nearbyStatus.id}
													from={data.originalLocation}
													link
												/>
											</li>
										))}
									</ol>
								) : (
									<div className="my-3 text-slate-500 text-sm font-medium text-center">
										이곳 주변에는 올라온 글이 없어요.
									</div>
								)
							) : (
								<ol className="divide-y">
									{[1, 2, 3].map((_, index) => (
										<li className="py-4" key={index}>
											<StatusBlock id={null} />
										</li>
									))}
								</ol>
							)}
						</div>
					</div>
				) : (
					"오류"
				) /* TODO: 400 */
			}
		</Layout>
	);
}
