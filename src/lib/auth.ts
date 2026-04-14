import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { getApiBaseUrl } from "@/lib/env";
import type { AuthTokens, UserDTO } from "blog-shared-types";

type ProfileResponse = UserDTO & { createdAt: string };

const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

function decodeJwtExpiry(accessToken: string) {
  const payload = JSON.parse(
    Buffer.from(accessToken.split(".")[1], "base64url").toString("utf8"),
  ) as { exp?: number };

  return payload.exp ? payload.exp * 1000 : Date.now() + 15 * 60 * 1000;
}

async function fetchJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  const refreshedTokens = await fetchJson<Pick<AuthTokens, "accessToken">>(
    "/auth/refresh",
    {
      method: "POST",
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    },
  );

  if (!refreshedTokens?.accessToken) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  return {
    ...token,
    accessToken: refreshedTokens.accessToken,
    accessTokenExpires: decodeJwtExpiry(refreshedTokens.accessToken),
    error: undefined,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const tokens = await fetchJson<AuthTokens>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!tokens?.accessToken || !tokens.refreshToken) {
          return null;
        }

        const profile = await fetchJson<ProfileResponse>(
          "/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          },
        );

        if (!profile) {
          return null;
        }

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          accessTokenExpires: decodeJwtExpiry(tokens.accessToken),
        };
      },
    }),
  ],
  callbacks: {
    async authorized({ auth, request }) {
      const isProtectedRoute =
        request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/profile");

      if (isProtectedRoute) {
        return !!auth?.user && !!auth?.accessToken && !auth?.error;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        token.error = undefined;
        return token;
      }

      if (
        token.accessToken &&
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - ACCESS_TOKEN_REFRESH_BUFFER_MS
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
      }
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
});
