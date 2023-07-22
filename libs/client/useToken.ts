import { MeResponse } from "@/app/api/auth/me/route";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

export function useToken(redirect: false | string = false) {
	const { data, isLoading, mutate } = useSWR<MeResponse>("/api/auth/me");
	const router = useRouter();

	mutate();

	useEffect(() => {
		if (redirect && data && !data.ok) {
			router.replace(redirect);
		}
	}, [data, router]);

	return { token: data?.token, isLoading };
}
