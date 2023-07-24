import { MeResponse } from "@/app/api/auth/me/route";
import useSWR from "swr";

export function useToken() {
	const { data, isLoading } = useSWR<MeResponse>("/api/auth/me");

	return { hasValidToken: data?.ok, isLoading };
}
