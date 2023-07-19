import { useState } from "react";

interface UseMutationStates<T> {
	isLoading: boolean;
	data?: T;
	error?: Error;
}

type UseMutationResult<T> = [(input: unknown) => void, UseMutationStates<T>];

export function useMutation<T>(url: string): UseMutationResult<T> {
	const [states, setStates] = useState<UseMutationStates<T>>({
		isLoading: false,
		data: undefined,
		error: undefined,
	});

	function mutation(input: unknown) {
		setStates((prev) => ({ ...prev, isLoading: true }));

		fetch(url, {
			method: "POST",
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
