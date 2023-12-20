import { Redirect } from "@/components/Redirect";

export default function Base() {
	return (
		<>
			<div className="hidden">
				<a rel="me" href="https://mastodon.social/@mastoplace"></a>
				<a rel="me" href="https://fosstodon.org/@mastoplace"></a>
				<a rel="me" href="https://mas.to/@he"></a>
			</div>
			<Redirect />
		</>
	);
}
