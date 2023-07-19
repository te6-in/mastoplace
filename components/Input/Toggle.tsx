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
				<span className="flex-1 font-medium text-slate-900">{title}</span>
				<input
					type="checkbox"
					className="peer h-0 w-0 opacity-0"
					onChange={onChange}
					ref={ref}
				/>
				<span className="relative h-6 w-10 rounded-full bg-slate-50 shadow-sm ring-1 ring-slate-300 transition-colors after:absolute after:top-1 after:h-4 after:w-4 after:translate-x-1 after:rounded-full after:bg-slate-400 after:transition-all group-hover:after:translate-x-2 peer-checked:bg-white peer-checked:after:translate-x-5 peer-checked:after:bg-violet-500 group-hover:peer-checked:after:translate-x-4"></span>
			</label>
			<span className="text-sm text-slate-500">{label}</span>
		</div>
	);
}
