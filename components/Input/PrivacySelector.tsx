import { privacySet } from "@/components/StatusBlock/Privacy";
import { mastodon } from "masto";
import { UseFormRegisterReturn } from "react-hook-form";

interface PrivacySelectorProps {
	register: UseFormRegisterReturn;
	error?: string;
}

export function PrivacySelector({ register, error }: PrivacySelectorProps) {
	return (
		<div className="flex flex-col">
			<div className="mb-1 flex justify-between px-1 text-sm font-medium">
				<span className="text-slate-700 mr-1 break-keep">공개 범위</span>
				{error && (
					<span className="text-red-500 motion-safe:animate-shake">
						{error}
					</span>
				)}
			</div>
			<fieldset className="grid gap-1.5 grid-cols-4 p-2 pb-1.5 rounded-md shadow-sm border-slate-300 border">
				<Input register={register} privacy="public" />
				<Input register={register} privacy="unlisted" />
				<Input register={register} privacy="private" />
				<Input register={register} privacy="direct" />
			</fieldset>
		</div>
	);
}

interface InputProps {
	privacy: mastodon.v1.StatusVisibility;
	register: UseFormRegisterReturn;
}

function Input({ privacy, register }: InputProps) {
	const Icon = privacySet(privacy).Icon;

	return (
		<label className="text-slate-700 flex flex-col gap-1">
			<div className="relative">
				<input
					{...register}
					className="flex items-center justify-center rounded h-10 w-full checked:bg-violet-500 checked:hover:bg-violet-500 focus-within:checked:bg-violet-500 shadow-sm border-slate-300 checked:bg-none peer transition-colors"
					name="privacy"
					type="radio"
					value={privacy}
				/>
				<Icon
					className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 peer-checked:text-white"
					width={20}
					height={20}
				/>
			</div>
			<div className="break-keep px-0.5 text-sm text-slate-500 font-medium text-center">
				{privacySet(privacy).text}
			</div>
		</label>
	);
}
