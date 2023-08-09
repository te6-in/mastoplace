import { j } from "@/libs/client/utils";
import { Map, Marker } from "pigeon-maps";

interface PigeonMapProps {
	position: {
		latitude: number;
		longitude: number;
	};
	exact: boolean;
	fixed?: boolean;
	className?: string;
}

export function PigeonMap({
	position,
	exact,
	fixed,
	className,
}: PigeonMapProps) {
	return (
		<div className={j(className ?? "", "overflow-hidden")}>
			<Map
				defaultCenter={[position.latitude, position.longitude]}
				defaultZoom={12}
				mouseEvents={!fixed}
				touchEvents={!fixed}
			>
				{exact && (
					<Marker
						color="#8b5cf6"
						width={35}
						anchor={[position.latitude, position.longitude]}
						hover={false}
						className="pointer-events-none"
					/>
				)}
			</Map>
		</div>
	);
}
