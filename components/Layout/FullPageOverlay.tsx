import { motion, useAnimate } from "framer-motion";
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
	const [scope, animate] = useAnimate();

	const onBackClick = () => {
		animate(scope.current, { y: 300, opacity: 0, duration: 0.35 });
		setTimeout(() => {
			router.back();
		}, 350);
	};

	return (
		<div>
			<motion.div
				ref={scope}
				initial={{ y: -300, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 300, opacity: 0 }}
				transition={{ duration: 0.35, bounce: 0.3, type: "spring" }}
				className="fixed inset-0 z-30 justify-center items-center bg-white rounded-xl py-7 pb-5 shadow-xl sm:w-[36rem] w-11/12 border flex flex-col gap-3 h-fit max-h-overlaySheet m-auto"
			>
				<div className="overflow-y-auto px-7 w-full">{component}</div>
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
			</motion.div>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.35, bounce: 0.3, type: "spring" }}
				className="bg-slate-200 backdrop-blur-sm bg-opacity-70 w-full h-full fixed inset-0 z-20"
			></motion.div>
		</div>
	);
}
