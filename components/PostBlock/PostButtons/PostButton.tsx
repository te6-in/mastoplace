import { StatusDeleteResponse } from "@/app/api/post/[id]/route";
import { Button } from "@/components/Input/Button";
import { FullPageOverlay } from "@/components/Layout/FullPageOverlay";
import { PostBlock } from "@/components/PostBlock";
import { useMutation } from "@/libs/client/useMutation";
import { j } from "@/libs/client/utils";
import { AnimatePresence } from "framer-motion";
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

interface PostButtonProps {
	type: "open" | "boost" | "like" | "bookmark" | "delete";
	id?: string | null;
}

export function PostButton({ type, id }: PostButtonProps) {
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
			<AnimatePresence>
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
			</AnimatePresence>
			<button
				className={j(
					"flex text-slate-600 dark:text-zinc-400 p-1 rounded-md transition-colors",
					type === "open"
						? "hover:bg-slate-200 active:bg-slate-300 hover:text-slate-700 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:hover:text-zinc-300"
						: "",
					type === "boost"
						? "hover:bg-emerald-100 active:bg-emerald-200 hover:text-emerald-600 dark:hover:bg-emerald-900 dark:active:bg-emerald-800 dark:hover:text-emerald-400"
						: "",
					type === "like"
						? "hover:bg-yellow-100 active:bg-yellow-200 hover:text-yellow-600 dark:hover:bg-yellow-900 dark:active:bg-yellow-800 dark:hover:text-yellow-400"
						: "",
					type === "bookmark"
						? "hover:bg-rose-100 active:bg-rose-200 hover:text-rose-600 dark:hover:bg-rose-900 dark:active:bg-rose-800 dark:hover:text-rose-400"
						: "",
					type === "delete"
						? "hover:bg-red-100 active:bg-red-200 hover:text-red-600 dark:hover:bg-red-900 dark:active:bg-red-800 dark:hover:text-red-400"
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
		useMutation<StatusDeleteResponse>(`/api/post/${id}?type=all`, "DELETE");

	const [
		deleteDatabase,
		{ data: deleteDatabaseData, isLoading: deleteDatabaseLoading },
	] = useMutation<StatusDeleteResponse>(
		`/api/post/${id}?type=database`,
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
			mutate(`/api/post/${id}`, null, {
				revalidate: true,
			});

			setShowDeleteModal(false);
		}
	}, [deleteAllData, deleteDatabaseData]);

	return (
		<div className="flex flex-col gap-8">
			<PostBlock id={id} hideButtons />
			<div className="relative flex items-center justify-center w-full">
				<hr className="w-full border-slate-300 dark:border-zinc-700" />
				<span className="absolute break-keep text-center font-medium text-slate-700 bg-slate-50 px-2 dark:bg-zinc-950 dark:text-zinc-300">
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
