import { StatusButton } from "@/components/StatusBlock/StatusButtons/StatusButton";
import Link from "next/link";

interface StatusButtonsProps {
	original: string;
}

export function StatusButtons({ original }: StatusButtonsProps) {
	return (
		<div className="flex justify-between mt-2">
			<Link href={original}>
				<StatusButton type="open" />
			</Link>
			<StatusButton type="boost" />
			<StatusButton type="like" />
			<StatusButton type="bookmark" />
		</div>
	);
}
