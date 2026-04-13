import "server-only";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type {
  ApiErrorResponse,
  PaginatedResponse,
  PostDTO,
  UserDTO,
} from "blog-shared-types";

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: ApiErrorResponse | Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getApiBaseUrl() {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000"
  );
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function request<T>(
  path: string,
  init?: NextFetchInit,
  options?: { accessToken?: string; redirectOn401?: boolean },
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(options?.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
      ...(init?.headers || {}),
    },
  });

  if (response.status === 401 && options?.redirectOn401) {
    redirect("/login");
  }

  if (!response.ok) {
    const payload = await parseResponse<ApiErrorResponse | Record<string, unknown>>(
      response,
    );
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? Array.isArray(payload.message)
          ? payload.message.join(", ")
          : String(payload.message)
        : `API request failed with status ${response.status}`;

    throw new ApiError(message, response.status, payload);
  }

  return parseResponse<T>(response);
}

export function publicApiRequest<T>(path: string, init?: NextFetchInit) {
  return request<T>(path, init);
}

export async function authenticatedApiRequest<T>(
  path: string,
  init?: NextFetchInit,
) {
  const session = await auth();

  if (!session?.accessToken || session.error) {
    redirect("/login");
  }

  return request<T>(path, init, {
    accessToken: session.accessToken,
    redirectOn401: true,
  });
}

export function mapPostSummary(post: PostDTO) {
  return {
    ...post,
    excerpt: post.excerpt ?? null,
    createdAt: new Date(post.createdAt),
  };
}

export function mapPostDetail(post: PostDTO) {
  return {
    ...post,
    excerpt: post.excerpt ?? null,
    createdAt: new Date(post.createdAt),
    updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
    comments:
      post.comments?.map((comment) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
      })) ?? [],
  };
}

export type PublicPostsResponse = PaginatedResponse<PostDTO>;
export type ProfileResponse = UserDTO & { createdAt: string };