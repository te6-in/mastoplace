import { PostButton } from "@/components/PostBlock/PostButtons/PostButton";
import Link from "next/link";

interface PostButtonsProps {
	original: string;
	id: string | null;
	fromMe?: boolean;
}

export function PostButtons({ original, id, fromMe }: PostButtonsProps) {
	return (
		<div className="flex justify-between mt-2">
			<Link href={original} rel="noopener noreferrer" target="_blank">
				<PostButton type="open" />
			</Link>
			<PostButton type="boost" />
			<PostButton type="like" />
			<PostButton type="bookmark" />
			{fromMe && <PostButton type="delete" id={id} />}
		</div>
	);
}
