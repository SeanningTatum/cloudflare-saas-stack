import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  BucketBindingError,
  BucketUploadError,
  BucketGetError,
  BucketDeleteError,
  BucketListError,
} from "@/models/errors/bucket";

interface UploadOptions {
  key?: string;
  contentType?: string;
}

/**
 * Uploads a file to the R2 bucket
 * @param file - The file data as Buffer, Uint8Array, or string
 * @param options - Upload options including optional key and contentType
 * @returns The key (path) of the uploaded file in R2
 */
export async function uploadToR2(
  file: Buffer | Uint8Array | string | File,
  options: UploadOptions = {}
): Promise<string> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!env.BUCKET) {
      throw new BucketBindingError();
    }

    // Generate a unique key if not provided
    const key = options.key ?? `uploads/${Date.now()}-${crypto.randomUUID()}`;

    // Handle File object
    let data: Buffer | Uint8Array | string;
    let contentType: string | undefined = options.contentType;

    if (file instanceof File) {
      data = Buffer.from(await file.arrayBuffer());
      contentType = contentType ?? file.type;
    } else {
      data = file;
    }

    // Upload to R2
    await env.BUCKET.put(key, data, {
      httpMetadata: contentType
        ? {
            contentType,
          }
        : undefined,
    });

    return key;
  } catch (err) {
    if (err instanceof BucketBindingError) {
      throw err;
    }
    console.error("Failed to upload to R2:", err);
    throw new BucketUploadError(
      "Failed to upload file to R2 - make sure you're running in a Cloudflare Worker context",
      err
    );
  }
}

/**
 * Gets a file from the R2 bucket
 * @param key - The key (path) of the file in R2
 * @returns The file object from R2 or null if not found
 */
export async function getFromR2(key: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!env.BUCKET) {
      throw new BucketBindingError();
    }

    return await env.BUCKET.get(key);
  } catch (err) {
    if (err instanceof BucketBindingError) {
      throw err;
    }
    console.error("Failed to get from R2:", err);
    throw new BucketGetError(
      "Failed to get file from R2 - make sure you're running in a Cloudflare Worker context",
      err
    );
  }
}

/**
 * Deletes a file from the R2 bucket
 * @param key - The key (path) of the file to delete
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!env.BUCKET) {
      throw new BucketBindingError();
    }

    await env.BUCKET.delete(key);
  } catch (err) {
    if (err instanceof BucketBindingError) {
      throw err;
    }
    console.error("Failed to delete from R2:", err);
    throw new BucketDeleteError(
      "Failed to delete file from R2 - make sure you're running in a Cloudflare Worker context",
      err
    );
  }
}

/**
 * Lists objects in the R2 bucket with optional prefix
 * @param prefix - Optional prefix to filter objects
 * @param limit - Maximum number of objects to return (default: 1000)
 */
export async function listR2Objects(prefix?: string, limit: number = 1000) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!env.BUCKET) {
      throw new BucketBindingError();
    }

    return await env.BUCKET.list({ prefix, limit });
  } catch (err) {
    if (err instanceof BucketBindingError) {
      throw err;
    }
    console.error("Failed to list R2 objects:", err);
    throw new BucketListError(
      "Failed to list R2 objects - make sure you're running in a Cloudflare Worker context",
      err
    );
  }
}
