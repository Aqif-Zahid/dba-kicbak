import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { authOptions } from "../auth/[...nextauth]/route";

const f = createUploadthing();

export const fileRouter = {
  attachment: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
    video: {
      maxFileSize: "64MB",
      maxFileCount: 5,
    },
  })
    .middleware(async () => {
      // Validate the user session before upload
      const session = await getServerSession(authOptions);
      if (!session?.user) throw new UploadThingError("Unauthorized");

      // You can return metadata if needed
      return { user: session.user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // Save uploaded media in database
        const media = await prisma.media.create({
          data: {
            url: file.url.replace(
              "/f/",
              `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
            ),
            type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
          },
        });

        return { mediaId: media.id };
      } catch (error) {
        console.error("UploadThing error:", error);
        throw new UploadThingError("Failed to save media.");
      }
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
