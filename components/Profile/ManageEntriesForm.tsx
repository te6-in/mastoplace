import { CountResponse } from "@/app/api/profile/count/route";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useSWR from "swr";

interface ManageEntriesFormProps {
	handle: string;
	server: string;
}

export function ManageEntriesForm({ handle, server }: ManageEntriesFormProps) {
	const { data: countData, isLoading: isCountLoading } =
		useSWR<CountResponse>("api/profile/count");

	return (
		<div className="flex gap-6 flex-col">
			<div className="flex flex-col gap-1 break-keep">
				<div className="text-slate-800 dark:text-zinc-200 font-medium text-center text-lg">
					Mastoplace에 등록된 정보 관리
				</div>
				<p className="text-sm text-center font-medium text-slate-500 dark:text-zinc-500">
					@{handle}@{server} 마스토돈 계정으로 등록된 정보를 관리할 수 있습니다.
				</p>
			</div>
			<div className="flex flex-col gap-6">
				<div className="bg-slate-100 dark:bg-zinc-900 rounded-md p-4 text-slate-900 dark:text-zinc-100">
					<div>Mastoplace에 등록된 위치 및 게시 정보</div>
					<span>
						{!isCountLoading && countData && countData.ok ? (
							`총 ${countData.allCount}건`
						) : (
							<Skeleton width={100} />
						)}
					</span>
				</div>
			</div>
		</div>
	);
}
