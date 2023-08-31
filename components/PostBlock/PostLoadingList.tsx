import { PostBlockLoading } from "@/components/PostBlock";
import { j } from "@/libs/client/utils";

interface PostLoadingListProps {
	dividerPadding?: boolean;
}

export function PostLoadingList({
	dividerPadding = false,
}: PostLoadingListProps) {
	return (
		<ol
			className={j(
				"divide-y divide-slate-200 dark:divide-zinc-800",
				dividerPadding ? "px-4" : ""
			)}
		>
			{["opacity-100", "opcaity-70", "opacity-40"].map((className, index) => (
				<li
					key={index}
					className={j(dividerPadding ? "py-4" : "p-4", className)}
				>
					<PostBlockLoading />
				</li>
			))}
		</ol>
	);
}
