import { auth } from "@/auth";

export async function getSession() {
  return await auth();
}

export async function getAccessToken() {
  const session = await auth();

  if (session?.error === "RefreshAccessTokenError") {
    return null;
  }

  return session?.accessToken;
}
