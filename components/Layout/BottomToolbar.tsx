import { TextFieldType } from "@/components/Input/TextInput";
import { j } from "@/libs/client/utils";
import { Loader2, LucideIcon } from "lucide-react";
import { UseFormRegisterReturn } from "react-hook-form";

interface BottomToolbarProps {
	primaryButton?: {
		icon?: LucideIcon;
		iconFill?: boolean;
		text?: string;
		isLoading: boolean;
		onClick?: () => void;
	};
	input?: {
		register: UseFormRegisterReturn;
		type: TextFieldType;
		placeholder: string;
		error?: string;
		onFormSubmit: () => void;
	};
	secondaryButtons?: {
		icon: LucideIcon;
		iconFill?: "default" | "accent";
		isLoading: boolean;
		onClick?: () => void;
	}[];
}

export function BottomToolbar({
	primaryButton,
	input,
	secondaryButtons,
}: BottomToolbarProps) {
	const Tag = input ? "form" : "div";
	const PrimaryIcon = primaryButton?.icon;

	return (
		<div className="fixed bottom-0 left-0 z-10 w-full border-t border-slate-300 border-opacity-60 bg-white bg-opacity-50 pb-[env(safe-area-inset-bottom)] shadow-upward-sm backdrop-blur sm:bottom-3 sm:left-1/2 sm:w-96 sm:translate-x-[calc(-50%+5rem)] sm:rounded-2xl sm:border sm:shadow-md">
			<Tag
				onSubmit={input?.onFormSubmit}
				className="m-3 flex h-11 items-center justify-between gap-2"
			>
				{primaryButton && (
					<button
						onClick={primaryButton.onClick}
						className={j(
							"flex h-full flex-1 items-center justify-center rounded-md bg-violet-500 font-medium text-white shadow transition-all",
							primaryButton.isLoading
								? "cursor-default opacity-60"
								: "hover:bg-violet-600 active:bg-violet-700"
						)}
					>
						{primaryButton.isLoading ? (
							<Loader2 className="animate-spin" />
						) : (
							PrimaryIcon && (
								<PrimaryIcon
									strokeWidth={primaryButton.iconFill ? 1 : undefined}
									fill={primaryButton.iconFill ? "currentColor" : "transparent"}
								/>
							)
						)}
						{primaryButton.text && (
							<span className="ml-2 mr-1">{primaryButton.text}</span>
						)}
					</button>
				)}
				{input && (
					<input
						{...input.register}
						type={input.type}
						inputMode={input.type === "number" ? "numeric" : input.type}
						placeholder={input.error ?? input.placeholder}
						className={j(
							"h-full min-w-0 flex-1 appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm",
							input.error ? "motion-safe:animate-shake" : ""
						)}
					/>
				)}
				{secondaryButtons &&
					secondaryButtons.map((secondaryButton, index) => {
						const Icon = secondaryButton.icon;
						return (
							<button
								key={index}
								onClick={secondaryButton.onClick}
								className={j(
									"flex aspect-square h-full items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm transition-all",
									secondaryButton.isLoading
										? "cursor-default opacity-60"
										: "hover:bg-slate-100 active:bg-slate-200"
								)}
							>
								{secondaryButton.isLoading ? (
									<Loader2 className="animate-spin" />
								) : (
									<Icon
										strokeWidth={secondaryButton.iconFill ? 1 : undefined}
										fill={
											secondaryButton.iconFill ? "currentColor" : "transparent"
										}
										className={
											secondaryButton.iconFill ? "text-violet-500" : ""
										}
										width={20}
										height={20}
									/>
								)}
							</button>
						);
					})}
			</Tag>
		</div>
	);
}
