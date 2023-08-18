import { j } from "@/libs/client/utils";
import { Loader2, LucideIcon } from "lucide-react";
import Link from "next/link";
import TextTransition from "react-text-transition";

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
	animateText?: boolean;
	event: string;
	eventData?: {
		[key: string]: string;
	};
	className?: string;
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
	animateText,
	event,
	eventData,
	className,
}: ButtonProps) {
	const Tag = href ? Link : "button";

	const eventDataProps: any = {};

	for (let key in eventData ?? {}) {
		eventDataProps[`data-umami-event-${key}`] = eventData?.[key];
	}

	return (
		<Tag
			href={disabled ? "" : href ?? ""}
			rel={newTab ? "noopener noreferrer" : undefined}
			target={newTab ? "_blank" : undefined}
			data-umami-event={event}
			className={j(
				"flex items-center border justify-center rounded-md px-4 py-2 w-full shadow-sm transition-all",
				isPrimary
					? "border-violet-500 bg-violet-500 font-medium text-white dark:border-violet-600 dark:bg-violet-600"
					: "border-slate-200 bg-white text-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
				isLoading || disabled
					? "cursor-default opacity-60"
					: isPrimary
					? "hover:bg-violet-600 active:bg-violet-700 dark:hover:bg-violet-700 dark:active:bg-violet-800"
					: "hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700",
				className ?? ""
			)}
			onClick={onClick}
			disabled={isLoading || disabled}
			{...eventDataProps}
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
			{text &&
				(animateText ? (
					<TextTransition
						inline
						className="ml-2 mr-1 break-keep text-center leading-5"
					>
						{text}
					</TextTransition>
				) : (
					<span className="ml-2 mr-1 break-keep text-center leading-5">
						{text}
					</span>
				))}
		</Tag>
	);
}
