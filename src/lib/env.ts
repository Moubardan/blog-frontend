import "server-only";

const LOCAL_API_FALLBACK = "http://localhost:4000";

export function getApiBaseUrl() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    return apiUrl;
  }

  if (process.env.NODE_ENV === "development") {
    return LOCAL_API_FALLBACK;
  }

  throw new Error(
    "Missing API_URL. Set API_URL or NEXT_PUBLIC_API_URL for this deployment.",
  );
}