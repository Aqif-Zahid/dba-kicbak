import { cn } from "@/lib/utils";
import { Media } from "@prisma/client";
import Image from "next/image";

interface MediaPreviewProps {
  attachment: Media[];
}

export const MediaPreview = ({ attachment }: MediaPreviewProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachment.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachment.map((media, index) => {
        if (media.type === "IMAGE") {
          return (
            <div key={index}>
              <Image
                className="mx-auto size-fit max-h-[30rem] rounded-2xl"
                src={media.url}
                alt="Attachment"
                width={500}
                height={500}
              />
            </div>
          );
        }
        if (media.type === "VIDEO") {
          return (
            <div key={index}>
              <video
                src={media.url}
                controls
                className="mx-auto size-fit max-h-[30rem] rounded-2xl"
              />
            </div>
          );
        }

        return (
          <p key={index} className="text-destructive">
            Unsupported media type
          </p>
        );
      })}
    </div>
  );
};
