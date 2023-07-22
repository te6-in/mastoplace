import { StatusButton } from "@/components/StatusBlock/StatusButtons/StatusButton";

export function StatusButtons() {
	return (
		<div className="flex justify-between mt-2">
			<StatusButton type="open" />
			<StatusButton type="boost" />
			<StatusButton type="like" />
			<StatusButton type="bookmark" />
		</div>
	);
}
