import { j } from "@/libs/client/utils";
import parse, { domToReact } from "html-react-parser";
import { mastodon } from "masto";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface ContentProps {
	mastodonStatus: mastodon.v1.Status | undefined;
}

export function Content({ mastodonStatus }: ContentProps) {
	return (
		<article className="text-slate-700 flex gap-1 flex-col break-keep">
			{mastodonStatus ? (
				parse(mastodonStatus.content, {
					replace: (domNode) => {
						if ("name" in domNode && "attribs" in domNode) {
							if (domNode.name === "a") {
								return (
									<Link
										href={domNode.attribs.href}
										className={j(
											"break-all text-violet-500 hover:text-violet-600 active:text-violet-700 transition-colors",
											domNode.attribs.class === "mention hashtag"
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
				<Skeleton count={3} />
			)}
		</article>
	);
}