"use client";

import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/utils";
import { PostEditor } from "@/components/posts/post-editor";
import { AttachmentPreviews } from "@/components/posts/attachment-previews";
import { AttachmentButton } from "@/components/posts/attachment-button";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { useCreatePost } from "@/services/posts/use-create-post";

const CreatePostPage = () => {
  const router = useRouter();
  const mutation = useCreatePost();

  const createPostSchema = z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(100, "Title must not be 100 characters long"),
    content: z
      .string()
      .min(3, "Content must be at least 3 characters long")
      .max(500, "Content must not be 500 characters long"),
  });

  type FormValues = z.infer<typeof createPostSchema>;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(createPostSchema) as Resolver<FormValues>,
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload();

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      setError(null);
      mutation.mutate(
        {
          title: values.title,
          content: values.content,
          mediaIds: attachments
            .map((a) => a.mediaId)
            .filter(Boolean) as string[],
        },
        {
          onSuccess: () => {
            toast.success("Post created successfully!");
            resetMediaUploads();
            router.push("/");
          },
          onError: (error: any) => {
            setError(getErrorMessage(error) || "Failed to create post");
          },
        }
      );
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="pb-20 max-w-2xl mx-auto">
      <div className="flex flex-col gap-y-4 w-full">
        {/* <PostEditor /> */}
        <div className="flex justify-center w-full md:px-20 px-5 py-10 rounded-2xl bg-card shadow-sm">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-full"
            >
              <h2 className="font-bold text-2xl"> Create a New Post</h2>
              <div className="flex flex-col gap-6">
                <FormField
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Title <span className="text-red-900">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormField
                    name="content"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Content <span className="text-red-900">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Share your thoughts..."
                            className="min-h-[150px] border-gray-300"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <p className="text-sm font-medium">Attachments</p>

                {!!attachments.length && (
                  <AttachmentPreviews
                    attachments={attachments}
                    removeAttachment={removeAttachment}
                  />
                )}
                <div className="flex justify-end gap-3 items-center">
                  {isUploading && (
                    <>
                      <span className="text-sm">{uploadProgress ?? 0}</span>
                      <Loader2 className="size-5 animate-spin text-primary" />
                    </>
                  )}
                  <AttachmentButton
                    onFilesSelected={startUpload}
                    disabled={isUploading || attachments.length > 5}
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center text-red-600 text-sm gap-2">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}
              <div className="flex items-center justify-center">
                <Button
                  type="submit"
                  size="lg"
                  className="px-20"
                  disabled={loading || isUploading || mutation.isPending}
                >
                  {loading || mutation.isPending ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                  ) : (
                    "Create Post"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default CreatePostPage;
