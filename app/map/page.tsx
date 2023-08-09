"use client";

import { Layout } from "@/components/Layout";
import { FloatingButton } from "@/components/Layout/FloatingButton";
import { PigeonMap } from "@/components/PigeonMap";
import { useLocation } from "@/libs/client/useLocation";
import { j } from "@/libs/client/utils";
import { Pencil } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

export default function Map() {
	const { latitude, longitude } = useLocation();
	const { t } = useTranslation();

	return (
		<Layout noScroll showTabBar hasFloatingButton>
			{latitude && longitude && (
				<PigeonMap
					exact={true}
					position={{ latitude, longitude }}
					className={j("h-screen w-full sm:rounded-2xl")}
				/>
			)}
			<FloatingButton
				Icon={Pencil}
				text={t("action.new-post")}
				href="/post/new"
			/>
		</Layout>
	);
}
