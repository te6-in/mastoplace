import { AtSign, Globe, Lock, Unlock } from "lucide-react";
import { mastodon } from "masto";
import { Translate } from "next-translate";
import useTranslation from "next-translate/useTranslation";

interface VisibilityProps {
	visibility: mastodon.v1.StatusVisibility;
}

export function visibilitySet(
	t: Translate,
	visibility: mastodon.v1.StatusVisibility
) {
	switch (visibility) {
		case "public":
			return {
				Icon: Globe,
				text: t("post.visibility.public"),
			};
		case "unlisted":
			return {
				Icon: Unlock,
				text: t("post.visibility.unlisted"),
			};
		case "private":
			return {
				Icon: Lock,
				text: t("post.visibility.followers"),
			};
		case "direct":
			return {
				Icon: AtSign,
				text: t("post.visibility.direct"),
			};
	}
}

export function Visibility({ visibility }: VisibilityProps) {
	const { t } = useTranslation();
	const { Icon, text } = visibilitySet(t, visibility);

	return (
		<div className="flex items-center gap-1">
			<Icon width={20} height={20} />
			<span className="text-slate-500 dark:text-zinc-500">{text}</span>
		</div>
	);
}
