import { AuthForm, AuthFormProps } from "@/components/Auth/AuthForm";
import { Button } from "@/components/Input/Button";
import { Globe2 } from "lucide-react";

export function LogInOrPublic({
	buttonText,
	redirectAfterAuth,
}: AuthFormProps) {
	return (
		<div className="w-full flex gap-6 flex-col">
			<AuthForm buttonText={buttonText} redirectAfterAuth={redirectAfterAuth} />
			<div className="relative flex items-center justify-center w-full">
				<hr className="w-full border-slate-300 dark:border-zinc-700" />
				<span className="absolute text-sm break-keep text-center font-semibold text-slate-500 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-950 px-2">
					지금 로그인하고 싶지 않으면
				</span>
			</div>
			<Button
				text="공개 위치 구경"
				href="/public"
				isLoading={false}
				Icon={Globe2}
			/>
		</div>
	);
}
