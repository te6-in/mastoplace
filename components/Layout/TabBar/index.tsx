import { TabBarItem } from "@/components/Layout/TabBar/TabBarItem";
import { j } from "@/libs/client/utils";
import { Globe2, Map, Newspaper, UserCircle2 } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

interface TabBarProps {
	show?: boolean;
}

export function TabBar({ show }: TabBarProps) {
	const { t } = useTranslation();

	return (
		<nav
			className={j(
				"fixed z-10 bottom-0 h-[calc(3.5rem+env(safe-area-inset-bottom))] w-full grid-cols-4 border-t border-slate-300 dark:bg-zinc-950 border-opacity-60 bg-slate-50 bg-opacity-50 dark:bg-opacity-50 dark:border-zinc-700 dark:border-opacity-60 pb-[env(safe-area-inset-bottom)] shadow-upward-sm  backdrop-blur sm:left-8 sm:top-1/2 sm:flex sm:h-fit sm:max-h-screen sm:w-32 sm:-translate-y-1/2 sm:flex-col sm:gap-1 sm:overflow-auto sm:border-none sm:bg-transparent sm:py-4 sm:shadow-none sm:backdrop-blur-none",
				show ? "grid" : "hidden"
			)}
		>
			<TabBarItem Icon={Newspaper} text={t`tabbar.home`} href="/" />
			<TabBarItem Icon={Globe2} text={t`tabbar.public`} href="/public" />
			<TabBarItem Icon={Map} text={t`tabbar.map`} href="/map" />
			<TabBarItem Icon={UserCircle2} text={t`tabbar.profile`} href="/profile" />
		</nav>
	);
}
