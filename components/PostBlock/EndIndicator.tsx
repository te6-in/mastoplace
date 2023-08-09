import { j } from "@/libs/client/utils";
import useTranslation from "next-translate/useTranslation";

interface EndIndicatorProps {
	hasFloatingButton?: boolean;
}

export function EndIndicator({ hasFloatingButton }: EndIndicatorProps) {
	const { t } = useTranslation();

	return (
		<div
			className={j(
				"text-slate-500 dark:text-zinc-500 text-sm font-medium text-center border-t border-slate-200 dark:border-zinc-800 pt-4",
				hasFloatingButton ? "mb-1 sm:mb-4" : "mb-4"
			)}
		>
			{t("post.end-of-list")}
		</div>
	);
}
