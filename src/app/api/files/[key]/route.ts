import { NextRequest, NextResponse } from "next/server";
import { getFromR2 } from "@/lib/bucket";
import { getCurrentUser } from "@/lib/auth/auth-server";
import { UPLOAD_PATH_PREFIX } from "@/lib/constants";

export const runtime = "edge";

interface RouteParams {
  params: Promise<{
    key: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login to access files" },
        { status: 401 }
      );
    }

    const { key } = await params;
    const decodedKey = decodeURIComponent(key);

    // Optional: Check if user has access to this file
    // (Only allow access to files in their own directory)
    const userPrefix = `${UPLOAD_PATH_PREFIX}/${user.id}/`;
    if (
      decodedKey.startsWith(`${UPLOAD_PATH_PREFIX}/`) &&
      !decodedKey.startsWith(userPrefix)
    ) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this file" },
        { status: 403 }
      );
    }

    const file = await getFromR2(decodedKey);

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Return the file with appropriate headers
    return new NextResponse(file.body, {
      headers: {
        "Content-Type":
          file.httpMetadata?.contentType || "application/octet-stream",
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("File retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve file" },
      { status: 500 }
    );
  }
}
