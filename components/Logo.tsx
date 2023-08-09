import darkLogo from "@/public/logos/dark.png";
import lightLogo from "@/public/logos/light.png";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";

export function Logo() {
	const { t } = useTranslation();

	return (
		<picture className="w-1/5">
			<source srcSet={darkLogo.src} media="(prefers-color-scheme: dark)" />
			<Image src={lightLogo} alt={t("accessibility.alt.logo")} />
		</picture>
	);
}
