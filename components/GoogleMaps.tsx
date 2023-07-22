import { j } from "@/libs/client/utils";
import GoogleMapReact from "google-map-react";

interface GoogleMapsProps {
	position: {
		latitude: number;
		longitude: number;
	};
	fixed?: boolean;
	className?: string;
}

export function GoogleMaps({ position, fixed, className }: GoogleMapsProps) {
	return (
		<div className={j(className ?? "", "overflow-hidden")}>
			<GoogleMapReact
				defaultCenter={{ lat: position.latitude, lng: position.longitude }}
				defaultZoom={12}
				options={{
					...(fixed && {
						draggable: false,
						scrollwheel: false,
						disableDoubleClickZoom: true,
						clickableIcons: false,
					}),
					fullscreenControl: false,
					zoomControl: true,
					zoomControlOptions: {
						position: 3,
					},
				}}
			></GoogleMapReact>
		</div>
	);
}
