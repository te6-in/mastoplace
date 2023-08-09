"use client";

import { useEffect } from "react";

export default function Base() {
	useEffect(() => {
		window.location.href = "/home";
	});

	return null;
}
