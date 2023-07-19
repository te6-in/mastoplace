import { MeResponse } from "@/app/api/auth/me/route";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

export function useToken() {
	const { data, isLoading } = useSWR<MeResponse>("/api/auth/me");
	const router = useRouter();

	useEffect(() => {
		if (data && !data.ok) {
			router.replace("/auth");
		}
	}, [data, router]);

	return { token: data?.token, isLoading };
}
