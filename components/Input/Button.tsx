import { j } from "@/libs/client/utils";
import { Loader2, LucideIcon } from "lucide-react";

interface ButtonProps {
	isPrimary?: boolean;
	isLoading: boolean;
	Icon?: LucideIcon;
	iconFill?: boolean;
	text?: string;
}

export function Button({
	isPrimary,
	isLoading,
	Icon,
	iconFill,
	text,
}: ButtonProps) {
	return (
		<button
			className={j(
				"flex items-center justify-center rounded-md px-4 py-2 shadow-sm transition-all",
				isPrimary
					? "bg-violet-500 font-medium  text-white"
					: "border border-slate-300 bg-white text-slate-700",
				isLoading
					? "cursor-default opacity-60"
					: isPrimary
					? "hover:bg-violet-600 active:bg-violet-700"
					: "hover:bg-slate-100 active:bg-slate-200"
			)}
		>
			{isLoading ? (
				<Loader2 className="animate-spin" />
			) : (
				Icon && (
					<Icon
						strokeWidth={iconFill ? 1 : undefined}
						fill={iconFill ? "currentColor" : "transparent"}
					/>
				)
			)}
			{text && <span className="ml-2 mr-1">{text}</span>}
		</button>
	);
}
