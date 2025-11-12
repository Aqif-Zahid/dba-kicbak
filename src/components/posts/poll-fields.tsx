"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";

// ─────────────────────────────
// Validation Schema (options as objects for RHF field arrays)
// ─────────────────────────────
const pollFieldsSchema = z.object({
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .default(""),
  options: z
    .array(z.object({ value: z.string().min(1, "Poll option cannot be empty") }))
    .min(2, "At least two options are required.")
    .max(10, "A poll can have at most 10 options.")
    .default([{ value: "" }, { value: "" }]),
  duration: z
    .object({
      days: z.number().min(0).max(3).default(0),
      hours: z.number().min(0).max(23).default(0),
      minutes: z.number().min(0).max(59).default(5),
    })
    .default({ days: 0, hours: 0, minutes: 5 }),
  allowMultiple: z.boolean().default(false),
});
export type PollFieldsValues = z.infer<typeof pollFieldsSchema>;
type OptionItem = { value: string };

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
// Normalizers (bulletproof against undefined/partial items)
// ─────────────────────────────
const toOptionObjs = (arr?: string[]): OptionItem[] => {
  const src = Array.isArray(arr) ? arr : [];
  const normalized: OptionItem[] = src.map((s) => ({ value: typeof s === "string" ? s : "" }));
  // ensure at least two
  while (normalized.length < 2) normalized.push({ value: "" });
  // cap at 10 to align with schema
  return normalized.slice(0, 10);
};

const toOptionObjsFromUnknown = (arr: unknown): OptionItem[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map((o) => {
    const v = typeof (o as any)?.value === "string" ? (o as any).value : "";
    return { value: v };
  });
};

const toStrings = (arr?: OptionItem[]): string[] =>
  (Array.isArray(arr) ? arr : []).map((o) => (typeof o?.value === "string" ? o.value : ""));

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
      options: toOptionObjs(pollOptions),
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

  // Field array for poll options (stable keys)
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
    keyName: "id",
  });

  // Sync form → parent (normalize before sending up)
  useEffect(() => {
    const sub = form.watch((values) => {
      const safeOptions = toOptionObjsFromUnknown(values.options);
      setPollOptions(toStrings(safeOptions));

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
    const current = toOptionObjsFromUnknown(form.getValues("options"));
    if (current.length >= 10) {
      toast.error("You can add up to 10 options only.");
      return;
    }
    append({ value: "" });
  };

  const removeOption = (index: number) => {
    const current = toOptionObjsFromUnknown(form.getValues("options"));
    if (current.length <= 2) {
      toast.error("You must have at least two options.");
      return;
    }
    remove(index);
  };

  // Duration and limit
  const duration = form.watch("duration") ?? { days: 0, hours: 0, minutes: 5 };
  const totalMinutes =
    (duration.days ?? 0) * 24 * 60 +
    (duration.hours ?? 0) * 60 +
    (duration.minutes ?? 0);
  const exceedsLimit = totalMinutes > 72 * 60;

  const watchedOptions = toStrings(toOptionObjsFromUnknown(form.watch("options")));

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
          {fields.map((f, i) => (
            <div key={f.id} className="flex gap-2 mb-2">
              <Controller
                control={form.control}
                name={`options.${i}.value`}
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
              {fields.length > 2 && (
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
              const maxVal = unit === "days" ? 3 : unit === "hours" ? 23 : 59;
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
                            field.onChange(clamp(raw, 0, maxVal));
                          }}
                          onBlur={(e) => {
                            const raw = Number(e.target.value);
                            field.onChange(clamp(raw, 0, maxVal));
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
            <FormItem className="flex flex-row items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={Boolean(field.value)}
                  onCheckedChange={(val) => field.onChange(Boolean(val))}
                  id="allow-multiple"
                />
              </FormControl>
              <FormLabel
                htmlFor="allow-multiple"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
