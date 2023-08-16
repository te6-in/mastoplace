"use client";

import { NewStatusResponse } from "@/app/api/post/route";
import { LogOutResponse } from "@/app/api/profile/logout/route";
import { MyInfoResponse } from "@/app/api/profile/me/route";
import { AuthForm } from "@/components/Auth/AuthForm";
import { Button } from "@/components/Input/Button";
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
import { Check, LogOut, Map } from "lucide-react";
import { mastodon } from "masto";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR, { useSWRConfig } from "swr";

interface NewStatusForm {
	text: string;
	visibility: mastodon.v1.StatusVisibility;
	approximate: boolean;
	exact: boolean;
}

export interface NewStatusRequest {
	text: string;
	visibility: mastodon.v1.StatusVisibility;
	location: {
		latitudeFrom: number;
		latitudeTo: number;
		longitudeFrom: number;
		longitudeTo: number;
	} | null;
	exact: boolean | null;
}

export default function New() {
	const { hasValidToken, isLoading: isTokenLoading } = useToken();
	const { data: meData, isLoading: isMeLoading } =
		useSWR<MyInfoResponse>("/api/profile/me");

	const [isLocationLoading, setIsLocationLoading] = useState(true);
	const [showBetaError, setShowBetaError] = useState(false);

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

	const [submit, { data, isLoading }] = useMutation<
		NewStatusResponse,
		NewStatusRequest
	>("/api/post");

	const [logOut, { data: logOutData, isLoading: isLogOutLoading }] =
		useMutation<LogOutResponse, {}>("/api/profile/logout");

	const randomValue = () => {
		const values = [-0.03, -0.02, -0.01, 0, 0.01, 0.02, 0.03];
		return values[Math.floor(Math.random() * values.length)];
	};

	const getApproximateLocation = () => {
		if (!latitude || !longitude) return null;

		return {
			latitudeFrom: parseFloat(latitude.toFixed(2)) - 0.05 + randomValue(),
			latitudeTo: parseFloat(latitude.toFixed(2)) + 0.05 + randomValue(),
			longitudeFrom: parseFloat(longitude.toFixed(2)) - 0.05 + randomValue(),
			longitudeTo: parseFloat(longitude.toFixed(2)) + 0.05 + randomValue(),
		};
	};

	const getExactLocation = () => {
		if (!latitude || !longitude) return null;

		return {
			latitudeFrom: parseFloat(latitude.toFixed(2)),
			latitudeTo: parseFloat(latitude.toFixed(2)),
			longitudeFrom: parseFloat(longitude.toFixed(2)),
			longitudeTo: parseFloat(longitude.toFixed(2)),
		};
	};

	const approximateLocation = getApproximateLocation();

	const approximatePosition = approximateLocation && {
		latitude:
			(approximateLocation.latitudeFrom + approximateLocation.latitudeTo) / 2,
		longitude:
			(approximateLocation.longitudeFrom + approximateLocation.longitudeTo) / 2,
	};

	const exactLocation = getExactLocation();

	const exactPosition =
		(exactLocation &&
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
			])) ||
		null;

	const onValid = (inputs: NewStatusForm) => {
		if (isLoading) return;

		submit({
			text: inputs.text,
			visibility: inputs.visibility,
			exact: watchExact ? true : watchApproximate ? false : null,
			location:
				watchExact && exactLocation
					? exactLocation
					: watchApproximate && approximateLocation
					? approximateLocation
					: null,
		});
	};

	const onLogOutClick = () => {
		if (isLogOutLoading) return;

		logOut({});
	};

	useEffect(() => {
		if (data && data.ok) {
			mutate("/api/post");
			router.replace(`/post/${data.id}`);

			return;
		}

		if (data && !data.ok && data.error === "BETA_POINTLESS") {
			setShowBetaError(true);

			return;
		}
	}, [data, router]);

	useEffect(() => {
		if (watchApproximate) {
			if (approximateLocation) {
				setIsLocationLoading(false);
				return;
			}

			setIsLocationLoading(true);
			return;
		}

		if (watchExact) {
			if (exactLocation) {
				setIsLocationLoading(false);
				return;
			}

			setIsLocationLoading(true);
			return;
		}
	}, [watchApproximate, watchExact, approximateLocation, exactLocation]);

	useEffect(() => {
		if (!watchApproximate) {
			setValue("exact", false);
		}
	}, [watchApproximate, setValue]);

	useEffect(() => {
		if (isMeLoading || !meData || !meData.ok) return;

		if (process.env.NODE_ENV === "development") {
			setValue("visibility", "direct");
		} else {
			setValue("visibility", meData.defaultVisibility);
		}
	}, [meData, setValue]);

	useEffect(() => {
		if (logOutData && logOutData.ok) {
			router.push("/home");
		}
	}, [logOutData]);

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
								<div className="text-xl font-medium text-slate-800 text-center break-keep dark:text-zinc-200">
									{t("new-post.log-in-to-write")}
								</div>
								<AuthForm
									buttonText={t("new-post.log-in-and-write")}
									redirectAfterAuth="/post/new"
								/>
							</div>
						}
					/>
				)}
				{showBetaError && (
					<FullPageOverlay
						type="close"
						component={
							<div className="flex flex-col gap-6">
								<div className="text-xl font-medium text-slate-800 text-center break-keep dark:text-zinc-200">
									앗...
								</div>
								<p className="text-slate-600 text-center break-keep dark:text-zinc-400">
									베타 버전에서는{" "}
									<Link
										href="https://pointless.chat/"
										target="_blank"
										rel="noopener noreferrer"
										className="underline text-violet-500 dark:text-violet-600 font-bold underline-offset-2"
									>
										포인트리스 서버
									</Link>
									에 있는 계정에서만 게시할 수 있습니다.
								</p>
								<Button
									isPrimary
									text="로그아웃하고 다시 로그인"
									isLoading={isLogOutLoading}
									Icon={LogOut}
									onClick={onLogOutClick}
								/>
							</div>
						}
						onCloseClick={() => setShowBetaError(false)}
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
						disabled={isMeLoading}
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
						isLoading: isLoading || isLocationLoading,
						animateText: true,
					}}
				/>
			</form>
		</Layout>
	);
}
