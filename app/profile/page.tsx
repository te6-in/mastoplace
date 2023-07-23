"use client";

import { Button } from "@/components/Input/Button";
import { Layout } from "@/components/Layout";
import { useMutation } from "@/libs/client/useMutation";
import { useToken } from "@/libs/client/useToken";
import { DefaultResponse } from "@/libs/server/response";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Profile() {
	const [logOut, { data, isLoading }] = useMutation<DefaultResponse>(
		"/api/profile/logout"
	);

	const {} = useToken("/");
	const router = useRouter();

	const onClick = () => {
		if (isLoading) return;

		logOut({});
	};

	useEffect(() => {
		if (data?.ok) {
			router.push("/");
		}
	}, [data]);

	return (
		<Layout title="프로필" showBackground showTabBar>
			<Button
				isPrimary
				isLoading={isLoading}
				Icon={LogOut}
				text="로그아웃"
				onClick={onClick}
			/>
		</Layout>
	);
}
