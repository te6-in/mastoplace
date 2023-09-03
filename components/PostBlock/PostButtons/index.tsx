import { PostBlockPost } from "@/components/PostBlock";
import { PostButton } from "@/components/PostBlock/PostButtons/PostButton";
import Link from "next/link";

interface PostButtonsProps {
	original: string;
	id: string;
	clientHandle: string;
	clientServer: string;
	postBlock: PostBlockPost;
	fromMe?: boolean;
}

export function PostButtons({
	original,
	id,
	fromMe,
	clientHandle,
	clientServer,
	postBlock,
}: PostButtonsProps) {
	return (
		<div className="flex justify-between mt-2">
			<Link href={original} rel="noopener noreferrer" target="_blank">
				<PostButton type="open" />
			</Link>
			<PostButton type="boost" />
			<PostButton type="like" />
			<PostButton type="bookmark" />
			{fromMe && (
				<PostButton
					type="delete"
					deleteInfo={{
						id,
						clientHandle,
						clientServer,
						postBlock,
					}}
				/>
			)}
		</div>
	);
}
