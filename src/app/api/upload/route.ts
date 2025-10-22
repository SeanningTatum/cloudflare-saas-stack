import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/bucket";
import { getCurrentUser } from "@/lib/auth/auth-server";
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  UPLOAD_PATH_PREFIX,
} from "@/lib/constants";
import { generateFileKey } from "@/lib/utils";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login to upload files" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit` },
        { status: 400 }
      );
    }

    const key = generateFileKey({
      filename: file.name,
      userId: user.id,
      pathPrefix: UPLOAD_PATH_PREFIX,
    });

    const uploadedKey = await uploadToR2(file, {
      key,
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      key: uploadedKey,
      url: `/api/files/${encodeURIComponent(uploadedKey)}`,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
