import { generateReactHelpers } from "@uploadthing/react";
import type { AppFileRouter } from "@/types/uploadthing";

/**
 * Client helpers for UploadThing.
 * Route is served from the API app and proxied through Next rewrites.
 */
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<AppFileRouter>({
    url: "/api/uploadthing",
  });
