"use client";

import { useMediaQuery } from "@react-hook/media-query";
import { SkeletonTheme } from "react-loading-skeleton";

interface SkeletonProviderProps {
	children: React.ReactNode;
}

export function SkeletonProvider({ children }: SkeletonProviderProps) {
	const dark = useMediaQuery("(prefers-color-scheme: dark)");
	const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

	return (
		<SkeletonTheme
			duration={2}
			enableAnimation={!reducedMotion}
			borderRadius="0.375rem"
			baseColor={dark ? "#18181b" : "#e2e8f0"}
			highlightColor={dark ? "#27272a" : "#cbd5e1"}
		>
			{children}
		</SkeletonTheme>
	);
}
