import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createDirectus, rest, authentication } from "@directus/sdk";

async function refreshAccessToken(token) {
  try {
    const response = await fetch(`${process.env.DIRECTUS_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: token.refreshToken,
        mode: "json",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    return {
      ...token,
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token ?? token.refreshToken,
      expiresAt: Date.now() + data.data.expires,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          const client = createDirectus(process.env.DIRECTUS_URL)
            .with(authentication("json"))
            .with(rest());

          const response = await client.login({
            email: credentials.email,
            password: credentials.password,
          });

          return {
            id: "user",
            email: credentials.email,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            expiresAt: Date.now() + response.expires,
          };
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: user.expiresAt,
        };
      }

      if (Date.now() < token.expiresAt) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.error) {
        session.error = token.error;
      }

      session.accessToken = token.accessToken;
      session.user = {
        ...session.user,
        email: token.email,
      };

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: true,
});
