import "@/app/globals.css";
import { SkeletonProvider } from "@/components/Layout/SkeletonProvider";
import { SWRProvider } from "@/components/Layout/swrProvider";
import { Metadata } from "next";
import useTranslation from "next-translate/useTranslation";

export const metadata: Metadata = {
	title: "Mastoplace",
	description: "Your Passport to Local Connections 🗺️",
};

interface RootLayoutProps {
	children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	const { lang } = useTranslation();

	return (
		<html lang={lang}>
			<body className="bg-slate-50 dark:bg-zinc-950">
				<SWRProvider>
					<SkeletonProvider>{children}</SkeletonProvider>
				</SWRProvider>
			</body>
		</html>
	);
}
