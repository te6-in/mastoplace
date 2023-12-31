import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface FloatingButtonProps {
	Icon: LucideIcon;
	text?: string;
	href: string;
}

export function FloatingButton({ Icon, text, href }: FloatingButtonProps) {
	return (
		<Link
			className="fixed z-10 bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 flex items-center justify-center gap-2 rounded-2xl bg-violet-500 p-4 font-medium text-white shadow-md transition-colors hover:bg-violet-600 active:bg-violet-700 sm:bottom-6 sm:right-1/2 sm:translate-x-[calc(50%+6rem)] dark:bg-violet-600 dark:hover:bg-violet-700 dark:active:bg-violet-800"
			href={href}
		>
			<Icon />
			{text}
		</Link>
	);
}
