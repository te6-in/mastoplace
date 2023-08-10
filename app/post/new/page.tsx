"use client";

import { NewStatusResponse } from "@/app/api/post/route";
import { MyInfoResponse } from "@/app/api/profile/me/route";
import { AuthForm } from "@/components/Auth/AuthForm";
import { Checkbox } from "@/components/Input/Checkbox";
import { TextArea } from "@/components/Input/TextArea";
import { VisibilitySelector } from "@/components/Input/VisibilitySelector";
import { Layout } from "@/components/Layout";
import { BottomToolbar } from "@/components/Layout/BottomToolbar";
import { FullPageOverlay } from "@/components/Layout/FullPageOverlay";
import { PigeonMap } from "@/components/PigeonMap";
import { useLocation } from "@/libs/client/useLocation";
import { useMutation } from "@/libs/client/useMutation";
import { useToken } from "@/libs/client/useToken";
import { AnimatePresence } from "framer-motion";
import { getCenter } from "geolib";
import { Check, Map } from "lucide-react";
import { mastodon } from "masto";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import useSWR, { useSWRConfig } from "swr";

interface NewStatusForm {
	text: string;
	visibility: mastodon.v1.StatusVisibility;
	approximate: boolean;
	exact: boolean;
}

export default function New() {
	const { hasValidToken, isLoading: isTokenLoading } = useToken();
	const { data: meData, isLoading: isMeLoading } =
		useSWR<MyInfoResponse>("/api/profile/me");

	const router = useRouter();
	const { t } = useTranslation();
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
		useMutation<NewStatusResponse>("/api/post");

	const randomValue = () => {
		const values = [-0.03, -0.02, -0.01, 0, 0.01, 0.02, 0.03];
		return values[Math.floor(Math.random() * values.length)];
	};

	const approximateLocation = latitude &&
		longitude && {
			latitudeFrom: parseFloat(latitude.toFixed(2)) - 0.05 + randomValue(),
			latitudeTo: parseFloat(latitude.toFixed(2)) + 0.05 + randomValue(),
			longitudeFrom: parseFloat(longitude.toFixed(2)) - 0.05 + randomValue(),
			longitudeTo: parseFloat(longitude.toFixed(2)) + 0.05 + randomValue(),
		};

	const approximatePosition = approximateLocation && {
		latitude:
			(approximateLocation.latitudeFrom + approximateLocation.latitudeTo) / 2,
		longitude:
			(approximateLocation.longitudeFrom + approximateLocation.longitudeTo) / 2,
	};

	const exactLocation = latitude &&
		longitude && {
			latitudeFrom: parseFloat(latitude.toFixed(2)),
			latitudeTo: parseFloat(latitude.toFixed(2)),
			longitudeFrom: parseFloat(longitude.toFixed(2)),
			longitudeTo: parseFloat(longitude.toFixed(2)),
		};

	const exactPosition =
		exactLocation &&
		getCenter([
			{
				latitude: exactLocation.latitudeFrom,
				longitude: exactLocation.longitudeFrom,
			},
			{
				latitude: exactLocation.latitudeTo,
				longitude: exactLocation.longitudeTo,
			},
			{
				latitude: exactLocation.latitudeFrom,
				longitude: exactLocation.longitudeTo,
			},
			{
				latitude: exactLocation.latitudeTo,
				longitude: exactLocation.longitudeFrom,
			},
		]);

	const onValid = (inputs: NewStatusForm) => {
		if (isLoading) return;

		submit({
			text: inputs.text,
			visibility: inputs.visibility,
			exact: watchExact ? true : watchApproximate ? false : undefined,
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
			mutate("/api/post");
			router.replace(`/post/${data.id}`);
		}
	}, [data, router]);

	useEffect(() => {
		if (!watchApproximate) {
			setValue("exact", false);
		}
	}, [watchApproximate, setValue]);

	useEffect(() => {
		if (isMeLoading || !meData?.me) return;

		if (process.env.NODE_ENV === "development") {
			setValue("visibility", "direct");
		} else {
			setValue("visibility", meData.me.defaultVisibility);
		}
	}, [meData, setValue]);

	if (isTokenLoading) return null;

	return (
		<Layout
			title={t("action.new-post.default")}
			showBackground
			showBackButton
			hasBottomToolbar
		>
			<AnimatePresence>
				{!hasValidToken && (
					<FullPageOverlay
						type="back"
						component={
							<div className="flex flex-col gap-6">
								<p className="text-xl font-medium text-slate-800 text-center break-keep dark:text-zinc-200">
									{t("new-post.log-in-to-write")}
								</p>
								<AuthForm
									buttonText={t("new-post.log-in-and-write")}
									redirectAfterAuth="/post/new"
								/>
							</div>
						}
					/>
				)}
			</AnimatePresence>
			<form onSubmit={handleSubmit(onValid)}>
				<div className="flex flex-col gap-4 px-4">
					{watchExact && exactPosition && (
						<PigeonMap
							position={exactPosition}
							className="h-48 rounded-md"
							fixed
							exact
						/>
					)}
					{watchApproximate && !watchExact && approximatePosition && (
						<PigeonMap
							position={approximatePosition}
							className="h-48 rounded-md"
							fixed
							exact={false}
						/>
					)}
					{!watchApproximate && !watchExact && (
						<div
							onClick={() => {
								setValue("approximate", true);
							}}
							className="h-48 rounded-md bg-slate-200 dark:bg-zinc-800 flex cursor-pointer items-center justify-center"
						>
							<Map
								width={48}
								height={48}
								className="text-slate-500 dark:text-zinc-500"
							/>
						</div>
					)}
					<TextArea
						register={register("text", {
							required: t("new-post.text.error.required"),
						})}
						id="text"
						label={t("new-post.text.label")}
						rows={3}
						placeholder={t("new-post.text.placeholder")}
						error={errors.text?.message}
					/>
					<VisibilitySelector
						register={register("visibility", {
							required: t("new-post.visibility.error.required"),
						})}
						error={errors.visibility?.message}
					/>
					<Checkbox
						register={register("approximate")}
						id="approximate"
						title={t("new-post.include-location.title")}
						label={t("new-post.include-location.description")}
					/>
					<Checkbox
						register={register("exact")}
						id="includeLocation"
						title={t("new-post.exact-location.title")}
						label={t("new-post.exact-location.description")}
						disabled={!watchApproximate}
					/>
				</div>
				<BottomToolbar
					primaryButton={{
						icon: Check,
						text: watchExact
							? t("new-post.post.with-exact-location")
							: watchApproximate
							? t("new-post.post.with-approximate-location")
							: t("new-post.post.without-location"),
						isLoading,
					}}
				/>
			</form>
		</Layout>
	);
}
