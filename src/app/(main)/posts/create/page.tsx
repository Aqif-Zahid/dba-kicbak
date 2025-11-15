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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/utils";
import { AttachmentPreviews } from "@/components/posts/attachment-previews";
import { AttachmentButton } from "@/components/posts/attachment-button";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { useCreatePost } from "@/services/posts/use-create-post";
import { PollFields } from "@/components/posts/poll-fields";
import { useGetCommunities } from "@/services/communities/use-get-communities";

// ─────────────────────────────
// Schema
// ─────────────────────────────
const createPostSchema = z
  .object({
    communityId: z.string().min(0, "Community is required"),
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(100, "Title must not be 100 characters long"),
    content: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
    type: z.enum(["POLL", "QUESTION", "DISCUSSION"]).default("DISCUSSION"),
    allowComments: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.type !== "POLL") {
        return data.content && data.content.trim().length >= 3;
      }
      return true;
    },
    {
      message: "Description must be at least 3 characters long",
      path: ["content"],
    }
  );

type FormValues = z.infer<typeof createPostSchema>;

// ─────────────────────────────
// Component
// ─────────────────────────────
const CreatePostPage = () => {
  const router = useRouter();

  // Fetch communities
  const { data: communities, isLoading } = useGetCommunities();

  const mutation = useCreatePost();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      setError(null);

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

      mutation.mutate(
        {
          title: values.title,
          content:
            values.type === "POLL" ? pollContent ?? "" : values.content ?? "",
          mediaIds: attachments
            .map((a) => a.mediaId)
            .filter(Boolean) as string[],
          type: values.type,
          communityId: Number(values.communityId),
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
            const message = getErrorMessage(err);
            if (message.includes("Description must be")) {
              form.setError("content", { message });
            } else if (message.includes("Title must")) {
              form.setError("title", { message });
            } else {
              setError(message);
            }
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
        <div className="flex justify-center w-full md:px-20 px-5 py-10 rounded-2xl bg-card shadow-sm">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-full"
            >
              <h2 className="font-bold text-2xl">Create a New Post</h2>

              <div className="flex flex-col gap-6">
                {/* Title + Post Type side by side */}

                <FormField
                  name="communityId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Community <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 text-sm">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {communities &&
                            communities.data.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Title field */}
                  <div className="w-full md:w-1/2">
                    <FormField
                      name="title"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Title <span className="text-red-900">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter title"
                              className="h-10 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Post Type using Shadcn Select */}
                  <div className="w-full md:w-1/2">
                    <FormField
                      name="type"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DISCUSSION">
                                Discussion
                              </SelectItem>
                              <SelectItem value="QUESTION">Question</SelectItem>
                              <SelectItem value="POLL">Poll</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Description */}
                {form.watch("type") !== "POLL" && (
                  <FormField
                    name="content"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
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

                {/* Poll Fields */}
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

                {/* Disable comments (Shadcn checkbox) */}
                <FormField
                  name="allowComments"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={!field.value}
                          onCheckedChange={(val) => field.onChange(!val)}
                          id="disableComments"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="disableComments"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Disable comments
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Attachments */}
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

              {/* Error Message */}
              {error && (
                <div className="flex items-center text-red-600 text-sm gap-2">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              {/* Submit Button */}
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
