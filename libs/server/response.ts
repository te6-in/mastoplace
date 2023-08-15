interface FailResponse {
	ok: false;
	error: string;
}

type SuccessResponse<T> = {
	ok: true;
} & T;

export type DefaultResponse<T> = FailResponse | SuccessResponse<T>;

export type EmptyResponse = DefaultResponse<{}>;
