import { ChevronLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface FullPageOverlayProps {
	type: "back" | "close";
	buttonLabel?: string;
	onCloseClick?: () => void;
	component: React.ReactNode;
}

export function FullPageOverlay({
	type,
	buttonLabel,
	onCloseClick,
	component,
}: FullPageOverlayProps) {
	const router = useRouter();

	const onBackClick = () => {
		router.back();
	};

	return (
		<div className="fixed backdrop-blur-sm bg-slate-200 bg-opacity-70 inset-0 z-20 flex justify-center items-center">
			<div className="bg-white rounded-xl py-7 pb-5 shadow-xl sm:w-[36rem] w-11/12 border flex flex-col gap-3 max-h-overlaySheet">
				<div className="overflow-y-auto px-7">{component}</div>
				<button
					className="flex gap-1 items-center text-sm text-slate-500 font-semibold p-2 hover:bg-slate-100 active:bg-slate-200 w-fit rounded-md transition-colors mx-auto"
					onClick={type === "back" ? onBackClick : onCloseClick}
				>
					{type === "back" && <ChevronLeft width={20} height={20} />}
					{type === "close" && <X width={20} height={20} />}
					<span className="pr-2">
						{type === "back" && (buttonLabel ?? "이전 화면으로")}
						{type === "close" && (buttonLabel ?? "창 닫기")}
					</span>
				</button>
			</div>
		</div>
	);
}
