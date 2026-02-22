import type { FileRouter } from "uploadthing/next";

// Frontend only needs the shape; the actual router lives in apps/api.
export type AppFileRouter = FileRouter;
