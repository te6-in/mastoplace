"use client";

import { NewStatusResponse } from "@/app/api/status/route";
import { GoogleMaps } from "@/components/GoogleMaps";
import { Checkbox } from "@/components/Input/Checkbox";
import { TextArea } from "@/components/Input/TextArea";
import { Layout } from "@/components/Layout";
import { BottomToolbar } from "@/components/Layout/BottomToolbar";
import { useLocation } from "@/libs/client/useLocation";
import { useMutation } from "@/libs/client/useMutation";
import { useToken } from "@/libs/client/useToken";
import { Check, Map } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";

interface NewStatusForm {
	text: string;
	approximate: boolean;
	exact: boolean;
}

interface NewStatusSubmitForm {
	text: string;
	includeLocation: "approximate" | "exact" | false;
}

export default function New() {
	useToken("/auth");

	const router = useRouter();
	const { mutate } = useSWRConfig();
	const { latitude, longitude } = useLocation();
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<NewStatusForm>({
		defaultValues: {
			approximate: true,
		},
	});

	const watchApproximate = watch("approximate");
	const watchExact = watch("exact");

	const [submit, { data, isLoading }] =
		useMutation<NewStatusResponse>("/api/status");

	const randomValue = () => {
		const values = [-0.03, -0.02, -0.01, 0, 0.01, 0.02, 0.03];
		return values[Math.floor(Math.random() * values.length)];
	};

	const approximateLocation =
		latitude && longitude
			? {
					latitudeFrom: parseFloat(latitude.toFixed(2)) - 0.05 + randomValue(),
					latitudeTo: parseFloat(latitude.toFixed(2)) + 0.05 + randomValue(),
					longitudeFrom:
						parseFloat(longitude.toFixed(2)) - 0.05 + randomValue(),
					longitudeTo: parseFloat(longitude.toFixed(2)) + 0.05 + randomValue(),
			  }
			: undefined;

	const approximatePosition = approximateLocation
		? {
				latitude:
					(approximateLocation.latitudeFrom + approximateLocation.latitudeTo) /
					2,
				longitude:
					(approximateLocation.longitudeFrom +
						approximateLocation.longitudeTo) /
					2,
		  }
		: undefined;

	const exactLocation =
		latitude && longitude
			? {
					latitudeFrom: parseFloat(latitude.toFixed(2)),
					latitudeTo: parseFloat(latitude.toFixed(2)),
					longitudeFrom: parseFloat(longitude.toFixed(2)),
					longitudeTo: parseFloat(longitude.toFixed(2)),
			  }
			: undefined;

	const exactPosition = exactLocation
		? {
				latitude: (exactLocation.latitudeFrom + exactLocation.latitudeTo) / 2,
				longitude:
					(exactLocation.longitudeFrom + exactLocation.longitudeTo) / 2,
		  }
		: undefined;

	const onValid = (inputs: NewStatusForm) => {
		if (isLoading) return;

		submit({
			text: inputs.text,
			location: {
				...(watchExact
					? exactLocation
					: watchApproximate
					? approximateLocation
					: {}),
			},
		});
	};

	useEffect(() => {
		if (data && data.ok) {
			mutate("/api/status");
			router.replace(`/status/${data.id}`);
		}
	}, [data, router]);

	useEffect(() => {
		if (!watchApproximate) {
			setValue("exact", false);
		}
	}, [watchApproximate, setValue]);

	return (
		<Layout
			title="새로운 글 작성"
			showBackground
			showBackButton
			hasBottomToolbar
		>
			<form onSubmit={handleSubmit(onValid)}>
				<div className="flex flex-col gap-4 px-4">
					{watchExact && exactPosition && (
						<GoogleMaps
							position={exactPosition}
							className="h-48 rounded-md"
							fixed
						/>
					)}
					{watchApproximate && !watchExact && approximatePosition && (
						<GoogleMaps
							position={approximatePosition}
							className="h-48 rounded-md"
							fixed
						/>
					)}
					{!watchApproximate && !watchExact && (
						<div
							onClick={() => {
								setValue("approximate", true);
							}}
							className="h-48 rounded-md bg-slate-100 flex cursor-pointer items-center justify-center"
						>
							<Map width={48} height={48} className="text-slate-500" />
						</div>
					)}
					<TextArea
						register={register("text", { required: "내용을 입력해주세요." })}
						id="text"
						label="내용"
						rows={3}
						placeholder="거기에선 어떤 일이 일어나고 있나요?"
						error={errors.text?.message}
					/>
					<Checkbox
						register={register("approximate")}
						id="approximate"
						title="현재 위치 포함"
						label="임의 가중치가 적용된 대략적인 현재 위치와 그 주변에 올라온 글을 확인할 수 있는 링크가 함께 게시됩니다."
					/>
					<Checkbox
						register={register("exact")}
						id="includeLocation"
						title="정확한 위치"
						label="대략적인 위치보다 조금 더 정밀한 구역으로 구분된 범위가 게시됩니다."
						disabled={!watchApproximate}
					/>
					{/* TODO: Post privacy */}
				</div>
				<BottomToolbar
					primaryButton={{
						icon: Check,
						text: `${
							watchExact
								? "정확한 위치와 함께"
								: watchApproximate
								? "대략적인 위치와 함께"
								: "위치 없이"
						} 게시`,
						isLoading,
					}}
				/>
			</form>
		</Layout>
	);
}
