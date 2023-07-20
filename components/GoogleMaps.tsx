import { j } from "@/libs/client/utils";
import GoogleMapReact from "google-map-react";
import "react-loading-skeleton/dist/skeleton.css";

interface GoogleMapsProps {
	location: {
		latitude: number;
		longitude: number;
	};
	fixed?: boolean;
	className?: string;
}

export function GoogleMaps({ location, fixed, className }: GoogleMapsProps) {
	return (
		<div className={j(className ?? "", "overflow-hidden")}>
			<GoogleMapReact
				defaultCenter={{ lat: location.latitude, lng: location.longitude }}
				defaultZoom={15}
				options={{
					...(fixed
						? {
								draggable: false,
								scrollwheel: false,
								disableDoubleClickZoom: true,
								clickableIcons: false,
						  }
						: {
								zoomControl: true,
								zoomControlOptions: {
									position: 3,
								},
						  }),
					fullscreenControl: false,
				}}
			></GoogleMapReact>
		</div>
	);
}
