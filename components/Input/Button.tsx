import { j } from "@/libs/client/utils";
import { Loader2, LucideIcon } from "lucide-react";
import Link from "next/link";

interface ButtonProps {
	isPrimary?: boolean;
	isLoading: boolean;
	disabled?: boolean;
	Icon?: LucideIcon;
	iconFill?: boolean;
	text?: string;
	onClick?: () => void;
	href?: string;
	newTab?: boolean;
}

export function Button({
	isPrimary,
	isLoading,
	disabled,
	Icon,
	iconFill,
	text,
	onClick,
	href,
	newTab,
}: ButtonProps) {
	const Tag = href ? Link : "button";
	return (
		<Tag
			href={disabled ? "" : href ?? ""}
			rel={newTab ? "noopener noreferrer" : undefined}
			target={newTab ? "_blank" : undefined}
			className={j(
				"flex items-center border justify-center rounded-md px-4 py-2 w-full shadow-sm transition-all",
				isPrimary
					? "border-violet-500 bg-violet-500 font-medium  text-white"
					: "border-slate-300 bg-white text-slate-700",
				isLoading || disabled
					? "cursor-default opacity-60"
					: isPrimary
					? "hover:bg-violet-600 active:bg-violet-700"
					: "hover:bg-slate-100 active:bg-slate-200"
			)}
			onClick={onClick}
			disabled={isLoading || disabled}
		>
			{isLoading ? (
				<Loader2 className="animate-spin shrink-0" />
			) : (
				Icon && (
					<Icon
						className="shrink-0"
						strokeWidth={iconFill ? 1 : undefined}
						fill={iconFill ? "currentColor" : "transparent"}
					/>
				)
			)}
			{text && <span className="ml-2 mr-1 break-keep text-center">{text}</span>}
		</Tag>
	);
}
