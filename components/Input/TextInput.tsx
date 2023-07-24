import { Label } from "@/components/Input/Label";
import { j } from "@/libs/client/utils";
import { Fragment } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

export type TextFieldType = "text" | "number" | "email" | "tel";

interface TextFieldProps {
	register: UseFormRegisterReturn;
	type: TextFieldType;
	id: string;
	label: string;
	placeholder: string;
	prefix?: string;
	suffix?: string;
	isSubmitted?: boolean;
	error?: string;
}

export function TextInput({
	register,
	type,
	id,
	label,
	placeholder,
	prefix,
	suffix,
	isSubmitted,
	error,
}: TextFieldProps) {
	const Tag = prefix ?? suffix ? "div" : Fragment;

	return (
		<div className="flex flex-col">
			<div className="mb-1 flex flex-wrap justify-between px-1 text-sm font-medium">
				<Label text={label} id={id} />
				{error && (
					<span className="text-red-500 break-keep text-right motion-safe:animate-shake ml-auto">
						{error}
					</span>
				)}
			</div>
			<Tag
				{...((prefix ?? suffix) && { className: "flex rounded-md shadow-sm" })}
			>
				{prefix && (
					<span className="flex select-none items-center justify-center rounded-l-md border border-r-0 border-slate-300 bg-slate-50 px-3 pb-0.5 text-sm text-slate-500">
						{prefix}
					</span>
				)}
				<input
					{...register}
					type={type}
					inputMode={type === "number" ? "numeric" : type}
					id={id}
					className={j(
						"w-full appearance-none border px-3 py-2 text-slate-900 placeholder-slate-400",
						isSubmitted
							? error
								? "border-red-500 ring-1 ring-red-500"
								: "border-green-500 ring-1 ring-green-500"
							: "border-slate-300",
						prefix && suffix
							? ""
							: prefix
							? "rounded-r-md"
							: suffix
							? "rounded-l-md"
							: "rounded-md shadow-sm"
					)}
					placeholder={placeholder}
				/>
				{suffix && (
					<span className="flex select-none items-center justify-center rounded-r-md border border-l-0 border-slate-300 bg-slate-50 px-3 pb-0.5 text-sm text-slate-500">
						{suffix}
					</span>
				)}
			</Tag>
		</div>
	);
}
