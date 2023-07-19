import { SWRProvider } from "@/components/Layout/swrProvider";
import "./globals.css";

export const metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ko">
			<body>
				<SWRProvider>{children}</SWRProvider>
			</body>
		</html>
	);
}
