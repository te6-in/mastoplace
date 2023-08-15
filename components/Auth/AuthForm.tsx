"use client";

import { AuthResponse } from "@/app/api/auth/route";
import { Button } from "@/components/Input/Button";
import { TextInput } from "@/components/Input/TextInput";
import { ArrowUpLeft, LogIn } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
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
	const { t } = useTranslation();
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

		return data as AuthResponse;
	}

	const onValid = async (inputs: AuthInputs) => {
		if (isLoading) return;

		const { pathname: server } = parseURL(inputs.server);

		if (serverError) {
			setError("server", {
				message: t("auth.form.server.error.invalid"),
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
					required: t("auth.form.server.error.required"),
				})}
				type="text"
				id="server"
				label={t("auth.form.server.label")}
				placeholder={t("auth.form.server.placeholder", {
					server: t("auth.form.server.autocomplete.1"),
				})}
				prefix="https://"
				error={errors.server?.message}
			/>
			{watchServer === "" && (
				<div className="grid grid-cols-1 sm:grid-cols-2 text-sm text-slate-700 dark:text-zinc-300 gap-2">
					<FillButton
						server={t("auth.form.server.autocomplete.1")}
						setValue={setValue}
					/>
					<FillButton
						server={t("auth.form.server.autocomplete.2")}
						setValue={setValue}
					/>
					<FillButton
						server={t("auth.form.server.autocomplete.3")}
						setValue={setValue}
					/>
					<FillButton
						server={t("auth.form.server.autocomplete.4")}
						setValue={setValue}
					/>
					<FillButton
						server={t("auth.form.server.autocomplete.5")}
						setValue={setValue}
					/>
					<FillButton
						server={t("auth.form.server.autocomplete.6")}
						setValue={setValue}
					/>
				</div>
			)}
			{watchServer !== "" && (
				<Button
					isPrimary
					Icon={LogIn}
					isLoading={isLoading}
					text={buttonText ?? t("auth.form.log-in")}
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
