import { j } from "@/libs/client/utils";
import { UseFormRegisterReturn } from "react-hook-form";

interface CheckboxProps {
	register: UseFormRegisterReturn;
	id: string;
	title: string;
	label: string;
	disabled?: boolean;
}

export function Checkbox({
	register,
	id,
	title,
	label,
	disabled,
}: CheckboxProps) {
	return (
		<div
			className={j(
				"flex flex-col transition-opacity",
				disabled ? "opacity-50" : ""
			)}
		>
			<div className="flex items-center justify-between gap-1.5">
				<input
					{...register}
					type="checkbox"
					id={id}
					className={j(
						"h-5 w-5 rounded-md transition-colors border-slate-300 dark:border-zinc-700 text-violet-500 shadow-sm dark:text-violet-600 bg-white dark:bg-zinc-900",
						disabled ? "bg-slate-100 dark:bg-zinc-950" : ""
					)}
					disabled={disabled}
				/>
				<label
					htmlFor={id}
					className="flex-1 font-medium text-slate-900 dark:text-zinc-100"
				>
					{title}
				</label>
			</div>
			{label && (
				<span className="ml-[1.625rem] text-sm text-slate-500 dark:text-zinc-500">
					{label}
				</span>
			)}
		</div>
	);
}
