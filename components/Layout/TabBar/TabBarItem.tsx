import { j } from "@/libs/client/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabBarItemProps {
	Icon: LucideIcon;
	text: string;
	href: string;
}

export function TabBarItem({ Icon, text, href }: TabBarItemProps) {
	const pathname = usePathname();
	const didMatch = href === "/" ? pathname === "/" : pathname?.startsWith(href);

	return (
		<Link
			className={j(
				"flex flex-col items-center justify-center gap-1 rounded-xl  transition-colors sm:flex-row sm:justify-start sm:gap-2 sm:p-4 sm:hover:bg-slate-200 sm:active:bg-slate-300 dark:sm:hover:bg-zinc-900 dark:sm:active:bg-zinc-800",
				didMatch ? "text-violet-600" : "text-slate-700 dark:text-zinc-300"
			)}
			href={href}
		>
			<Icon className="sm:h-7 sm:w-7" width={20} height={20} />
			<span className="text-xs font-medium sm:text-base sm:font-semibold">
				{text}
			</span>
		</Link>
	);
}
