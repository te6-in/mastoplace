import { StatusDeleteResponse } from "@/app/api/post/[id]/route";
import { Button } from "@/components/Input/Button";
import { FullPageOverlay } from "@/components/Layout/FullPageOverlay";
import { PostBlock, PostBlockPost } from "@/components/PostBlock";
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
import useTranslation from "next-translate/useTranslation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSWRConfig } from "swr";

interface PostButtonProps {
	type: "open" | "boost" | "like" | "bookmark" | "delete";
	deleteInfo?: {
		id: string;
		clientServer: string;
		clientHandle: string;
		postBlock: PostBlockPost;
	};
}

export function PostButton({ type, deleteInfo }: PostButtonProps) {
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const { t } = useTranslation();

	const Icon = {
		open: ArrowUpRightSquare,
		boost: Rocket,
		like: Star,
		bookmark: Bookmark,
		delete: Trash2,
	}[type];

	const label = {
		open: t("accessibility.action.post.open"),
		boost: t("accessibility.action.post.boost"),
		like: t("accessibility.action.post.like"),
		bookmark: t("accessibility.action.post.bookmark"),
		delete: t("accessibility.action.post.delete"),
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
				{showDeleteModal && deleteInfo && (
					<FullPageOverlay
						type="close"
						closeOrBackEvent="post-delete-nevermind"
						buttonLabel={t("post.delete.close-form")}
						component={
							<DeleteModal
								setShowDeleteModal={setShowDeleteModal}
								id={deleteInfo.id}
								postBlock={deleteInfo.postBlock}
								clientServer={deleteInfo.clientServer}
								clientHandle={deleteInfo.clientHandle}
							/>
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
				data-umami-event={`post-${type}`}
			>
				<Icon />
			</button>
		</>
	);
}

interface DeleteModalProps {
	id: string;
	postBlock: PostBlockPost;
	clientServer: string;
	clientHandle: string;
	setShowDeleteModal: Dispatch<SetStateAction<boolean>>;
}

function DeleteModal({
	postBlock,
	id,
	clientServer,
	clientHandle,
	setShowDeleteModal,
}: DeleteModalProps) {
	const { t } = useTranslation();
	const [deleteAll, { data: deleteAllData, isLoading: deleteAllLoading }] =
		useMutation<StatusDeleteResponse, {}>(`/api/post/${id}?type=all`, "DELETE");

	const [
		deleteDatabase,
		{ data: deleteDatabaseData, isLoading: deleteDatabaseLoading },
	] = useMutation<StatusDeleteResponse, {}>(
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
		if (
			(deleteAllData && deleteAllData.ok) ||
			(deleteDatabaseData && deleteDatabaseData.ok)
		) {
			mutate(`/api/post/${id}`, null, {
				revalidate: true,
			});

			mutate("/api/post", null, {
				revalidate: true,
			});

			mutate("/api/post/my", null, {
				revalidate: true,
			});

			setShowDeleteModal(false);
		}
	}, [deleteAllData, deleteDatabaseData, id, mutate, setShowDeleteModal]);

	return (
		<div className="flex flex-col gap-8">
			<PostBlock
				preventInteraction
				post={postBlock}
				clientServer={clientServer}
				clientHandle={clientHandle}
			/>
			<div className="relative flex items-center justify-center w-full">
				<hr className="w-full border-slate-300 dark:border-zinc-700" />
				<span className="absolute break-keep text-center font-medium text-slate-700 bg-slate-50 px-2 dark:bg-zinc-950 dark:text-zinc-300">
					{t("post.delete.title")}
				</span>
			</div>
			<div className="flex flex-col gap-2">
				<Button
					text={t("post.delete.button.delete-all")}
					Icon={Eraser}
					isPrimary
					isLoading={deleteAllLoading}
					onClick={onDeleteAllClick}
					event="post-delete-all"
				/>
				<Button
					text={t("post.delete.button.keep-mastodon-post")}
					Icon={MapPinOff}
					isLoading={deleteDatabaseLoading}
					onClick={onDeleteDatabaseClick}
					event="post-delete-database"
				/>
			</div>
		</div>
	);
}
