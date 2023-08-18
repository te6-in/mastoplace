import { Redirect } from "@/components/Redirect";

export default function Base() {
	return (
		<>
			<a rel="me" href="https://mastodon.social/@mastoplace"></a>
			<a rel="me" href="https://fosstodon.org/@mastoplace"></a>
			<Redirect />
		</>
	);
}
