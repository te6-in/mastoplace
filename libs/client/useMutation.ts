import { useState } from "react";

interface UseMutationStates<T> {
	isLoading: boolean;
	data?: T;
	error?: Error;
}

type UseMutationResult<T, U> = [(input: U) => void, UseMutationStates<T>];

export function useMutation<T, U>(
	url: string,
	type?: "POST" | "DELETE"
): UseMutationResult<T, U> {
	const [states, setStates] = useState<UseMutationStates<T>>({
		isLoading: false,
		data: undefined,
		error: undefined,
	});

	async function mutation(input: U) {
		setStates((prev) => ({ ...prev, isLoading: true }));

		await fetch(url, {
			method: type ?? "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(input),
		})
			.then((response) =>
				response.json().catch(() => {
					setStates((prev) => ({
						...prev,
						error: new Error("응답을 JSON으로 변환하는 데에 실패했습니다."),
					}));
				})
			)
			.then((data) => setStates((prev) => ({ ...prev, data })))
			.catch((error) => setStates((prev) => ({ ...prev, error })))
			.finally(() => setStates((prev) => ({ ...prev, isLoading: false })));
	}

	return [mutation, states];
}
