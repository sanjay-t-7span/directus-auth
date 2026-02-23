# NextAuth + Directus Implementation

## Files Created

### Core Authentication

- `/src/app/api/auth/[...nextauth]/route.js` - NextAuth configuration with Directus integration
- `/src/lib/directus.js` - Directus client factory
- `/src/lib/auth.js` - Server-side auth helpers
- `/src/middleware.js` - Route protection

### Components

- `/src/components/session-provider.jsx` - Client-side session wrapper
- `/src/components/login-form.jsx` - Updated with NextAuth signIn
- `/src/components/user-profile.jsx` - Example client component using session

### API Example

- `/src/app/api/items/route.js` - Protected API route example

## Environment Variables

Update `.env.local`:

```
DIRECTUS_URL=https://qa.everest.7span.in
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

## How It Works

1. User submits credentials via login form
2. NextAuth calls Directus SDK `login()` method
3. Tokens stored in JWT (access_token, refresh_token, expires)
4. On each request, JWT callback checks token expiration
5. If expired, automatically refreshes using Directus SDK
6. Session callback exposes access_token to client
7. Protected routes use middleware or `getAccessToken()` helper

## Usage Examples

### Client Component

```javascript
"use client";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session } = useSession();

  if (session?.error === "RefreshAccessTokenError") {
    // Handle expired session
  }

  // Use session.accessToken for API calls
}
```

### Server Component

```javascript
import { getSession, getAccessToken } from "@/lib/auth";

export default async function Page() {
  const session = await getSession();
  const token = await getAccessToken();

  // Use token for Directus API calls
}
```

### Protected API Route

```javascript
import { getAccessToken } from "@/lib/auth";

export async function GET() {
  const token = await getAccessToken();
  if (!token) return new Response("Unauthorized", { status: 401 });

  // Make Directus API call with token
}
```

## Next Steps

1. Update `NEXTAUTH_SECRET` in `.env.local`
2. Test login flow at `/login`
3. Replace `your_collection` in `/api/items/route.js` with actual collection name
4. Customize middleware matcher for your protected routes
