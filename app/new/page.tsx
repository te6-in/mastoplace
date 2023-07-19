import { Layout } from "@/components/Layout";
import { BottomToolbar } from "@/components/Layout/BottomToolbar";
import { Check } from "lucide-react";

export default function New() {
	return (
		<Layout title="새 위치 태그" showBackground showBackButton hasBottomToolbar>
			<BottomToolbar
				primaryButton={{ icon: Check, text: "게시", isLoading: true }}
			/>
		</Layout>
	);
}
