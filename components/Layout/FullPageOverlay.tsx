import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface FullPageOverlayProps {
	component: React.ReactNode;
}

export function FullPageOverlay({ component }: FullPageOverlayProps) {
	const router = useRouter();

	const onBackClick = () => {
		router.back();
	};

	return (
		<div className="fixed backdrop-blur-sm bg-slate-200 bg-opacity-70 inset-0 z-20 flex justify-center items-center">
			<div className="bg-white rounded-xl p-7 pb-5 shadow-xl sm:w-96 w-11/12 border flex flex-col gap-3">
				<div>{component}</div>
				<button
					className="flex items-center text-sm text-slate-500 font-semibold p-2 hover:bg-slate-100 active:bg-slate-200 w-fit rounded-md transition-colors mx-auto"
					onClick={onBackClick}
				>
					<ChevronLeft width={20} height={20} />
					<span className="pr-2">이전 화면으로</span>
				</button>
			</div>
		</div>
	);
}
