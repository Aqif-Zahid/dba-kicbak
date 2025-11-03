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
import { AttachmentPreviews } from "@/components/posts/attachment-previews";
import { AttachmentButton } from "@/components/posts/attachment-button";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { useCreatePost } from "@/services/posts/use-create-post";
import { PollFields } from "@/components/posts/poll-fields";

// ─────────────────────────────
// Schema
// ─────────────────────────────
const createPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must not be 100 characters long"),
  content: z.string().max(500).optional(),
  type: z.enum(["POLL", "QUESTION", "DISCUSSION"]).default("DISCUSSION"),
  allowComments: z.boolean().default(true),
});

type FormValues = z.infer<typeof createPostSchema>;

// ─────────────────────────────
// Component
// ─────────────────────────────
const CreatePostPage = () => {
  const router = useRouter();
  const mutation = useCreatePost();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll-specific state
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDuration, setPollDuration] = useState({
    days: 0,
    hours: 0,
    minutes: 5,
  });
  const [pollContent, setPollContent] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createPostSchema) as Resolver<FormValues>,
    defaultValues: {
      title: "",
      content: "",
      type: "DISCUSSION",
      allowComments: true,
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

  // ─────────────────────────────
  // Unified onSubmit
  // ─────────────────────────────
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      setError(null);

      // Validate poll logic (frontend only)
      if (values.type === "POLL") {
        const opts = pollOptions.filter((o) => o.trim() !== "");
        const totalMinutes =
          pollDuration.days * 24 * 60 +
          pollDuration.hours * 60 +
          pollDuration.minutes;

        if (opts.length < 2) {
          toast.error("Polls require at least 2 options.");
          setLoading(false);
          return;
        }
        if (totalMinutes <= 0 || totalMinutes > 72 * 60) {
          toast.error("Poll duration must be between 5 minutes and 72 hours.");
          setLoading(false);
          return;
        }
      }

      // Unified mutation for all post types
      mutation.mutate(
        {
          title: values.title,
          content:
            values.type === "POLL"
              ? pollContent ?? ""
              : values.content ?? "",
          mediaIds: attachments
            .map((a) => a.mediaId)
            .filter(Boolean) as string[],
          type: values.type,
          allowComments: values.allowComments,
          options: values.type === "POLL" ? pollOptions : undefined,
          duration: values.type === "POLL" ? pollDuration : undefined,
          allowMultiple: values.type === "POLL" ? allowMultiple : undefined,
        },
        {
          onSuccess: () => {
            toast.success("Post created successfully!");
            setPollOptions(["", ""]);
            setPollDuration({ days: 0, hours: 0, minutes: 5 });
            setPollContent("");
            setAllowMultiple(false);
            resetMediaUploads();
            router.push("/");
          },
          onError: (err: any) => {
            setError(getErrorMessage(err) || "Failed to create post");
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

  // ─────────────────────────────
  // Render
  // ─────────────────────────────
  return (
    <section className="pb-20 max-w-2xl mx-auto">
      <div className="flex flex-col gap-y-4 w-full">
        <div className="flex justify-center w-full md:px-20 px-5 py-10 rounded-2xl bg-card shadow-sm">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-full"
            >
              <h2 className="font-bold text-2xl">Create a New Post</h2>

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

                {form.watch("type") !== "POLL" && (
                  <FormField
                    name="content"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
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
                )}

                <FormField
                  name="type"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Type</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="border rounded-md px-3 py-2 text-sm"
                        >
                          <option value="DISCUSSION">Discussion</option>
                          <option value="QUESTION">Question</option>
                          <option value="POLL">Poll</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("type") === "POLL" && (
                  <PollFields
                    pollOptions={pollOptions}
                    setPollOptions={setPollOptions}
                    pollDuration={pollDuration}
                    setPollDuration={setPollDuration}
                    content={pollContent}
                    setContent={setPollContent}
                    allowMultiple={allowMultiple}
                    setAllowMultiple={setAllowMultiple}
                  />
                )}

                <FormField
                  name="allowComments"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!field.value}
                          onChange={(e) => field.onChange(!e.target.checked)}
                        />
                        Disable comments
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  disabled={
                    loading ||
                    isUploading ||
                    mutation.isPending ||
                    (form.watch("type") === "POLL" &&
                      pollOptions.filter((o) => o.trim() !== "").length < 2)
                  }
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
