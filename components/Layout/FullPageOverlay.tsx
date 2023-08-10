import { motion, useAnimate } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
	const [card, animateCard] = useAnimate();
	const [overlay, animateOverlay] = useAnimate();
	const { t } = useTranslation();

	const onBackClick = () => {
		animateCard(card.current, { y: 600, opacity: 0, duration: 0.5 });
		animateOverlay(overlay.current, { opacity: 0, duration: 0.35 });
		setTimeout(() => {
			router.back();
		}, 500);
	};

	useEffect(() => {
		document.body.style.overflowY = "hidden";

		return () => {
			document.body.style.overflowY = "auto";
		};
	}, []);

	return (
		<div>
			<motion.div
				ref={card}
				initial={{ y: -600, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 600, opacity: 0 }}
				transition={{ duration: 0.5, bounce: 0.3, type: "spring" }}
				className="fixed inset-0 z-30 justify-center items-center bg-slate-50 dark:bg-zinc-950 rounded-xl shadow-xl sm:w-[36rem] w-11/12 border border-slate-300 dark:border-zinc-700 flex flex-col gap-3 h-fit max-h-overlaySheet m-auto overflow-hidden"
			>
				<div className="overflow-y-auto p-7 pb-[5.5rem] w-full relative">
					{component}
				</div>
				<div className="flex items-center justify-center absolute bottom-0 w-full z-10 bg-slate-50 dark:bg-zinc-950 bg-opacity-50 dark:bg-opacity-50 backdrop-blur border-t border-slate-300 dark:border-zinc-700">
					<button
						className="flex gap-1 items-center text-sm text-slate-500 dark:text-zinc-500 font-semibold p-2 mt-3 mb-4 hover:bg-slate-400 dark:hover:bg-zinc-600 hover:bg-opacity-20 dark:hover:bg-opacity-20 active:bg-opacity-30 dark:active:bg-opacity-30 w-fit rounded-md transition-colors mx-auto"
						onClick={type === "back" ? onBackClick : onCloseClick}
					>
						{type === "back" && <ChevronLeft width={20} height={20} />}
						{type === "close" && <X width={20} height={20} />}
						<span className="pr-0.5">
							{type === "back" && (buttonLabel ?? t("action.back"))}
							{type === "close" && (buttonLabel ?? t("action.close-modal"))}
						</span>
					</button>
				</div>
			</motion.div>
			<motion.div
				ref={overlay}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.35, bounce: 0.3, type: "spring" }}
				className="bg-slate-200 dark:bg-zinc-900 backdrop-blur-sm bg-opacity-70 dark:bg-opacity-70 w-full h-full fixed inset-0 z-20"
			></motion.div>
		</div>
	);
}
