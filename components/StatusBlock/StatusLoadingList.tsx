import { StatusBlock } from "@/components/StatusBlock";
import { j } from "@/libs/client/utils";

interface StatusLoadingListProps {
	dividerPadding?: boolean;
}

export function StatusLoadingList({
	dividerPadding = false,
}: StatusLoadingListProps) {
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
					<StatusBlock id={null} />
				</li>
			))}
		</ol>
	);
}
