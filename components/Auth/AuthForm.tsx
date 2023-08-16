"use client";

import { AuthResponse } from "@/app/api/auth/route";
import { Button } from "@/components/Input/Button";
import { TextInput } from "@/components/Input/TextInput";
import { FullPageOverlay } from "@/components/Layout/FullPageOverlay";
import { AnimatePresence } from "framer-motion";
import { ArrowUpLeft, LogIn } from "lucide-react";
import { mastodon } from "masto";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UseFormSetValue, useForm } from "react-hook-form";
import useSWR from "swr";
import { withQuery } from "ufo";

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
	} = useForm<AuthInputs>(
		process.env.NODE_ENV === "development" ? devDefault : undefined
	);

	const watchServer = watch("server");

	const router = useRouter();
	const { t } = useTranslation();
	const [showOverlay, setShowOverlay] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { data: serverData, error: serverError } = useSWR<mastodon.v1.Instance>(
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

	const onValid = async () => {
		if (isLoading) return;

		if (serverError || !serverData || !serverData.title) {
			setError("server", {
				message: t("auth.form.server.error.invalid"),
			});

			return;
		}

		setShowOverlay(true);
	};

	const onLogInClick = async () => {
		if (!serverData) return;

		setIsLoading(true);

		const data = await auth({ server: serverData.uri });

		if (data.ok) {
			router.push(data.url);
		}
	};

	return (
		<>
			<AnimatePresence>
				{serverData && showOverlay && (
					<FullPageOverlay
						type="close"
						buttonLabel="로그인하지 않기"
						onCloseClick={() => setShowOverlay(false)}
						component={
							<div className="flex flex-col gap-1 break-keep">
								<div className="text-slate-800 font-medium text-center text-lg dark:text-zinc-200">
									중요한 내용
								</div>
								<p className="text-sm text-center font-medium text-slate-500 dark:text-zinc-500">
									아래 내용을 꼭 모두 확인한 뒤에 로그인해주세요.
								</p>
								<ol className="text-slate-600 dark:text-zinc-400 my-4 list-decimal text-left flex gap-2 flex-col text-sm pl-4">
									<li>
										로그인만 하는 경우 Mastoplace 서버에 저장되는 내용은 없지만,
										웹 브라우저 - Mastoplace 서버 - {serverData.title} 서버를
										거쳐 타임라인과 글 정보를 불러오게 됩니다.
									</li>
									<li>
										글을 게시하는 경우 글의 내용은 Mastoplace 서버가 아닌{" "}
										{serverData.title} 서버에 저장됩니다. Mastoplace에는 서버(
										{serverData.uri}), 핸들(로그인하는 계정의 아이디), 글을
										참조할 수 있는 고유 번호와 위치(선택)가 서로 연결되어
										저장됩니다. 따라서 Mastoplace는 글의 고유 번호를 통해{" "}
										{serverData.title} 서버를 거쳐 글 내용을 불러오게 됩니다.
									</li>
									<li>
										게시한 글 및 위치 정보를 완전히 삭제하고자 하는 경우,
										Mastoplace에서 삭제해야 합니다. 마스토돈에서만 삭제하는 경우
										Mastoplace에 위치 정보가 남게 됩니다. 마스토돈에 존재하지
										않는 글에 대한 위치 정보를 일괄 삭제하는 기능은 개발
										중입니다.
									</li>
									<li>
										언제든지 프로필 메뉴의 탈퇴 버튼을 통해 등록한 모든 정보를
										삭제하고 Mastoplace를 탈퇴할 수 있습니다.
									</li>
									<li>
										Mastoplace는 마스토돈(Mastodon) 서버와 연동하여 작동하는
										써드파티 앱이며, 마스토돈의 브랜딩과는 직접적인 관련이
										없습니다.
									</li>
									<li className="text-red-500">
										Mastoplace는 아직 개발 및 테스트 중인 서비스입니다. 따라서
										서비스를 통해 등록된 정보를 언제든지 초기화할 가능성이
										높으며(마스토돈 계정에서 글이 삭제되는 것은 아님), 등록된
										정보가 유출될 수 있습니다(당연히 제가 유출시키려고 애를
										쓰지는 않겠지만). 그리고 저는 2023년 8월 현재 이와 같은
										문제에 대한 책임을 질 능력이 없습니다. 이 점이 불편하지
										않으신 분만 테스트에 참여를 부탁드립니다.
									</li>
								</ol>
								<Button
									isPrimary
									Icon={LogIn}
									text={`${serverData.title} 서버를 통해 로그인`}
									onClick={onLogInClick}
									isLoading={isLoading}
								/>
							</div>
						}
					/>
				)}
			</AnimatePresence>
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
		</>
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
