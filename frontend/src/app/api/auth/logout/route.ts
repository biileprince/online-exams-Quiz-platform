import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/server-backend";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ message: "Logged out" });
  clearAuthCookies(response);
  return response;
}
