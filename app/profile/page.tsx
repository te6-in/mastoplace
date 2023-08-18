"use client";

import { MyStatusesResponse } from "@/app/api/post/my/route";
import { LogOutResponse } from "@/app/api/profile/logout/route";
import { MyInfoResponse } from "@/app/api/profile/me/route";
import { AuthForm } from "@/components/Auth/AuthForm";
import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { FullPageOverlay } from "@/components/Layout/FullPageOverlay";
import { PostBlock } from "@/components/PostBlock";
import { EndIndicator } from "@/components/PostBlock/EndIndicator";
import { DeleteAccountForm } from "@/components/Profile/DeleteAccountForm";
import { ManageEntriesForm } from "@/components/Profile/ManageEntriesForm";
import { useMutation } from "@/libs/client/useMutation";
import { useToken } from "@/libs/client/useToken";
import { ellipsis } from "@/libs/client/utils";
import { AnimatePresence } from "framer-motion";
import { LogOut, Pencil, PencilLine, UserX2, Wrench } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

export default function Profile() {
	const [logOut, { data: logOutData, isLoading: isLogOutLoading }] =
		useMutation<LogOutResponse, {}>("/api/profile/logout");

	const { data: profileData, isLoading: isProfileLoading } =
		useSWR<MyInfoResponse>("/api/profile/me", { revalidateOnFocus: false });

	const getKey = (pageIndex: number, previousPageData: MyStatusesResponse) => {
		if (pageIndex === 0 || !previousPageData.ok) return "/api/post/my";
		if (!previousPageData.nextMaxId) return null;

		return `/api/post/my?max_id=${previousPageData.nextMaxId}`;
	};

	const { data, size, setSize, isLoading } = useSWRInfinite<MyStatusesResponse>(
		getKey,
		null
	);

	const { hasValidToken, isLoading: isTokenLoading } = useToken();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showInfoModal, setShowInfoModal] = useState(false);
	const router = useRouter();
	const { t } = useTranslation();

	const onLogOutClick = () => {
		if (isLogOutLoading) return;

		logOut({});
	};

	useEffect(() => {
		if (logOutData && logOutData.ok) {
			router.push("/home");
		}
	}, [logOutData, router]);

	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		if (!data) return;

		const lastData = data[data.length - 1];

		if (lastData.ok && lastData.nextMaxId === null) {
			setHasMore(false);
		}
	}, [data]);

	const length = data?.reduce((acc, page) => {
		if (!page.ok || !page.myStatuses) return 0;
		return acc + page.myStatuses.length;
	}, 0);

	useEffect(() => {
		if (!isLoading) {
			setSize(size + 1);
		}
	}, [isLoading]);

	return (
		<Layout title={t("tabbar.profile")} showBackground showTabBar>
			<AnimatePresence>
				{!isTokenLoading && !hasValidToken && (
					<FullPageOverlay
						type="back"
						component={
							<div className="flex flex-col gap-6">
								<div className="text-xl font-medium text-slate-800 dark:text-zinc-200 text-center break-keep">
									{t("profile.log-in-to-see")}
								</div>
								<AuthForm
									buttonText={t("profile.log-in-and-see")}
									redirectAfterAuth="/profile"
								/>
							</div>
						}
					/>
				)}
				{showInfoModal &&
					!isTokenLoading &&
					!isProfileLoading &&
					profileData &&
					profileData.ok && (
						<FullPageOverlay
							type="close"
							onCloseClick={() => setShowInfoModal(false)}
							component={
								<ManageEntriesForm
									handle={profileData.handle}
									server={profileData.server}
								/>
							}
						/>
					)}
				{showDeleteModal &&
					!isTokenLoading &&
					!isProfileLoading &&
					profileData &&
					profileData.ok && (
						<FullPageOverlay
							type="close"
							buttonLabel={t("profile.delete-account.close-form")}
							onCloseClick={() => setShowDeleteModal(false)}
							component={
								<DeleteAccountForm
									server={profileData.server}
									serverName={profileData.serverName}
									handle={profileData.handle}
								/>
							}
						/>
					)}
			</AnimatePresence>
			{!isTokenLoading && (
				<div className="flex flex-col">
					<div className="flex flex-col gap-2 px-4">
						<address className="flex gap-2 items-center flex-col not-italic my-3">
							<div className="w-20 h-20 rounded-full overflow-hidden">
								{!isProfileLoading && profileData && profileData.ok ? (
									<img
										src={profileData.avatar}
										alt={t("accessibility.alt.profile-picture.mine")}
									/>
								) : (
									<Skeleton className="w-full h-full" circle />
								)}
							</div>
							<div className="flex flex-col items-center w-full gap-1">
								<div className="text-3xl font-semibold text-slate-700 dark:text-zinc-300 w-full text-center">
									{!isProfileLoading && profileData && profileData.ok ? (
										profileData.displayName
									) : (
										<Skeleton width="25%" />
									)}
								</div>
								<span className="text-sm text-slate-500 dark:text-zinc-500  font-medium w-full text-center">
									{!isProfileLoading && profileData && profileData.ok ? (
										`@${profileData.handle}@${profileData.server}`
									) : (
										<Skeleton width="15%" />
									)}
								</span>
							</div>
						</address>
						<div className="grid grid-cols-2 gap-2">
							<Button
								isPrimary
								Icon={PencilLine}
								isLoading={false}
								text={
									profileData && profileData.ok
										? t("profile.edit-on.default", {
												server: profileData.serverName,
										  })
										: t("profile.edit-on.loading")
								}
								href={
									profileData && profileData.ok
										? `https://${profileData.server}/settings/profile`
										: ""
								}
								className="col-span-2"
								disabled={isProfileLoading || !profileData || !profileData.ok}
								newTab
								event="profile-edit-on"
							/>
							<Button
								isLoading={false}
								Icon={Wrench}
								text={ellipsis(t("profile.manage-entries"))}
								className="col-span-2"
								onClick={() => setShowInfoModal(true)}
								event="profile-manage-entries"
							/>
							<Button
								isLoading={isLogOutLoading}
								Icon={LogOut}
								text={t("profile.log-out")}
								onClick={onLogOutClick}
								event="profile-log-out"
							/>
							<Button
								isLoading={false}
								Icon={UserX2}
								text={ellipsis(t("profile.delete-account.button"))}
								onClick={() => setShowDeleteModal(true)}
								event="profile-delete-account"
							/>
						</div>
					</div>
					<hr className="border-slate-200 dark:border-zinc-800 mt-4" />
					{!isLoading && data && length !== undefined && length > 0 && (
						<InfiniteScroll
							dataLength={length}
							next={() => setSize(size + 1)}
							hasMore={hasMore}
							loader={
								<div className="p-4 border-t border-slate-200 dark:border-zinc-800">
									<PostBlock id={null} />
								</div>
							}
						>
							<ol className="divide-y divide-slate-200 dark:divide-zinc-800">
								{data &&
									data.map((page) => {
										if (!page.ok || !page.myStatuses) return null;

										return page.myStatuses.map((status) => (
											<li key={status.id} className="p-4 empty:hidden">
												<PostBlock id={status.id} link />
											</li>
										));
									})}
							</ol>
						</InfiniteScroll>
					)}
					{data && length === 0 && !hasMore && (
						<div className="text-center px-4 flex gap-8 flex-col text-slate-800 dark:text-zinc-200 text-lg mt-12 font-medium break-keep">
							<p>{t("profile.no-post")}</p>
							<Button
								text={t("action.new-post.first")}
								href="/post/new"
								Icon={Pencil}
								isLoading={false}
								isPrimary
								event="profile-empty-new-post"
							/>
						</div>
					)}
					{data && length !== 0 && !hasMore && <EndIndicator />}
				</div>
			)}
		</Layout>
	);
}
