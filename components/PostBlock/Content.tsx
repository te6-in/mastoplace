import { j } from "@/libs/client/utils";
import parse, { domToReact } from "html-react-parser";
import { mastodon } from "masto";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { parseURL } from "ufo";

interface ContentProps {
	mastodonStatus: mastodon.v1.Status | undefined;
	id: string | null;
	clientServer: string | undefined;
	link?: boolean;
}

export function Content({
	mastodonStatus,
	clientServer,
	id,
	link,
}: ContentProps) {
	const router = useRouter();

	const onClick = () => {
		if (!id) return;

		router.push(`/post/${id}`);
	};

	return (
		<article
			className="text-slate-700 dark:text-zinc-300 flex gap-1 flex-col break-keep cursor-pointer"
			onClick={link ? onClick : undefined}
		>
			{mastodonStatus && clientServer ? (
				parse(mastodonStatus.content, {
					replace: (domNode) => {
						if ("name" in domNode && "attribs" in domNode) {
							if (domNode.name === "a") {
								return (
									<Link
										href={
											domNode.attribs.class === "u-url mention"
												? `https://${clientServer}/@${
														parseURL(domNode.attribs.href).pathname.split(
															"/@"
														)[1]
												  }@${parseURL(domNode.attribs.href).host}`
												: domNode.attribs.href
										}
										rel={
											domNode.attribs.href.startsWith(
												process.env.NEXT_PUBLIC_BASE_URL as string
											)
												? undefined
												: "noopener noreferrer"
										}
										target={
											domNode.attribs.href.startsWith(
												process.env.NEXT_PUBLIC_BASE_URL as string
											)
												? undefined
												: "_blank"
										}
										className={j(
											"break-all text-violet-500 hover:text-violet-600 active:text-violet-700 transition-colors",
											domNode.attribs.class === "mention hashtag" ||
												domNode.attribs.class === "u-url mention"
												? ""
												: "underline underline-offset-4"
										)}
									>
										{domToReact(domNode.children)}
									</Link>
								);
							}
						}
					},
				})
			) : (
				<Skeleton count={3} width="100%" />
			)}
		</article>
	);
}
