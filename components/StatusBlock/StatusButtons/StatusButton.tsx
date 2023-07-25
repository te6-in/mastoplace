import { StatusDeleteResponse } from "@/app/api/status/[id]/route";
import { Button } from "@/components/Input/Button";
import { FullPageOverlay } from "@/components/Layout/FullPageOverlay";
import { StatusBlock } from "@/components/StatusBlock";
import { useMutation } from "@/libs/client/useMutation";
import { j } from "@/libs/client/utils";
import {
	ArrowUpRightSquare,
	Bookmark,
	Eraser,
	MapPinOff,
	Rocket,
	Star,
	Trash2,
} from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSWRConfig } from "swr";

interface StatusButtonProps {
	type: "open" | "boost" | "like" | "bookmark" | "delete";
	id?: string | null;
}

export function StatusButton({ type, id }: StatusButtonProps) {
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const Icon = {
		open: ArrowUpRightSquare,
		boost: Rocket,
		like: Star,
		bookmark: Bookmark,
		delete: Trash2,
	}[type];

	const label = {
		open: "원본 열기",
		boost: "부스트",
		like: "좋아요",
		bookmark: "보관함에 추가",
		delete: "삭제",
	}[type];

	const onClick = {
		open: () => {},
		boost: () => {},
		like: () => {},
		bookmark: () => {},
		delete: () => {
			setShowDeleteModal(true);
		},
	}[type];

	return (
		<>
			{id && showDeleteModal && (
				<FullPageOverlay
					type="close"
					buttonLabel="삭제 안 할래요"
					component={
						<DeleteModal id={id} setShowDeleteModal={setShowDeleteModal} />
					}
					onCloseClick={() => setShowDeleteModal(false)}
				/>
			)}
			<button
				className={j(
					"flex text-slate-600 p-1 rounded-md transition-colors",
					type === "open" ? "hover:bg-slate-100 active:bg-slate-200" : "",
					type === "boost"
						? "hover:bg-emerald-100 active:bg-emerald-200 hover:text-emerald-600"
						: "",
					type === "like"
						? "hover:bg-yellow-100 active:bg-yellow-200 hover:text-yellow-600"
						: "",
					type === "bookmark"
						? "hover:bg-rose-100 active:bg-rose-200 hover:text-rose-600"
						: "",
					type === "delete"
						? "hover:bg-red-100 active:bg-red-200 hover:text-red-600"
						: ""
				)}
				onClick={onClick}
				aria-label={label}
			>
				<Icon />
			</button>
		</>
	);
}

interface DeleteModalProps {
	id: string | null;
	setShowDeleteModal: Dispatch<SetStateAction<boolean>>;
}

function DeleteModal({ id, setShowDeleteModal }: DeleteModalProps) {
	const [deleteAll, { data: deleteAllData, isLoading: deleteAllLoading }] =
		useMutation<StatusDeleteResponse>(`/api/status/${id}?type=all`, "DELETE");

	const [
		deleteDatabase,
		{ data: deleteDatabaseData, isLoading: deleteDatabaseLoading },
	] = useMutation<StatusDeleteResponse>(
		`/api/status/${id}?type=database`,
		"DELETE"
	);

	const { mutate } = useSWRConfig();

	const onDeleteAllClick = () => {
		if (deleteAllLoading || deleteDatabaseLoading) return;

		deleteAll({});
	};

	const onDeleteDatabaseClick = () => {
		if (deleteAllLoading || deleteDatabaseLoading) return;

		deleteDatabase({});
	};

	useEffect(() => {
		if (deleteAllData?.ok || deleteDatabaseData?.ok) {
			mutate(`/api/status/${id}`, null, {
				revalidate: true,
			});

			setShowDeleteModal(false);
		}
	}, [deleteAllData, deleteDatabaseData]);

	return (
		<div className="flex flex-col gap-8">
			<StatusBlock id={id} hideButtons />
			<div className="relative flex items-center justify-center w-full">
				<hr className="w-full border-slate-300" />
				<span className="absolute break-keep text-center font-medium text-slate-700 bg-white px-2">
					이 글을 삭제하시겠어요?
				</span>
			</div>
			<div className="flex flex-col gap-2">
				<Button
					text="마스토돈 글과 Mastoplace 정보 함께 삭제"
					Icon={Eraser}
					isPrimary
					isLoading={deleteAllLoading}
					onClick={onDeleteAllClick}
				/>
				<Button
					text="마스토돈 글은 남기고 Mastoplace 정보만 삭제"
					Icon={MapPinOff}
					isLoading={deleteDatabaseLoading}
					onClick={onDeleteDatabaseClick}
				/>
			</div>
		</div>
	);
}
