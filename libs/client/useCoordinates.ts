import { useEffect, useState } from "react";

interface Coordinates {
	latitude: number | null;
	longitude: number | null;
}

export function useCoordinates() {
	const [coordinates, setCoordinates] = useState<Coordinates>({
		latitude: null,
		longitude: null,
	});

	const onSuccess = ({
		coords: { latitude, longitude },
	}: GeolocationPosition) => {
		setCoordinates({ latitude, longitude });
	};

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(onSuccess);
	}, []);

	return coordinates;
}
