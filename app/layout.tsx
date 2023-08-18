import "@/app/globals.css";
import { SkeletonProvider } from "@/components/Layout/SkeletonProvider";
import { SWRProvider } from "@/components/Layout/swrProvider";
import { Metadata } from "next";
import useTranslation from "next-translate/useTranslation";
import Script from "next/script";

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
			<head>
				<Script
					async
					src="https://analytics.umami.is/script.js"
					data-website-id="fdd5df9d-40cf-4a7e-8258-7473a881ac5c"
				/>
			</head>
			<body className="bg-slate-50 dark:bg-zinc-950">
				<SWRProvider>
					<SkeletonProvider>{children}</SkeletonProvider>
				</SWRProvider>
			</body>
		</html>
	);
}
