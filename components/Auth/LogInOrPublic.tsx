import { AuthForm, AuthFormProps } from "@/components/Auth/AuthForm";
import { Button } from "@/components/Input/Button";
import { Globe2 } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

export function LogInOrPublic({
	buttonText,
	redirectAfterAuth,
}: AuthFormProps) {
	const { t } = useTranslation();

	return (
		<div className="w-full flex gap-6 flex-col">
			<AuthForm buttonText={buttonText} redirectAfterAuth={redirectAfterAuth} />
			<div className="relative flex items-center justify-center w-full">
				<hr className="w-full border-slate-300 dark:border-zinc-700" />
				<span className="absolute text-sm break-keep text-center font-semibold text-slate-500 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-950 px-2">
					{t("auth.divider")}
				</span>
			</div>
			<Button
				text={t("action.discover")}
				href="/discover"
				isLoading={false}
				Icon={Globe2}
				event="auth-discover-without-login"
			/>
		</div>
	);
}
