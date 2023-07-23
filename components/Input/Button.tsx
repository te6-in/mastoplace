import { j } from "@/libs/client/utils";
import { Loader2, LucideIcon } from "lucide-react";
import Link from "next/link";

interface ButtonProps {
	isPrimary?: boolean;
	isLoading: boolean;
	Icon?: LucideIcon;
	iconFill?: boolean;
	text?: string;
	onClick?: () => void;
	href?: string;
}

export function Button({
	isPrimary,
	isLoading,
	Icon,
	iconFill,
	text,
	onClick,
	href,
}: ButtonProps) {
	const Tag = href ? Link : "button";
	return (
		<Tag
			href={href ?? ""}
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
			onClick={onClick}
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
		</Tag>
	);
}
