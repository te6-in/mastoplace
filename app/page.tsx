"use client";

import { Layout } from "@/components/Layout";
import { FloatingButton } from "@/components/Layout/FloatingButton";
import { MapPin } from "lucide-react";

export default function Home() {
	return (
		<Layout title="홈" showBackground showTabBar hasFloatingButton isPublic>
			<FloatingButton Icon={MapPin} text="새 위치 태그" href="/new" />
		</Layout>
	);
}
