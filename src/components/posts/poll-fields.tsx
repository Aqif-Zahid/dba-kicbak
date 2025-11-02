"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

// ─────────────────────────────
// Validation Schema
// ─────────────────────────────
const pollFieldsSchema = z.object({
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .default(""),
  options: z
    .array(z.string().min(1, "Poll option cannot be empty"))
    .min(2, "At least two options are required.")
    .max(10, "A poll can have at most 10 options.")
    .default(["", ""]),
  duration: z
    .object({
      days: z.number().min(0).max(3).default(0),
      hours: z.number().min(0).max(23).default(0), // ⬅ capped at 23
      minutes: z.number().min(0).max(59).default(5), // ⬅ capped at 59
    })
    .default({ days: 0, hours: 0, minutes: 5 }),
  allowMultiple: z.boolean().default(false),
});
export type PollFieldsValues = z.infer<typeof pollFieldsSchema>;

// ─────────────────────────────
// Clamp Helper
// ─────────────────────────────
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));

// ─────────────────────────────
// Props
// ─────────────────────────────
interface PollFieldsProps {
  pollOptions: string[];
  setPollOptions: (opts: string[]) => void;
  pollDuration: { days: number; hours: number; minutes: number };
  setPollDuration: (dur: { days: number; hours: number; minutes: number }) => void;
  content: string;
  setContent: (val: string) => void;
  allowMultiple: boolean;
  setAllowMultiple: (val: boolean) => void;
}

// ─────────────────────────────
// Component
// ─────────────────────────────
export const PollFields = ({
  pollOptions,
  setPollOptions,
  pollDuration,
  setPollDuration,
  content,
  setContent,
  allowMultiple,
  setAllowMultiple,
}: PollFieldsProps) => {
  // Safe defaults for parent → form
  const defaultValues: PollFieldsValues = useMemo(
    () => ({
      description: content ?? "",
      options: (pollOptions ?? ["", ""]).map((o) => o ?? ""),
      duration: {
        days: pollDuration?.days ?? 0,
        hours: pollDuration?.hours ?? 0,
        minutes: pollDuration?.minutes ?? 5,
      },
      allowMultiple: !!allowMultiple,
    }),
    [content, pollOptions, pollDuration, allowMultiple]
  );

  const form = useForm<PollFieldsValues>({
    resolver: zodResolver(pollFieldsSchema),
    defaultValues,
    mode: "onChange",
  });

  // Sync form → parent (force non-undefined values)
  useEffect(() => {
    const sub = form.watch((values) => {
      const opts = (values.options ?? []).map((o) => o ?? "");
      setPollOptions(opts);

      const d = values.duration ?? { days: 0, hours: 0, minutes: 5 };
      setPollDuration({
        days: d.days ?? 0,
        hours: d.hours ?? 0,
        minutes: d.minutes ?? 5,
      });

      setContent(values.description ?? "");
      setAllowMultiple(Boolean(values.allowMultiple));
    });
    return () => sub.unsubscribe();
  }, [form, setPollOptions, setPollDuration, setContent, setAllowMultiple]);

  // Handlers
  const addOption = () => {
    const options = (form.getValues("options") ?? []).map((o) => o ?? "");
    if (options.length >= 10) {
      toast.error("You can add up to 10 options only.");
      return;
    }
    form.setValue("options", [...options, ""]);
  };

  const removeOption = (index: number) => {
    const options = (form.getValues("options") ?? []).map((o) => o ?? "");
    form.setValue("options", options.filter((_, i) => i !== index));
  };

  // Duration and limit
  const duration = form.watch("duration") ?? { days: 0, hours: 0, minutes: 5 };
  const totalMinutes =
    (duration.days ?? 0) * 24 * 60 +
    (duration.hours ?? 0) * 60 +
    (duration.minutes ?? 0);
  const exceedsLimit = totalMinutes > 72 * 60;

  // ─────────────────────────────
  // Render
  // ─────────────────────────────
  const watchedOptions = (form.watch("options") ?? []).map((o) => o ?? "");

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this poll is about..."
                  className="min-h-[100px] border-gray-300"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ?? "")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Poll Options */}
        <div>
          <h4 className="font-medium text-sm mb-2">Poll Options</h4>
          {watchedOptions.map((opt, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Controller
                control={form.control}
                name={`options.${i}` as const}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ?? "")}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1"
                  />
                )}
              />
              {watchedOptions.length > 2 && (
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

          {/* Array-level validation message */}
          <FormField
            control={form.control}
            name="options"
            render={() => (
              <FormItem className="mt-1">
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={watchedOptions.length >= 10}
              onClick={addOption}
            >
              + Add Option
            </Button>
          </div>
        </div>

        {/* Poll Duration */}
        <div>
          <h4 className="font-medium text-sm mb-2">Poll Duration</h4>
          <div className="flex gap-3">
            {(["days", "hours", "minutes"] as const).map((unit) => {
              const maxVal =
                unit === "days" ? 3 : unit === "hours" ? 23 : 59;
              const step = unit === "minutes" ? 5 : 1;

              return (
                <FormField
                  key={unit}
                  control={form.control}
                  name={`duration.${unit}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={maxVal}
                          step={step}
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const raw = Number(e.target.value);
                            const next = clamp(raw, 0, maxVal);
                            field.onChange(next);
                          }}
                          onBlur={(e) => {
                            const raw = Number(e.target.value);
                            const next = clamp(raw, 0, maxVal);
                            field.onChange(next);
                          }}
                          className="w-16 text-center"
                        />
                      </FormControl>
                      <span className="text-xs text-muted-foreground capitalize">
                        {unit}
                      </span>
                    </FormItem>
                  )}
                />
              );
            })}
          </div>
          {exceedsLimit && (
            <p className="text-xs text-red-600 mt-2">
              Poll can be open for a maximum of 72 hours (3 days)
            </p>
          )}
        </div>

        {/* Allow Multiple */}
        <FormField
          control={form.control}
          name="allowMultiple"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input
                  type="checkbox"
                  id="allow-multiple"
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              </FormControl>
              <FormLabel
                htmlFor="allow-multiple"
                className="text-sm text-gray-700"
              >
                Allow users to vote for multiple options
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
};
