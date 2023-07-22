"use client";

import { Layout } from "@/components/Layout";
import { StatusBlock } from "@/components/StatusBlock";

interface StatusParams {
	params: {
		id?: string;
	};
}

export default function Status({ params }: StatusParams) {
	return (
		<Layout showBackButton showTabBar>
			{
				params.id ? (
					<div className="flex flex-col gap-4">
						<div className="px-4">
							<StatusBlock id={params.id} />
						</div>
						<hr className="border-slate-100" />
						<div className="text-slate-700 text-lg font-medium text-center">
							이 글이 올라온 곳 주변의 글
						</div>
					</div>
				) : (
					"오류"
				) /* TODO: 404 */
			}
		</Layout>
	);
}
