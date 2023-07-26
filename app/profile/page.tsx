"use client";

import { LogOutResponse } from "@/app/api/profile/logout/route";
import { MyInfoResponse } from "@/app/api/profile/me/route";
import { MyStatusesResponse } from "@/app/api/status/my/route";
import { AuthForm } from "@/components/Auth/AuthForm";
import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { FullPageOverlay } from "@/components/Layout/FullPageOverlay";
import { DeleteAccountForm } from "@/components/Profile/DeleteAccountForm";
import { InfoForm } from "@/components/Profile/InfoForm";
import { StatusBlock } from "@/components/StatusBlock";
import { EndIndicator } from "@/components/StatusBlock/EndIndicator";
import { useMutation } from "@/libs/client/useMutation";
import { useToken } from "@/libs/client/useToken";
import { AnimatePresence } from "framer-motion";
import { LogOut, PencilLine, UserX2, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

export default function Profile() {
	const [logOut, { data: logOutData, isLoading: isLogOutLoading }] =
		useMutation<LogOutResponse>("/api/profile/logout");

	const { data: profileData, isLoading: isProfileLoading } =
		useSWR<MyInfoResponse>("/api/profile/me");

	const getKey = (pageIndex: number, previousPageData: MyStatusesResponse) => {
		if (pageIndex === 0) return "/api/status/my";
		if (!previousPageData.nextMaxId) return null;

		return `/api/status/my?max_id=${previousPageData.nextMaxId}`;
	};

	const { data, size, setSize, isLoading } = useSWRInfinite<MyStatusesResponse>(
		getKey,
		null
	);

	const { hasValidToken, isLoading: isTokenLoading } = useToken();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showInfoModal, setShowInfoModal] = useState(false);
	const router = useRouter();

	const onLogOutClick = () => {
		if (isLogOutLoading) return;

		logOut({});
	};

	useEffect(() => {
		if (logOutData?.ok) {
			router.push("/");
		}
	}, [logOutData]);

	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		if (data && data[data.length - 1].nextMaxId === undefined) {
			setHasMore(false);
		}
	}, [data]);

	const length = data?.reduce((acc, page) => {
		if (!page.myStatuses) return 0;
		return acc + page.myStatuses.length;
	}, 0);

	useEffect(() => {
		if (!isLoading) {
			setSize(size + 1);
		}
	}, [isLoading]);

	return (
		<Layout title="프로필" showBackground showTabBar>
			<AnimatePresence>
				{!isTokenLoading && !hasValidToken && (
					<FullPageOverlay
						type="back"
						component={
							<div className="flex flex-col gap-6">
								<p className="text-xl font-medium text-slate-800 dark:text-zinc-200 text-center break-keep">
									내 프로필을 확인하려면
									<br />
									로그인해야 합니다.
								</p>
								<AuthForm
									buttonText="로그인하고 내 프로필 확인"
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
					profileData.me && (
						<FullPageOverlay
							type="close"
							onCloseClick={() => setShowInfoModal(false)}
							component={
								<InfoForm
									server={profileData.me.server}
									handle={profileData.me.handle}
								/>
							}
						/>
					)}
				{showDeleteModal &&
					!isTokenLoading &&
					!isProfileLoading &&
					profileData &&
					profileData.me && (
						<FullPageOverlay
							type="close"
							buttonLabel="탈퇴 안 할래요"
							onCloseClick={() => setShowDeleteModal(false)}
							component={
								<DeleteAccountForm
									server={profileData.me.server}
									serverName={profileData.me.serverName}
									handle={profileData.me.handle}
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
								{!isProfileLoading && profileData && profileData.me ? (
									<img src={profileData.me.avatar} alt="내 프로필 사진" />
								) : (
									<Skeleton className="w-full h-full" circle />
								)}
							</div>
							<div className="flex flex-col items-center w-full gap-1">
								<div className="text-3xl font-semibold text-slate-700 dark:text-zinc-300 w-full text-center">
									{!isProfileLoading && profileData && profileData.me ? (
										profileData.me.displayName
									) : (
										<Skeleton width="25%" />
									)}
								</div>
								<span className="text-sm text-slate-500 dark:text-zinc-500  font-medium w-full text-center">
									{!isProfileLoading && profileData && profileData.me ? (
										`@${profileData.me.handle}@${profileData.me.server}`
									) : (
										<Skeleton width="15%" />
									)}
								</span>
							</div>
						</address>
						<Button
							isPrimary
							Icon={PencilLine}
							isLoading={false}
							text={
								profileData && profileData.me
									? `${profileData.me?.serverName}에서 프로필 수정`
									: "프로필 수정"
							}
							href={
								profileData && profileData.me
									? `https://${profileData.me.server}/settings/profile`
									: ""
							}
							disabled={isProfileLoading || !profileData || !profileData.me}
							newTab
						/>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
							<Button
								isLoading={false}
								Icon={Wrench}
								text="위치 정보 관리…"
								className="col-span-2 sm:col-span-1"
								onClick={() => setShowInfoModal(true)}
							/>
							<Button
								isLoading={isLogOutLoading}
								Icon={LogOut}
								text="로그아웃"
								onClick={onLogOutClick}
							/>
							<Button
								isLoading={false}
								Icon={UserX2}
								text="탈퇴…"
								onClick={() => setShowDeleteModal(true)}
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
									<StatusBlock id={null} />
								</div>
							}
						>
							<ol className="divide-y divide-slate-200 dark:divide-zinc-800">
								{data &&
									data.map((page) => {
										if (!page.myStatuses) return null;

										return page.myStatuses.map((status) => (
											<li key={status.id} className="p-4 empty:hidden">
												<StatusBlock id={status.id} link />
											</li>
										));
									})}
							</ol>
						</InfiniteScroll>
					)}
					{data && length === 0 && !hasMore && (
						<div className="text-center px-4 flex gap-2 flex-col text-slate-800 dark:text-zinc-200 text-lg mt-12 font-medium break-keep">
							<p>
								아직 Mastoplace를 통해
								<br />
								작성한 글이 없어요.
							</p>
							<p>
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
					{data && length !== 0 && !hasMore && <EndIndicator />}
				</div>
			)}
		</Layout>
	);
}
