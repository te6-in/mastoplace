import { Label } from "@/components/Input/Label";
import { UseFormRegisterReturn } from "react-hook-form";

interface TextAreaProps {
	register: UseFormRegisterReturn;
	id: string;
	label: string;
	rows: number;
	placeholder: string;
	error?: string;
}

export function TextArea({
	register,
	id,
	label,
	rows,
	placeholder,
	error,
}: TextAreaProps) {
	return (
		<div className="flex flex-col">
			<div className="mb-1 flex justify-between px-1 text-sm font-medium">
				<Label text={label} id={id} />
				{error && (
					<span className="text-red-500 motion-safe:animate-shake">
						{error}
					</span>
				)}
			</div>
			<textarea
				{...register}
				rows={rows}
				id={id}
				placeholder={placeholder}
				className="w-full resize-none appearance-none rounded-md border border-slate-300 dark:border-zinc-700 px-3 py-2 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 shadow-sm bg-white dark:bg-zinc-900"
			/>
		</div>
	);
}
