"use client";

import { Button } from "@/components/Input/Button";
import { TextInput } from "@/components/Input/TextInput";
import { ArrowUpLeft, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UseFormSetValue, useForm } from "react-hook-form";
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
		setValue,
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
				placeholder="예를 들면… mastodon.social"
				prefix="https://"
				error={errors.server?.message}
			/>
			{watchServer === "" && (
				<div className="grid grid-cols-1 sm:grid-cols-2 text-sm text-slate-700 dark:text-zinc-300 gap-2">
					<FillButton server="planet.moe" setValue={setValue} />
					<FillButton server="qdon.space" setValue={setValue} />
					<FillButton server="mustard.blog" setValue={setValue} />
					<FillButton server="pointless.chat" setValue={setValue} />
					<FillButton server="mastodon.social" setValue={setValue} />
					<FillButton server="mas.to" setValue={setValue} />
				</div>
			)}
			{watchServer !== "" && (
				<Button
					isPrimary
					Icon={LogIn}
					isLoading={isLoading}
					text={buttonText ?? "서버를 통해 로그인"}
				/>
			)}
		</form>
	);
}

interface FillButtonProps {
	server: string;
	setValue: UseFormSetValue<Pick<AuthInputs, "server">>;
}

function FillButton({ server, setValue }: FillButtonProps) {
	const onClick = () => {
		setValue("server", server);
	};

	return (
		<button
			className="flex items-center justify-between gap-1 rounded-md bg-white shadow-sm border-slate-200 border p-1.5 pl-2.5 hover:bg-slate-100 active:bg-slate-200 dark:bg-zinc-950 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:active:bg-zinc-800 transition-colors overflow-hidden"
			onClick={onClick}
		>
			<span>{server}</span>
			<ArrowUpLeft width={20} height={20} className="shrink-0" />
		</button>
	);
}
