import { MyCountResponse } from "@/app/api/post/my/count/route";
import { DeleteAllResponse } from "@/app/api/post/my/route";
import { LogOutResponse } from "@/app/api/profile/logout/route";
import { Button } from "@/components/Input/Button";
import { useMutation } from "@/libs/client/useMutation";
import { ellipsis, j } from "@/libs/client/utils";
import {
	ArrowUpRightSquare,
	Check,
	ChevronLast,
	Eraser,
	LogOut,
	Trash2,
} from "lucide-react";
import useTranslation from "next-translate/useTranslation";
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
		useMutation<DeleteAllResponse>("/api/post/my?type=statuses", "DELETE");

	const [deleteDatabase, { isLoading: isDeleteDatabaseLoading }] =
		useMutation<DeleteAllResponse>("/api/post/my?type=database", "DELETE");

	const [stepsDone, setStepsDone] = useState(0);

	const [logOut, { data: logOutData, isLoading: isLogOutLoading }] =
		useMutation<LogOutResponse>("/api/profile/logout");

	const { t } = useTranslation();

	const {
		data: viewableCountData,
		isLoading: isViewableCountLoading,
		mutate: viewableCountMutate,
	} = useSWR<MyCountResponse>("api/post/my/count?viewable=true");

	const {
		data: allCountData,
		isLoading: isAllCountLoading,
		mutate: allCountMutate,
	} = useSWR<MyCountResponse>("api/post/my/count");

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
			router.push("/home");
		}
	}, [logOutData]);

	return (
		<div className="flex gap-6 flex-col">
			<div className="flex flex-col gap-1 break-keep">
				<div className="text-slate-800 font-medium text-center text-lg dark:text-zinc-200">
					{t("profile.delete-account.title")}
				</div>
				<p className="text-sm text-center font-medium text-slate-500 dark:text-zinc-500">
					{t("profile.delete-account.description")}
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
								{t("profile.delete-account.first.title")}
							</div>
							<p className="text-slate-500 dark:text-zinc-500">
								{t("profile.delete-account.first.description.primary", {
									handle: `@${handle}@${server}`,
								})}
							</p>
							<p className="text-slate-400 dark:text-zinc-600 text-sm mt-1">
								{t("profile.delete-account.first.description.secondary")}
							</p>
						</div>
						<div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 mt-2">
							<Button
								isPrimary={stepsDone === 0}
								text={
									viewableCountData && viewableCountData.count !== undefined
										? viewableCountData.count > 0
											? t("profile.delete-account.first.button.delete", {
													count: viewableCountData.count,
											  })
											: t("profile.delete-account.first.button.unavailable")
										: ellipsis(t("profile.delete-account.first.button.loading"))
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
								text={t("profile.delete-account.first.button.skip")}
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
					title={t("profile.delete-account.second.title")}
					text={t("profile.delete-account.second.description.primary", {
						handle: `@${handle}@${server}`,
					})}
					description={t("profile.delete-account.second.description.secondary")}
					disabled={stepsDone !== 1}
					Button={
						<Button
							isPrimary={stepsDone === 1}
							text={
								allCountData && allCountData.count !== undefined
									? allCountData.count > 0
										? t("profile.delete-account.second.button.delete", {
												count: allCountData.count,
										  })
										: t("profile.delete-account.second.button.unavailable")
									: ellipsis(t("profile.delete-account.second.button.loading"))
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
					title={t("profile.delete-account.third.title")}
					text={t("profile.delete-account.third.description.primary")}
					description={t("profile.delete-account.third.description.secondary")}
					disabled={stepsDone !== 2}
					Button={
						<Button
							isPrimary={stepsDone === 2}
							text={t("profile.delete-account.third.button.open", {
								server: serverName,
							})}
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
					title={t("profile.log-out")}
					description={t("profile.delete-account.fourth.description")}
					disabled={stepsDone !== 3}
					Button={
						<Button
							isPrimary={stepsDone === 3}
							text={t("profile.log-out")}
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
