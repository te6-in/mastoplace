"use client";

import { AuthForm } from "@/components/Auth/AuthForm";
import { Layout } from "@/components/Layout";
import { useToken } from "@/libs/client/useToken";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthPage() {
	const { hasValidToken, isLoading: isTokenLoading } = useToken();
	const router = useRouter();

	useEffect(() => {
		if (hasValidToken) {
			router.push("/");
		}
	}, [hasValidToken]);

	if (isTokenLoading || hasValidToken) return null;

	return (
		<Layout hideTabBarCompletely>
			<div className="flex flex-col gap-8 mt-16 px-4 sm:w-96 mx-auto">
				<div className="flex gap-2 flex-col">
					<h1 className="font-bold text-4xl text-center text-slate-800">
						Mastoplace
					</h1>
					<p className="text-slate-600 font-medium text-center text-sm break-keep">
						마스토돈 글에 위치를 추가하고
						<br />
						주변 사람들이 올린 글을 찾아보세요.
					</p>
				</div>
				<AuthForm redirectAfterAuth="/" />
			</div>
		</Layout>
	);
}
