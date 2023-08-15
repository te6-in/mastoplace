import { EmptyResponse } from "@/libs/server/response";
import { NextResponse } from "next/server";

export type LogOutResponse = EmptyResponse;

export function POST() {
	const response = NextResponse.json<LogOutResponse>({ ok: true });

	response.cookies.delete(process.env.SESSION_COOKIE_NAME as string);

	return response;
}
