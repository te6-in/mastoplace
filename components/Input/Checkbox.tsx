import { UseFormRegisterReturn } from "react-hook-form";

interface CheckboxProps {
	register: UseFormRegisterReturn;
	id: string;
	title: string;
	label: string;
}

export function Checkbox({ register, id, title, label }: CheckboxProps) {
	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between gap-1.5">
				<input
					{...register}
					type="checkbox"
					id={id}
					className="h-5 w-5 rounded-md border-slate-300 text-violet-500 shadow-sm"
				/>
				<label htmlFor={id} className="flex-1 font-medium text-slate-900">
					{title}
				</label>
			</div>
			<span className="ml-[1.6875rem] text-sm text-slate-500">{label}</span>
		</div>
	);
}
