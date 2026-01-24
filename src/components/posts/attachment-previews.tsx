import { cn } from "@/lib/utils";
import { SingleAttachmentPreview } from "./single-attachment-preview";

interface AttachmentPreviewsProps {
  attachments: {
    file: File;
    mediaId?: string;
    isUploading: boolean;
  }[];
  removeAttachment: (fileName: string) => void;
}

export const AttachmentPreviews = ({
  attachments,
  removeAttachment,
}: AttachmentPreviewsProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments.map((attachment, index) => (
        <SingleAttachmentPreview
          key={index}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
};
