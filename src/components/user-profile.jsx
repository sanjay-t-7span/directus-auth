"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Not authenticated</div>;
  }

  if (session.error === "RefreshAccessTokenError") {
    return (
      <div>
        <p>Session expired. Please log in again.</p>
        <Button onClick={() => signOut()}>Sign out</Button>
      </div>
    );
  }

  return (
    <div>
      <p>Logged in as: {session.user?.email}</p>
      <Button onClick={() => signOut()}>Sign out</Button>
    </div>
  );
}
