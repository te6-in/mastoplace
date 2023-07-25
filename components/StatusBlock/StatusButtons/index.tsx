import { StatusButton } from "@/components/StatusBlock/StatusButtons/StatusButton";
import Link from "next/link";

interface StatusButtonsProps {
	original: string;
	id: string | null;
	fromMe?: boolean;
}

export function StatusButtons({ original, id, fromMe }: StatusButtonsProps) {
	return (
		<div className="flex justify-between mt-2">
			<Link href={original} rel="noopener noreferrer" target="_blank">
				<StatusButton type="open" />
			</Link>
			<StatusButton type="boost" />
			<StatusButton type="like" />
			<StatusButton type="bookmark" />
			{fromMe && <StatusButton type="delete" id={id} />}
		</div>
	);
}
