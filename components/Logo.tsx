import darkLogo from "@/public/logos/dark.png";
import lightLogo from "@/public/logos/light.png";
import Image from "next/image";

export function Logo() {
	return (
		<picture className="w-1/5">
			<source srcSet={darkLogo.src} media="(prefers-color-scheme: dark)" />
			<Image src={lightLogo} alt="Mastoplace 로고" />
		</picture>
	);
}
