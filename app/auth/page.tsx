"use client";

import { Button } from "@/components/Input/Button";
import { TextInput } from "@/components/Input/TextInput";
import { Layout } from "@/components/Layout";
import { useToken } from "@/libs/client/useToken";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { parseURL, withQuery } from "ufo";

interface AuthInputs {
	server: string;
	code: string;
}

export default function Auth() {
	const devDefault = {
		defaultValues: {
			server: "mas.to",
		},
	};
	const {
		register,
		handleSubmit,
		setError,
		watch,
		formState: { errors },
	} = useForm<AuthInputs>({
		...(process.env.NODE_ENV === "development" ? { ...devDefault } : {}),
	});
	const watchServer = watch("server");

	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const { error: serverError } = useSWR(
		`https://${watchServer}/api/v1/instance`
	);

	async function auth({ server, code }: AuthInputs) {
		setIsLoading(true);

		await fetch(withQuery("/api/auth/callback", { server, code }), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}).then((response) => {
			if (response.redirected) {
				router.push(response.url);
			}
		});
	}

	const onValid = async (inputs: AuthInputs) => {
		const { pathname: server } = parseURL(inputs.server);

		if (serverError) {
			setError("server", {
				message: "올바른 마스토돈 서버가 아닙니다.",
			});

			return;
		}

		if (process.env.NODE_ENV === "development" && inputs.code) {
			await auth({ server, code: inputs.code });
		} else {
			setIsLoading(true);

			console.log(`https://${server}/oauth/authorize`);

			router.push(
				withQuery(`https://${server}/oauth/authorize`, {
					client_id: process.env.NEXT_PUBLIC_CLIENT_KEY,
					scope: process.env.NEXT_PUBLIC_SCOPE,
					response_type: "code",
					redirect_uri: `${process.env.NEXT_PUBLIC_REDIRECT_URI}${
						process.env.NODE_ENV === "development" ? "" : `?server=${server}`
					}`,
				})
			);
		}
	};

	const { token } = useToken();

	if (token) {
		console.log(token);
		router.push("/");
	}

	return (
		<Layout hideTabBarCompletely isPublic>
			<div className="mt-12 flex gap-8 flex-col">
				<div className="flex gap-2 flex-col">
					<h1 className="font-bold text-4xl text-center text-slate-800">
						Mastoplace
					</h1>
					<p className="text-slate-600 font-medium text-center text-sm">
						마스토돈 글에 위치를 추가하고
						<br />
						주변 사람들이 올린 글을 찾아보세요.
					</p>
				</div>
				<form
					onSubmit={handleSubmit(onValid)}
					className="px-4 flex gap-2 flex-col"
				>
					<TextInput
						register={register("server", {
							required: "서버 주소를 입력해주세요.",
						})}
						type="text"
						id="server"
						label="서버 주소"
						placeholder={`예를 들면... mastodon.social`}
						prefix="https://"
						error={errors.server?.message}
					/>
					{process.env.NODE_ENV === "development" && (
						<TextInput
							register={register("code")}
							type="text"
							id="token"
							label="토큰"
							placeholder="#$$#%&&#"
							error={errors.code?.message}
						/>
					)}
					<Button
						isPrimary
						Icon={LogIn}
						isLoading={isLoading}
						text="서버를 통해 로그인"
					/>
				</form>
			</div>
		</Layout>
	);
}
