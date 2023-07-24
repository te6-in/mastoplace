interface LabelProps {
	text: string;
	id: string | undefined;
}

export function Label({ text, id }: LabelProps) {
	return (
		<label htmlFor={id} className="text-slate-700 mr-1 break-keep">
			{text}
		</label>
	);
}
