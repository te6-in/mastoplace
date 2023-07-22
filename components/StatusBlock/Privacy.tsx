import { AtSign, Globe, Lock, Unlock } from "lucide-react";
import { mastodon } from "masto";

interface PrivacyProps {
	privacy: mastodon.v1.StatusVisibility;
}

function Set(privacy: mastodon.v1.StatusVisibility) {
	switch (privacy) {
		case "public":
			return {
				Icon: Globe,
				text: "공개",
			};
		case "unlisted":
			return {
				Icon: Unlock,
				text: "공개 타임라인에서 숨김",
			};
		case "private":
			return {
				Icon: Lock,
				text: "팔로워만",
			};
		case "direct":
			return {
				Icon: AtSign,
				text: "언급된 사용자만",
			};
	}
}

export function Privacy({ privacy }: PrivacyProps) {
	const { Icon, text } = Set(privacy);

	return (
		<div className="flex items-center gap-1">
			<Icon width={20} height={20} />
			<span className="text-slate-500">{text}</span>
		</div>
	);
}
