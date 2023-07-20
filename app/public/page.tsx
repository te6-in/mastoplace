import { Layout } from "@/components/Layout";
import { FloatingButton } from "@/components/Layout/FloatingButton";
import { Pencil } from "lucide-react";

export default function Public() {
	return (
		<Layout
			title="공개 위치"
			showBackground
			showTabBar
			hasFloatingButton
			isPublic
		>
			<FloatingButton Icon={Pencil} text="새로운 글 작성" href="/status/new" />
		</Layout>
	);
}
