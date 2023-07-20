"use client";

import { NewStatusResponse } from "@/app/api/status/route";
import { GoogleMaps } from "@/components/GoogleMaps";
import { Checkbox } from "@/components/Input/Checkbox";
import { TextArea } from "@/components/Input/TextArea";
import { Layout } from "@/components/Layout";
import { BottomToolbar } from "@/components/Layout/BottomToolbar";
import { useLocation } from "@/libs/client/useLocation";
import { useMutation } from "@/libs/client/useMutation";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface NewStatusForm {
	text: string;
	includeLocation: boolean;
}

export default function New() {
	const router = useRouter();
	const { latitude, longitude } = useLocation();
	const [includeLocation, setIncludeLocation] = useState(true);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<NewStatusForm>({
		defaultValues: {
			includeLocation: true,
		},
	});

	const watchIncludeLocation = watch("includeLocation");

	const [submit, { data, isLoading }] =
		useMutation<NewStatusResponse>("/api/status");

	const onValid = (inputs: NewStatusForm) => {
		if (isLoading) return;

		const location =
			includeLocation === true && latitude && longitude
				? {
						latitudeFrom: parseFloat(latitude.toFixed(2)) - 0.05,
						latitudeTo: parseFloat(latitude.toFixed(2)) + 0.05,
						longitudeFrom: parseFloat(longitude.toFixed(2)) - 0.05,
						longitudeTo: parseFloat(longitude.toFixed(2)) + 0.05,
				  }
				: undefined;

		submit({
			text: inputs.text,
			location,
		});
	};

	useEffect(() => {
		if (data && data.ok) {
			// router.replace(`/status/${data.post.id}`);
		}
	}, [data, router]);

	useEffect(() => {
		setIncludeLocation(watchIncludeLocation);
	}, [watchIncludeLocation]);

	return (
		<Layout
			title="새로운 글 작성"
			showBackground
			showBackButton
			hasBottomToolbar
		>
			<form onSubmit={handleSubmit(onValid)}>
				<div className="mt-4 flex flex-col gap-4 px-4">
					<TextArea
						register={register("text", { required: "내용을 입력해주세요." })}
						id="text"
						label="내용"
						rows={10}
						placeholder="맛집 추천해주세요."
						error={errors.text?.message}
					/>
					<Checkbox
						register={register("includeLocation")}
						id="includeLocation"
						title="대략적인 현재 위치 포함"
						label="대략적인 현재 위치와 주변에 올라온 글을 확인할 수 있는 링크가 함께 등록됩니다."
					/>
					{includeLocation && latitude && longitude && (
						<GoogleMaps
							location={{ latitude, longitude }}
							className="ml-[1.625rem] h-48 rounded-md"
							fixed
						/>
					)}
				</div>
				<BottomToolbar
					primaryButton={{ icon: Check, text: "게시", isLoading }}
				/>
			</form>
		</Layout>
	);
}
