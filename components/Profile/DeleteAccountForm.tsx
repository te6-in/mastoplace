import { LogOutResponse } from "@/app/api/profile/logout/route";
import { MyCountResponse } from "@/app/api/status/my/count/route";
import { DeleteAllResponse } from "@/app/api/status/my/route";
import { Button } from "@/components/Input/Button";
import { useMutation } from "@/libs/client/useMutation";
import { j } from "@/libs/client/utils";
import {
	ArrowUpRightSquare,
	Check,
	ChevronLast,
	Eraser,
	LogOut,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

interface DeleteAccountFormProps {
	handle: string;
	server: string;
	serverName: string;
}

export function DeleteAccountForm({
	handle,
	server,
	serverName,
}: DeleteAccountFormProps) {
	const router = useRouter();

	const [deletePosts, { isLoading: isDeletePostsLoading }] =
		useMutation<DeleteAllResponse>("/api/status/my?type=statuses", "DELETE");

	const [deleteDatabase, { isLoading: isDeleteDatabaseLoading }] =
		useMutation<DeleteAllResponse>("/api/status/my?type=database", "DELETE");

	const [stepsDone, setStepsDone] = useState(0);

	const [logOut, { data: logOutData, isLoading: isLogOutLoading }] =
		useMutation<LogOutResponse>("/api/profile/logout");

	const {
		data: viewableCountData,
		isLoading: isViewableCountLoading,
		mutate: viewableCountMutate,
	} = useSWR<MyCountResponse>("api/status/my/count?viewable=true");

	const {
		data: allCountData,
		isLoading: isAllCountLoading,
		mutate: allCountMutate,
	} = useSWR<MyCountResponse>("api/status/my/count");

	const onFirstClick = () => {
		if (isViewableCountLoading || isDeletePostsLoading || stepsDone !== 0)
			return;

		deletePosts({});
		viewableCountMutate(undefined, {
			revalidate: true,
		});
	};

	const onSecondClick = () => {
		if (isAllCountLoading || isDeleteDatabaseLoading || stepsDone !== 1) return;

		deleteDatabase({});
		allCountMutate(undefined, {
			revalidate: true,
		});
	};

	const onLastClick = () => {
		if (isLogOutLoading || stepsDone !== 3) return;

		logOut({});
	};

	useEffect(() => {
		if (isViewableCountLoading || isAllCountLoading) return;

		if (
			!isViewableCountLoading &&
			allCountData &&
			allCountData.count !== undefined &&
			allCountData.count === 0
		) {
			setStepsDone(2);
			return;
		}

		if (
			viewableCountData &&
			viewableCountData.count !== undefined &&
			viewableCountData.count === 0
		) {
			setStepsDone(1);
			return;
		}
	}, [viewableCountData, allCountData]);

	useEffect(() => {
		if (logOutData?.ok) {
			router.push("/");
		}
	}, [logOutData]);

	return (
		<div className="flex gap-6 flex-col">
			<div className="flex flex-col gap-1 break-keep">
				<div className="text-slate-800 font-medium text-center text-lg dark:text-zinc-200">
					Mastoplace 탈퇴
				</div>
				<p className="text-sm text-center font-medium text-slate-500 dark:text-zinc-500">
					그냥 버튼 몇 번만 누르면 돼요.
				</p>
			</div>
			<div className="relative flex flex-col gap-6">
				<div className="flex gap-3 z-10">
					<span
						className={j(
							"w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm ring-4 ring-slate-50 dark:ring-zinc-950 p-2",
							stepsDone !== 0
								? "bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-600"
								: "bg-slate-200 text-slate-500 dark:text-zinc-500 dark:bg-zinc-800"
						)}
					>
						1
					</span>
					<div className="flex-1 break-keep flex flex-col">
						<div
							className={j(
								"transition-opacity",
								stepsDone !== 0 ? "opacity-40" : ""
							)}
						>
							<div
								className={
									"font-medium text-lg text-slate-900 dark:text-zinc-100"
								}
							>
								연결된 마스토돈 글 삭제
							</div>
							<p className="text-slate-500 dark:text-zinc-500">
								Mastoplace를 통해 게시한 마스토돈 게시물을 내 마스토돈 계정(@
								{handle}@{server})에서 삭제합니다.
							</p>
							<p className="text-slate-400 dark:text-zinc-600 text-sm mt-1">
								마스토돈에 글을 남겨두고 싶다면 이 과정은 건너뛰어도 되지만, 두
								번째 단계를 진행한 이후에는 마스토돈에서 직접 삭제해야 합니다.
								마찬가지로, 이전에 마스토돈 글은 삭제하지 않고 Mastoplace 정보만
								삭제한 글의 경우 이 단계에서 삭제되지 않습니다. 이러한 경우,
								#Mastoplace 해시태그를 활용하세요.
							</p>
						</div>
						<div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 mt-2">
							<Button
								isPrimary={stepsDone === 0}
								text={
									viewableCountData && viewableCountData.count !== undefined
										? viewableCountData.count > 0
											? `마스토돈 글 ${new Intl.NumberFormat("ko-KR").format(
													viewableCountData.count
											  )}개 삭제`
											: "삭제할 글 없음"
										: "글 개수 로딩 중…"
								}
								isLoading={isViewableCountLoading || isDeletePostsLoading}
								Icon={
									viewableCountData &&
									viewableCountData.count !== undefined &&
									viewableCountData.count > 0
										? Trash2
										: Check
								}
								disabled={stepsDone !== 0}
								onClick={onFirstClick}
							/>
							<Button
								isPrimary={false}
								text="건너뛰기"
								isLoading={false}
								Icon={ChevronLast}
								disabled={stepsDone !== 0}
								onClick={() => {
									setStepsDone(1);
								}}
							/>
						</div>
					</div>
				</div>
				<Step
					number={2}
					title="저장된 정보 삭제"
					text={`@${handle}@${server} 계정과 연결된 모든 위치 및 게시 정보를 Mastoplace에서 삭제합니다.`}
					description="이 숫자가 마스토돈 글 수보다 크다면, 이미 첫 번째 단계를 진행하였거나 마스토돈에서 글을 직접 삭제한 적이 있는 경우입니다."
					disabled={stepsDone !== 1}
					Button={
						<Button
							isPrimary={stepsDone === 1}
							text={
								allCountData && allCountData.count !== undefined
									? allCountData.count > 0
										? `내 정보 ${new Intl.NumberFormat("ko-KR").format(
												allCountData.count
										  )}개 삭제`
										: "삭제할 정보 없음"
									: "내 정보 개수 로딩 중…"
							}
							isLoading={isAllCountLoading || isDeleteDatabaseLoading}
							Icon={
								allCountData &&
								allCountData.count !== undefined &&
								allCountData.count > 0
									? Eraser
									: Check
							}
							disabled={stepsDone !== 1}
							onClick={onSecondClick}
						/>
					}
				/>
				<Step
					number={3}
					title="Mastoplace 권한 해제"
					text="마스토돈 설정에서 Mastoplace 앱에 부여한 권한을 해제합니다."
					description="아래 버튼을 눌러 설정 페이지를 연 뒤, Mastoplace 항목을 찾아 삭제 버튼을 누릅니다."
					disabled={stepsDone !== 2}
					Button={
						<Button
							isPrimary={stepsDone === 2}
							text={`${serverName} 설정 새 탭에서 열기`}
							isLoading={false}
							Icon={stepsDone === 3 ? Check : ArrowUpRightSquare}
							disabled={stepsDone !== 2}
							onClick={() => {
								window.open(
									`https://${server}/oauth/authorized_applications`,
									"_blank"
								);

								setStepsDone(3);
							}}
						/>
					}
				/>
				<Step
					number={4}
					title="로그아웃"
					description="로그아웃하면 탈퇴가 완료됩니다. 안녕히 가세요!"
					disabled={stepsDone !== 3}
					Button={
						<Button
							isPrimary={stepsDone === 3}
							text="로그아웃"
							isLoading={isLogOutLoading}
							Icon={LogOut}
							onClick={onLastClick}
							disabled={stepsDone !== 3}
						/>
					}
				/>
				<div className="absolute h-full w-0.5 bg-slate-200 dark:bg-zinc-800 left-[0.9375rem] rounded-full" />
			</div>
		</div>
	);
}

function Step({
	number,
	title,
	text,
	description,
	Button,
	disabled,
}: {
	number: number;
	title: string;
	text?: string;
	description?: string;
	Button: React.ReactNode;
	disabled: boolean;
}) {
	return (
		<div className="flex gap-3 z-10">
			<span
				className={j(
					"w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm ring-4 ring-slate-50 dark:ring-zinc-950 p-2",
					disabled
						? "bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-600"
						: "bg-slate-200 text-slate-500 dark:text-zinc-500 dark:bg-zinc-800"
				)}
			>
				{number}
			</span>
			<div className="flex-1 break-keep flex flex-col">
				<div className={j("transition-opacity", disabled ? "opacity-40" : "")}>
					<div
						className={"font-medium text-lg text-slate-900 dark:text-zinc-100"}
					>
						{title}
					</div>
					<p className="text-slate-500 dark:text-zinc-500">{text}</p>
					{description && (
						<p className="text-slate-400 dark:text-zinc-600 text-sm mt-1">
							{description}
						</p>
					)}
				</div>
				<div className="mt-2">{Button}</div>
			</div>
		</div>
	);
}
