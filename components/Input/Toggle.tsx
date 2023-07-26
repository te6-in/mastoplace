import { Dispatch, SetStateAction, useEffect, useRef } from "react";

interface ToggleProps {
	title: string;
	label: string;
	isChecked: boolean;
	setChecked: Dispatch<SetStateAction<boolean>>;
}

export function Toggle({ title, label, isChecked, setChecked }: ToggleProps) {
	const ref = useRef<HTMLInputElement>(null);

	const onChange = () => {
		setChecked((prev) => !prev);
	};

	useEffect(() => {
		if (isChecked && ref.current) {
			ref.current.checked = true;
		}
	}, [isChecked]);

	return (
		<div className="flex flex-col">
			<label className="group flex items-center justify-between gap-1.5">
				<span className="flex-1 font-medium text-slate-900 dark:text-zinc-100">
					{title}
				</span>
				<input
					type="checkbox"
					className="peer h-0 w-0 opacity-0"
					onChange={onChange}
					ref={ref}
				/>
				<span className="relative h-6 w-10 rounded-full bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-slate-300 dark:ring-zinc-700 transition-colors after:absolute after:top-1 after:h-4 after:w-4 after:translate-x-1 after:rounded-full after:bg-slate-400 dark:after:bg-zinc-600 after:transition-all group-hover:after:translate-x-2 peer-checked:bg-slate-50 dark:peer-checked:bg-zinc-900 peer-checked:after:translate-x-5 peer-checked:after:bg-violet-500 dark:peer-checked:after:bg-violet-600 group-hover:peer-checked:after:translate-x-4"></span>
			</label>
			<span className="text-sm text-slate-500 dark:text-zinc-500">{label}</span>
		</div>
	);
}
