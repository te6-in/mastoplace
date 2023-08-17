"use client";

import { AuthForm } from "@/components/Auth/AuthForm";
import { Layout } from "@/components/Layout";
import { useToken } from "@/libs/client/useToken";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthPage() {
	const { hasValidToken, isLoading: isTokenLoading } = useToken();
	const { t } = useTranslation();
	const router = useRouter();

	useEffect(() => {
		if (hasValidToken) {
			router.push("/home");
		}
	}, [hasValidToken, router]);

	if (isTokenLoading || hasValidToken) return null;

	return (
		<Layout hideTabBarCompletely>
			<div className="flex flex-col h-screen justify-center">
				<div className="flex flex-col gap-8 px-4 sm:w-96 mx-auto">
					<div className="flex gap-2 flex-col">
						<h1 className="font-bold text-4xl text-center text-slate-800 dark:text-zinc-200">
							{"Mastoplace"}
						</h1>
						<p className="text-slate-500 dark:text-zinc-500 font-medium text-center text-sm break-keep">
							{t("auth.description")}
						</p>
					</div>
					<AuthForm redirectAfterAuth="/home" />
				</div>
			</div>
		</Layout>
	);
}
