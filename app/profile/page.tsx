"use client";

import { LogOutResponse } from "@/app/api/profile/logout/route";
import { MyStatusesResponse } from "@/app/api/status/my/route";
import { AuthForm } from "@/components/Auth/AuthForm";
import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { FullPageOverlay } from "@/components/Layout/FullPageOverlay";
import { DeleteAccountForm } from "@/components/Profile/DeleteAccountForm";
import { useMutation } from "@/libs/client/useMutation";
import { useToken } from "@/libs/client/useToken";
import { Eraser, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Profile() {
	const [logOut, { data: logOutData, isLoading: isLogOutLoading }] =
		useMutation<LogOutResponse>("/api/profile/logout");

	const { data, isLoading } = useSWR<MyStatusesResponse>("/api/status/my");

	const { hasValidToken, isLoading: isTokenLoading } = useToken();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
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

	return (
		<Layout title="프로필" showBackground showTabBar>
			{!isTokenLoading && !hasValidToken && (
				<FullPageOverlay
					type="back"
					component={
						<div className="flex flex-col gap-6">
							<p className="text-xl font-medium text-slate-800 text-center break-keep">
								내 프로필을 확인하려면
								<br />
								로그인해야 합니다.
							</p>
							<AuthForm
								buttonText="로그인하고 내 프로필 확인하기"
								redirectAfterAuth="/profile"
							/>
						</div>
					}
				/>
			)}
			{!isTokenLoading && !isLoading && data && data.me && (
				<div className="grid grid-cols-2 gap-2 px-4">
					<Button
						isLoading={isLogOutLoading}
						Icon={LogOut}
						text="로그아웃"
						onClick={onLogOutClick}
					/>
					<Button
						isLoading={false}
						Icon={Eraser}
						text="탈퇴"
						onClick={() => setShowDeleteModal(true)}
					/>
				</div>
			)}
			{showDeleteModal && !isTokenLoading && !isLoading && data && data.me && (
				<FullPageOverlay
					type="close"
					buttonLabel="탈퇴 안 할래요"
					onCloseClick={() => setShowDeleteModal(false)}
					component={
						<DeleteAccountForm
							server={data.me.server}
							handle={data.me.handle}
						/>
					}
				/>
			)}
		</Layout>
	);
}
