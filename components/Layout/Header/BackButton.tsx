"use client";

import { j } from "@/libs/client/utils";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
	isFloating: boolean;
}

export function BackButton({ isFloating }: BackButtonProps) {
	const router = useRouter();
	const onBackButtonClick = () => {
		router.back();
	};

	return (
		<button
			onClick={onBackButtonClick}
			className={j(
				"absolute left-0 flex aspect-square h-full items-center justify-center pr-0.5 sm:left-48",
				isFloating
					? "pointer-events-auto m-2 rounded-full bg-slate-50 bg-opacity-50 text-slate-900 shadow backdrop-blur sm:shadow-none dark:bg-zinc-950 dark:text-zinc-100 dark:bg-opacity-50"
					: ""
			)}
		>
			<ChevronLeft />
		</button>
	);
}
