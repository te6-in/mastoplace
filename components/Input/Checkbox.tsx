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
		<div className={j("flex flex-col", disabled ? "opacity-50" : "")}>
			<div className="flex items-center justify-between gap-1.5">
				<input
					{...register}
					type="checkbox"
					id={id}
					className={j(
						"h-5 w-5 rounded-md transition-colors border-slate-300 text-violet-500 shadow-sm",
						disabled ? "bg-slate-100" : ""
					)}
					disabled={disabled}
				/>
				<label htmlFor={id} className="flex-1 font-medium text-slate-900">
					{title}
				</label>
			</div>
			{label && (
				<span className="ml-[1.6875rem] text-sm text-slate-500">{label}</span>
			)}
		</div>
	);
}
