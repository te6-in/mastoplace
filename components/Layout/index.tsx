import { Header, HeaderProps } from "@/components/Layout/Header";
import { TabBar } from "@/components/Layout/TabBar";
import { j } from "@/libs/client/utils";

interface LayoutProps extends HeaderProps {
	showTabBar?: boolean;
	hideTabBarCompletely?: boolean;
	hasFloatingButton?: boolean;
	hasBottomToolbar?: boolean;
	redirectIfNotLoggedIn?: string;
	noScroll?: boolean;
	children: React.ReactNode;
}

export function Layout({
	title,
	showBackground,
	showBackButton,
	showTabBar,
	hideTabBarCompletely,
	hasFloatingButton,
	hasBottomToolbar,
	noScroll,
	children,
}: LayoutProps) {
	return (
		<div>
			<Header
				showBackground={showBackground}
				showBackButton={showBackButton}
				title={title}
			/>
			{!hideTabBarCompletely && <TabBar show={showTabBar} />}
			<main
				className={j(
					"mx-auto overflow-x-hidden bg-slate-50 dark:bg-zinc-950",
					hideTabBarCompletely ? "max-w-xl sm:pl-0" : "max-w-3xl sm:pl-48",
					showBackground ? "pt-12 sm:pt-16" : showBackButton ? "sm:pt-16" : "",
					hasBottomToolbar ? "pb-20 sm:pb-28" : "",
					hasFloatingButton && showTabBar
						? noScroll
							? ""
							: "pb-36 sm:pb-20"
						: "",
					showTabBar ? (noScroll ? "" : "pb-14 sm:pb-0") : ""
				)}
			>
				{children}
			</main>
		</div>
	);
}
