import { BackButton } from "@/components/Layout/Header/BackButton";
import { j } from "@/libs/client/utils";

export interface HeaderProps {
	showBackground?: boolean;
	showBackButton?: boolean;
	title?: string;
}

export function Header({ showBackground, showBackButton, title }: HeaderProps) {
	return showBackground ? (
		<header className="fixed flex h-12 w-full max-w-3xl items-center justify-center bg-white bg-opacity-50 text-slate-900 backdrop-blur sm:left-1/2 sm:h-16 sm:-translate-x-1/2 sm:pl-40">
			{showBackButton && <BackButton isFloating={false} />}
			{title && (
				<h1
					className={j(
						"w-full px-2 pb-0.5 text-center text-lg font-medium sm:pb-1 sm:text-left sm:text-xl sm:font-semibold",
						showBackButton ? "sm:pl-24" : "sm:pl-12"
					)}
				>
					{title}
				</h1>
			)}
		</header>
	) : (
		showBackButton && (
			<header className="pointer-events-none fixed z-10 flex h-8 w-full max-w-3xl sm:left-1/2 sm:h-12 sm:-translate-x-1/2 sm:pl-40">
				<BackButton isFloating />
			</header>
		)
	);
}
