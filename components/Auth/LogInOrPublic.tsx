import { AuthForm, AuthFormProps } from "@/components/Auth/AuthForm";
import { Button } from "@/components/Input/Button";

export function LogInOrPublic({
	buttonText,
	redirectAfterAuth,
}: AuthFormProps) {
	return (
		<div className="w-full flex gap-6 flex-col">
			<AuthForm buttonText={buttonText} redirectAfterAuth={redirectAfterAuth} />
			<div className="relative flex items-center justify-center w-full">
				<hr className="w-full border-slate-300" />
				<span className="absolute text-sm break-keep text-center font-semibold text-slate-500 bg-white px-2">
					지금 로그인하고 싶지 않으면
				</span>
			</div>
			<Button text="공개 위치 구경하기" href="/public" isLoading={false} />
		</div>
	);
}
