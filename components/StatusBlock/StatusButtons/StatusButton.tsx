import { j } from "@/libs/client/utils";
import { ArrowUpRightSquare, Bookmark, Rocket, Star } from "lucide-react";

interface StatusButtonProps {
	type: "open" | "boost" | "like" | "bookmark";
}

export function StatusButton({ type }: StatusButtonProps) {
	const Icon = {
		open: ArrowUpRightSquare,
		boost: Rocket,
		like: Star,
		bookmark: Bookmark,
	}[type];

	const label = {
		open: "원본 열기",
		boost: "부스트",
		like: "좋아요",
		bookmark: "보관함에 추가",
	}[type];

	return (
		<button
			className={j(
				"flex text-slate-600 p-1 rounded-md transition-colors",
				type === "open" ? "hover:bg-slate-100 active:bg-slate-200" : "",
				type === "boost"
					? "hover:bg-emerald-100 active:bg-emerald-200 hover:text-emerald-600"
					: "",
				type === "like"
					? "hover:bg-yellow-100 active:bg-yellow-200 hover:text-yellow-600"
					: "",
				type === "bookmark"
					? "hover:bg-rose-100 active:bg-rose-200 hover:text-rose-600"
					: ""
			)}
			aria-label={label}
		>
			<Icon />
		</button>
	);
}
