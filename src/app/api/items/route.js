import { NextResponse } from "next/server";
import { createDirectus, rest } from "@directus/sdk";
import { getAccessToken } from "@/lib/auth";

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = createDirectus(process.env.DIRECTUS_URL).with(rest());

    const items = await client.request(() => ({
      path: "/items/your_collection",
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 },
    );
  }
}
