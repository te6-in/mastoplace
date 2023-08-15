import { visibilitySet } from "@/components/PostBlock/Visibility";
import { j } from "@/libs/client/utils";
import { mastodon } from "masto";
import useTranslation from "next-translate/useTranslation";
import { UseFormRegisterReturn } from "react-hook-form";

interface VisibilitySelectorProps {
	register: UseFormRegisterReturn;
	disabled: boolean;
	error?: string;
}

export function VisibilitySelector({
	register,
	disabled,
	error,
}: VisibilitySelectorProps) {
	const { t } = useTranslation();

	return (
		<div
			className={j(
				"flex flex-col",
				disabled ? "cursor-not-allowed opacity-60" : ""
			)}
		>
			<div className="mb-1 flex justify-between px-1 text-sm font-medium">
				<span className="text-slate-700 dark:text-zinc-300 mr-1 break-keep">
					{t("new-post.visibility.label")}
				</span>
				{error && (
					<span className="text-red-500 motion-safe:animate-shake">
						{error}
					</span>
				)}
			</div>
			<fieldset className="grid gap-1.5 grid-cols-4 p-2 pb-1.5 rounded-md shadow-sm border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 border">
				<Input register={register} visibility="public" disabled={disabled} />
				<Input register={register} visibility="unlisted" disabled={disabled} />
				<Input register={register} visibility="private" disabled={disabled} />
				<Input register={register} visibility="direct" disabled={disabled} />
			</fieldset>
		</div>
	);
}

interface InputProps {
	visibility: mastodon.v1.StatusVisibility;
	register: UseFormRegisterReturn;
	disabled: boolean;
}

function Input({ visibility, register, disabled }: InputProps) {
	const Icon = visibilitySet(visibility).Icon;

	return (
		<label className="flex flex-col gap-1">
			<div className="relative">
				<input
					{...register}
					className="flex items-center justify-center rounded h-10 w-full checked:bg-violet-500 checked:hover:bg-violet-500 focus-within:checked:bg-violet-500 dark:checked:bg-violet-600 dark:checked:hover:bg-violet-600 dark:focus-within:checked:bg-violet-600 shadow-sm border-slate-300 dark:border-zinc-700 checked:bg-none peer transition-colors bg-white dark:bg-zinc-950"
					name="visibility"
					type="radio"
					value={visibility}
					disabled={disabled}
				/>
				<Icon
					className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-slate-700 dark:text-zinc-300 peer-checked:text-white"
					width={20}
					height={20}
				/>
			</div>
			<div className="break-keep px-0.5 text-sm text-slate-500 dark:text-zinc-500 font-medium text-center">
				{visibilitySet(visibility).text}
			</div>
		</label>
	);
}
