const FALLBACK_API_URL = "http://localhost:3000";
const FALLBACK_SOCKET_URL = "http://localhost:3000";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_API_URL;
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? FALLBACK_SOCKET_URL;
