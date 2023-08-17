type FailResponse<T> = {
	ok: false;
	error: string;
} & T;

type SuccessResponse<T> = {
	ok: true;
} & T;

export type DefaultResponse<T = {}, U = {}> =
	| SuccessResponse<T>
	| FailResponse<U>;
