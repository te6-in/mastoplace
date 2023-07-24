"use client";

import { Button } from "@/components/Input/Button";
import { TextInput } from "@/components/Input/TextInput";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { parseURL, withQuery } from "ufo";

interface CreateAppInputs {
	server: string;
}

interface AuthInputs {
	server: string;
}

export interface AuthFormProps {
	buttonText?: string;
	redirectAfterAuth: string;
}

export function AuthForm({ buttonText, redirectAfterAuth }: AuthFormProps) {
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

	async function auth({ server }: CreateAppInputs) {
		setIsLoading(true);

		const data = await fetch(
			withQuery("/api/auth", { server, redirect: redirectAfterAuth }),
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		)
			.then((response) => response.json())
			.then((data) => data);

		return data;
	}

	const onValid = async (inputs: AuthInputs) => {
		if (isLoading) return;

		const { pathname: server } = parseURL(inputs.server);

		if (serverError) {
			setError("server", {
				message: "올바른 마스토돈 서버가 아닙니다.",
			});

			return;
		}

		setIsLoading(true);

		const data = await auth({ server });

		if (data.ok) {
			router.push(data.url);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onValid)}
			className="flex gap-2 flex-col w-full"
		>
			<TextInput
				register={register("server", {
					required: "마스토돈 서버 주소를 입력해주세요.",
				})}
				type="text"
				id="server"
				label="마스토돈 서버 주소"
				placeholder={`예를 들면... mastodon.social`}
				prefix="https://"
				error={errors.server?.message}
			/>
			<Button
				isPrimary
				Icon={LogIn}
				isLoading={isLoading}
				text={buttonText ?? "서버를 통해 로그인"}
			/>
		</form>
	);
}
