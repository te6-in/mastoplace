"use client";

import { Layout } from "@/components/Layout";
import { FloatingButton } from "@/components/Layout/FloatingButton";
import { PigeonMap } from "@/components/PigeonMap";
import { useLocation } from "@/libs/client/useLocation";
import { j } from "@/libs/client/utils";
import { Pencil } from "lucide-react";

export default function Map() {
	const { latitude, longitude } = useLocation();

	return (
		<Layout noScroll showTabBar hasFloatingButton>
			{latitude && longitude && (
				<PigeonMap
					exact={true}
					position={{ latitude, longitude }}
					className={j("h-screen w-full sm:rounded-2xl")}
				/>
			)}
			<FloatingButton Icon={Pencil} text="새로운 글 작성" href="/status/new" />
		</Layout>
	);
}
