import useTranslation from "next-translate/useTranslation";

export function UnavailablePostBlock() {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-2 break-keep">
			<h1 className="text-slate-800 text-2xl dark:text-zinc-200">
				{t("post.no-post.title")}
			</h1>
			<p className="text-sm text-slate-600 dark:text-zinc-400">
				{t("post.no-post.description.1")}
				<br />
				{t("post.no-post.description.2")}
			</p>
		</div>
	);
}
