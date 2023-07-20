"use client";

import { TabBarItem } from "@/components/Layout/TabBar/TabBarItem";
import { j } from "@/libs/client/utils";
import { Map, Newspaper, Radar } from "lucide-react";

interface TabBarProps {
	show?: boolean;
}

export function TabBar({ show }: TabBarProps) {
	return (
		<nav
			className={j(
				"fixed z-10 bottom-0 h-[calc(3.5rem+env(safe-area-inset-bottom))] w-full grid-cols-3 border-t border-slate-300 border-opacity-60 bg-white bg-opacity-50 pb-[env(safe-area-inset-bottom)] shadow-upward-sm  backdrop-blur sm:left-8 sm:top-1/2 sm:flex sm:h-fit sm:max-h-screen sm:w-32 sm:-translate-y-1/2 sm:flex-col sm:gap-1 sm:overflow-auto sm:border-none sm:bg-transparent sm:py-4 sm:shadow-none sm:backdrop-blur-none",
				show ? "grid" : "hidden"
			)}
		>
			<TabBarItem Icon={Newspaper} text="홈" href="/" />
			<TabBarItem Icon={Radar} text="공개 위치" href="/public" />
			<TabBarItem Icon={Map} text="지도" href="/map" />
		</nav>
	);
}
