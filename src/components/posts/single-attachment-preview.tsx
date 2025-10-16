import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";

interface SingleAttachmentPreviewProps {
  attachment: {
    file: File;
    mediaId?: string;
    isUploading: boolean;
  };
  onRemoveClick: () => void;
}

export const SingleAttachmentPreview = ({
  attachment,
  onRemoveClick,
}: SingleAttachmentPreviewProps) => {
  const src = URL.createObjectURL(attachment.file);
  return (
    <div
      className={cn(
        "relative mx-auto size-fit",
        attachment.isUploading && "opacity-50"
      )}
    >
      {attachment.file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="Attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem] rounded-2xl">
          <source src={src} type={attachment.file.type} />
        </video>
      )}
      {!attachment.isUploading && (
        <button onClick={onRemoveClick}>
          <X
            size={20}
            className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60 "
          />
        </button>
      )}
    </div>
  );
};
