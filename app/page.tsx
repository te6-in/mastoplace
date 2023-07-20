import { Layout } from "@/components/Layout";
import { FloatingButton } from "@/components/Layout/FloatingButton";
import { Pencil } from "lucide-react";

export default function Home() {
	return (
		<Layout title="홈" showBackground showTabBar isPublic>
			<FloatingButton Icon={Pencil} text="새로운 글 작성" href="/status/new" />
		</Layout>
	);
}
