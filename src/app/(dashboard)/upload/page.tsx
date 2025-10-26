import { R2Upload } from "@/components/r2-upload";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">R2 File Upload</h1>
          <Link href="/">
            <Button variant="outline">Back Home</Button>
          </Link>
        </div>

        <p className="text-gray-600 dark:text-gray-400">
          Upload files directly to Cloudflare R2 storage with drag-and-drop support.
        </p>

        <R2Upload />

        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <p className="font-medium">Features:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Drag and drop file upload</li>
            <li>Direct upload to Cloudflare R2</li>
            <li>Automatic file type detection</li>
            <li>10MB file size limit</li>
            <li>Immediate file preview links</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

