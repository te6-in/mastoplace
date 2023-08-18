"use client";

import { useEffect } from "react";

export function Redirect() {
	useEffect(() => {
		window.location.href = "/home";
	});

	return null;
}
