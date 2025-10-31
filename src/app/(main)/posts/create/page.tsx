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
import axios from "axios";

// ─────────────────────────────
// Sub-component: PollFields
// ─────────────────────────────
interface PollFieldsProps {
  pollOptions: string[];
  setPollOptions: (opts: string[]) => void;
  pollDuration: { days: number; hours: number; minutes: number };
  setPollDuration: (
    dur: { days: number; hours: number; minutes: number }
  ) => void;
  content: string;
  setContent: (val: string) => void;
  allowMultiple: boolean;
  setAllowMultiple: (val: boolean) => void;
}

const PollFields = ({
  pollOptions,
  setPollOptions,
  pollDuration,
  setPollDuration,
  content,
  setContent,
  allowMultiple,
  setAllowMultiple,
}: PollFieldsProps) => {
  const maxHours = 72;
  const totalMinutes =
    pollDuration.days * 24 * 60 +
    pollDuration.hours * 60 +
    pollDuration.minutes;
  const exceedsLimit = totalMinutes > maxHours * 60;

  const handleOptionChange = (i: number, val: string) => {
    const copy = [...pollOptions];
    copy[i] = val;
    setPollOptions(copy);
  };

  const addOption = () => {
    if (pollOptions.length < 10) setPollOptions([...pollOptions, ""]);
  };
  const removeOption = (i: number) =>
    setPollOptions(pollOptions.filter((_, idx) => idx !== i));

  const handleDurationChange = (
    field: "days" | "hours" | "minutes",
    val: number
  ) => {
    setPollDuration({ ...pollDuration, [field]: val });
  };

  return (
    <div className="space-y-4">
      {/* Poll Description */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Description (optional)
        </label>
        <Textarea
          placeholder="Describe what this poll is about..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] border-gray-300"
        />
      </div>

      <h4 className="font-medium text-sm">Poll Options</h4>
      {pollOptions.map((opt, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={opt}
            onChange={(e) => handleOptionChange(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            className="flex-1"
          />
          {pollOptions.length > 2 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeOption(i)}
            >
              ✕
            </Button>
          )}
        </div>
      ))}

      {/* ✅ Added validation message */}
      {pollOptions.filter((o) => o.trim() !== "").length < 2 && (
        <p className="text-xs text-red-600 mt-1">
          At least two options are required to create a poll.
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={pollOptions.length >= 10}
          onClick={addOption}
        >
          + Add Option
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm">Poll Duration</h4>
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <Input
              type="number"
              min={0}
              max={3}
              value={pollDuration.days}
              onChange={(e) =>
                handleDurationChange("days", Number(e.target.value))
              }
              className="w-16 text-center"
            />
            <span className="text-xs text-muted-foreground">Days</span>
          </div>
          <div className="flex flex-col items-center">
            <Input
              type="number"
              min={0}
              max={24}
              value={pollDuration.hours}
              onChange={(e) =>
                handleDurationChange("hours", Number(e.target.value))
              }
              className="w-16 text-center"
            />
            <span className="text-xs text-muted-foreground">Hours</span>
          </div>
          <div className="flex flex-col items-center">
            <Input
              type="number"
              step={5}
              min={0}
              max={60}
              value={pollDuration.minutes}
              onChange={(e) =>
                handleDurationChange("minutes", Number(e.target.value))
              }
              className="w-16 text-center"
            />
            <span className="text-xs text-muted-foreground">Minutes</span>
          </div>
        </div>
        {exceedsLimit && (
          <p className="text-xs text-red-600">
            Poll can be open for a maximum of 72 hours (3 days)
          </p>
        )}
      </div>

      {/* Allow Multiple Toggle */}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="allow-multiple"
          checked={allowMultiple}
          onChange={(e) => setAllowMultiple(e.target.checked)}
        />
        <label htmlFor="allow-multiple" className="text-sm text-gray-700">
          Allow users to vote for multiple options
        </label>
      </div>
    </div>
  );
};

// ─────────────────────────────
// Main: CreatePostPage
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

        await axios.post("/api/posts/polls/create", {
          communityId: 1,
          title: values.title,
          content: pollContent ?? "",
          options: opts,
          duration: pollDuration,
          allowMultiple,
        });

        toast.success("Poll created successfully!");
        setPollOptions(["", ""]);
        setPollDuration({ days: 0, hours: 0, minutes: 5 });
        setPollContent("");
        setAllowMultiple(false);
        resetMediaUploads();
        router.push("/");
        return;
      }

      mutation.mutate(
        {
          title: values.title,
          content: values.content ?? "",
          mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
          type: values.type,
          allowComments: values.allowComments,
        },
        {
          onSuccess: () => {
            toast.success("Post created successfully!");
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
