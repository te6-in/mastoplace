import { DefaultResponse } from "@/libs/server/response";
import { NextResponse } from "next/server";

export function POST() {
	const response = NextResponse.json<DefaultResponse>({ ok: true });

	response.cookies.delete(process.env.SESSION_COOKIE_NAME as string);

	return response;
}
