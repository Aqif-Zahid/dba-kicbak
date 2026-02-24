"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { LoadingButton } from "@/components/loading-button";
import { Loader2 } from "lucide-react";
import { useDropzone } from "@uploadthing/react";
import { cn } from "@/lib/utils";
import { ClipboardEvent } from "react";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { AttachmentPreviews } from "./attachment-previews";
import { AttachmentButton } from "./attachment-button";
import { useCreatePost } from "@/services/posts/use-create-post";

export const PostEditor = () => {
  const mutation = useCreatePost();

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const { ...rootProps } = getRootProps();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What's crack-a-lackin'?",
      }),
    ],
    immediatelyRender: false,
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  const onSubmit = () => {
    mutation.mutate(
      {
        title: "asdasd",
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          resetMediaUploads();
        },
        onError: (error: any) => {
          console.error(error);
        },
      }
    );
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const files = Array.from(e.clipboardData.items)
      .filter((file) => file.kind === "file")
      .map((item) => item.getAsFile()) as File[];
    startUpload(files);
  };
  return (
    <div className="flex flex-col gap-5 rounded-md bg-card p-5 border">
      <div className="flex gap-5">
        <div {...rootProps} className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "w-full max-h-[20rem] overflow-y-auto bg-background rounded-2xl py-3 px-5 ",
              isDragActive && "outline-dashed"
            )}
            // onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>
      </div>
    </div>
  );
};
