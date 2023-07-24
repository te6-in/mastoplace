"use client";

import { AuthForm } from "@/components/Auth/AuthForm";
import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { FullPageOverlay } from "@/components/Layout/FullPageOverlay";
import { useMutation } from "@/libs/client/useMutation";
import { useToken } from "@/libs/client/useToken";
import { DefaultResponse } from "@/libs/server/response";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Profile() {
	const [logOut, { data, isLoading }] = useMutation<DefaultResponse>(
		"/api/profile/logout"
	);

	const { hasValidToken, isLoading: isTokenLoading } = useToken();
	const router = useRouter();

	const onClick = () => {
		if (isLoading) return;

		logOut({});
	};

	useEffect(() => {
		if (data?.ok) {
			router.push("/");
		}
	}, [data]);

	return (
		<Layout title="프로필" showBackground showTabBar>
			{!isTokenLoading && !hasValidToken && (
				<FullPageOverlay
					component={
						<div className="flex flex-col gap-6">
							<p className="text-xl font-medium text-slate-800 text-center break-keep">
								프로필을 확인하려면
								<br />
								로그인해야 합니다.
							</p>
							<AuthForm
								buttonText="로그인하고 프로필 확인하기"
								redirectAfterAuth="/profile"
							/>
						</div>
					}
				/>
			)}
			<Button
				isPrimary
				isLoading={isLoading}
				Icon={LogOut}
				text="로그아웃"
				onClick={onClick}
			/>
		</Layout>
	);
}
